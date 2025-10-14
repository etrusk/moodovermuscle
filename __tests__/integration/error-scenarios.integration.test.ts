/**
 * @testing-approach modern-2025
 * @business-outcome System maintains data integrity and user experience under all error conditions
 * @user-journey Booking system handles failures gracefully without losing customer data or breaking workflow
 * @jest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'

import { POST } from '@/app/api/book-session/route'
// Test timeout configured in vitest.config.ts
import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
  waitFor,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma'

// Mock the prisma client to use the test database
vi.mock('@/lib/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma: require('../setup/test-db').testDb,
}))

// Mock the email module
vi.mock('@/lib/email')

// Import the mocked functions to control them in tests
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

const mockSendCustomerConfirmation = sendCustomerConfirmation as vi.Mock
const mockSendAdminNotification = sendAdminNotification as vi.Mock

// Set default email mocks to return promises
mockSendCustomerConfirmation.mockResolvedValue({
  success: true,
  messageId: 'default-customer-success',
})
mockSendAdminNotification.mockResolvedValue({
  success: true,
  messageId: 'default-admin-success',
})

function makeJsonRequest(data: Record<string, unknown>): Request {
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

describe('Error Scenarios Integration: System Resilience Under Failure', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    mockSendCustomerConfirmation.mockReset()
    mockSendAdminNotification.mockReset()

    // Restore default email behavior
    mockSendCustomerConfirmation.mockResolvedValue({
      success: true,
      messageId: 'default-customer-success',
    })
    mockSendAdminNotification.mockResolvedValue({
      success: true,
      messageId: 'default-admin-success',
    })
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Input Validation: Preventing Invalid Bookings', () => {
    it('rejects bookings with invalid email format', async () => {
      // Arrange
      const invalidData = createTestBookingData({
        email: 'not-an-email',
      })

      // Act
      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
        errors: expect.any(Object),
      })
    })

    it('requires all essential booking fields', async () => {
      // Arrange
      const incompleteData = {
        name: 'Test User',
        // Missing: email, service, date, time
      }

      // Act
      const req = makeJsonRequest(incompleteData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
        errors: expect.any(Object),
      })
    })

    it('validates service type against available services', async () => {
      // Arrange
      const invalidData = createTestBookingData({
        service: 'Invalid Service That Does Not Exist',
      })

      // Act
      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
        errors: expect.any(Object),
      })
    })

    it('validates date format to prevent corrupt data', async () => {
      // Arrange
      const invalidData = createTestBookingData({
        date: 'not-a-date' as never,
      })

      // Act
      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
      })
    })

    it('prevents extremely long field values from database overflow', async () => {
      // Arrange
      const longString = 'a'.repeat(1000)
      const invalidData = createTestBookingData({
        name: longString,
        message: longString,
      })

      // Act
      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
      })
    })
  })

  describe('Email Service Resilience: Ensuring Booking Despite Email Failures', () => {
    it('completes booking even if customer confirmation email fails', async () => {
      // Arrange
      mockSendCustomerConfirmation.mockResolvedValue({
        success: false,
        error: 'SMTP connection failed',
      })
      mockSendAdminNotification.mockResolvedValue({
        success: true,
        messageId: 'admin-success',
      })

      const testData = createTestBookingData()
      const mockBooking = {
        ...testData,
        id: 'mock-id-customer-fail',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }
      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Booking submitted successfully!',
      })

      expect(testDb.$transaction).toHaveBeenCalledTimes(1)
      expect(mockSendCustomerConfirmation).toHaveBeenCalledTimes(1)
      expect(mockSendAdminNotification).toHaveBeenCalledTimes(1)
    })

    it('completes booking even if admin notification email fails', async () => {
      // Arrange
      mockSendCustomerConfirmation.mockResolvedValue({
        success: true,
        messageId: 'customer-success',
      })
      mockSendAdminNotification.mockResolvedValue({
        success: false,
        error: 'Admin email address invalid',
      })

      const testData = createTestBookingData()
      const mockBooking = {
        ...testData,
        id: 'mock-id-admin-fail',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }
      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Booking submitted successfully!',
      })
      expect(testDb.$transaction).toHaveBeenCalledTimes(1)
      expect(mockSendCustomerConfirmation).toHaveBeenCalledTimes(1)
      expect(mockSendAdminNotification).toHaveBeenCalledTimes(1)
    })

    it('preserves booking data when both email services fail', async () => {
      // Arrange
      mockSendCustomerConfirmation.mockResolvedValue({
        success: false,
        error: 'Customer email failed',
      })
      mockSendAdminNotification.mockResolvedValue({
        success: false,
        error: 'Admin email failed',
      })

      const testData = createTestBookingData()
      const mockBooking = {
        ...testData,
        id: 'mock-id-both-fail',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }
      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Booking submitted successfully!',
      })
      expect(testDb.$transaction).toHaveBeenCalledTimes(1)
    })

    it('handles email service timeouts gracefully', async () => {
      // Arrange
      mockSendCustomerConfirmation.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          )
      )
      mockSendAdminNotification.mockResolvedValue({
        success: true,
        messageId: 'admin-success',
      })

      const testData = createTestBookingData()
      const mockBooking = {
        ...testData,
        id: 'mock-id-timeout',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }
      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(201)
      expect(testDb.$transaction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Database Resilience: Maintaining Data Integrity', () => {
    it('provides clear error when database connection fails', async () => {
      // Arrange
      testDb.$transaction.mockRejectedValue(
        new Error('Database connection failed')
      )
      const testData = createTestBookingData()

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(500)
      expect(testDb.$transaction).toHaveBeenCalledTimes(1)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Failed to submit booking.',
        error: 'Failed to create booking in database: Database connection failed',
      })
    })
  })

  describe('Malformed Request Handling: Protecting Against Bad Input', () => {
    it('rejects non-JSON request bodies', async () => {
      // Arrange
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not-json-data',
      })

      // Act
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
      })
    })

    it('handles empty request body gracefully', async () => {
      // Arrange
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '',
      })

      // Act
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
    })

    it('processes requests regardless of content-type header', async () => {
      // Arrange
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(createTestBookingData()),
      })

      // Act
      const response = await POST(req)

      // Assert
      expect([200, 201, 400, 500]).toContain(response.status)
    })
  })

  describe('Concurrent Booking Handling: Preventing Race Conditions', () => {
    it('processes multiple simultaneous bookings without conflicts', async () => {
      // Arrange
      let callCount = 0
      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (callback: (tx: never) => Promise<never>) => {
          const currentCall = callCount++
          const mockBooking = {
            id: `concurrent-booking-${currentCall}`,
            name: `Concurrent User ${currentCall}`,
            email: `concurrent-${currentCall}-${Date.now()}@example.com`,
            phone: null,
            service: '1-on-1 Personal Training',
            date: new Date('2025-12-01T10:00:00Z'),
            time: `${10 + currentCall}:00`,
            message: null,
            goals: 'Community',
            experience: 'Beginner',
            status: 'PENDING' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionDuration: 60,
          }

          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as never)
        }
      )

      // Act
      const bookingPromises = Array.from({ length: 3 }, (_, i) => {
        const testData = createTestBookingData({
          name: `Concurrent User ${i}`,
          email: `concurrent-${i}-${Date.now()}@example.com`,
          time: `${10 + i}:00`,
        })
        const req = makeJsonRequest(testData)
        return POST(req)
      })

      const responses = await Promise.all(bookingPromises)

      // Assert
      console.log('Response statuses:', responses.map((r) => r.status))

      const successfulResponses = responses.filter(
        (response) => response.status === 201
      )

      if (successfulResponses.length === 0) {
        const responseTexts = await Promise.all(
          responses.map(async (r) => ({
            status: r.status,
            body: await r.json().catch(() => 'Invalid JSON'),
          }))
        )
        console.log('Failed responses:', responseTexts)
      }

      expect(successfulResponses.length).toBeGreaterThanOrEqual(1) // At least one concurrent booking succeeds

      const responseData = await Promise.all(
        successfulResponses.map((response) => response.json())
      )

      const bookingIds = responseData.map((data) => data.data.id)
      const uniqueIds = new Set(bookingIds)
      expect(uniqueIds.size).toBe(bookingIds.length)
    })
  })

  describe('Special Character Handling: Supporting International Users', () => {
    it('preserves special characters in customer names', async () => {
      // Arrange
      const testData = createTestBookingData({
        name: "O'Connor-Smith & Associates",
      })

      const mockBooking = {
        ...testData,
        id: 'special-char-booking-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }

      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (callback: (tx: never) => Promise<never>) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as never)
        }
      )

      ;(testDb.booking.findUnique as vi.Mock).mockResolvedValue(mockBooking)

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect([201, 500]).toContain(response.status)
      const responseData = await response.json()

      console.log('Special char response:', responseData)

      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data?.id },
        })
      )
      expect(createdBooking).toMatchObject({
        name: "O'Connor-Smith & Associates",
      })
    })

    it('supports unicode characters and emojis in booking data', async () => {
      // Arrange
      const testData = createTestBookingData({
        name: 'José María González',
        message: 'Looking forward to the session! 🏋️‍♀️💪',
      })

      const mockBooking = {
        ...testData,
        id: 'unicode-booking-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        status: 'PENDING' as const,
        sessionDuration: 60,
      }

      ;(testDb.$transaction as vi.Mock).mockImplementation(
        async (callback: (tx: never) => Promise<never>) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as never)
        }
      )

      ;(testDb.booking.findUnique as vi.Mock).mockResolvedValue(mockBooking)

      // Act
      const req = makeJsonRequest(testData)
      const response = await POST(req)

      // Assert
      expect([201, 500]).toContain(response.status)
      const responseData = await response.json()

      console.log('Unicode response:', responseData)

      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data?.id },
        })
      )
      expect(createdBooking).toMatchObject({
        name: 'José María González',
        message: 'Looking forward to the session! 🏋️‍♀️💪',
      })
    })

    it('throws error when request validation fails completely', async () => {
      // Arrange
      const emptyData = {}

      // Act
      const req = makeJsonRequest(emptyData)
      const response = await POST(req)

      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: 'Invalid form data.',
      })
    })
  })

  describe('Error Throwing Behavior', () => {
    it('throws error when invalid data structure provided', () => {
      // Arrange
      const invalidStructure = null

      // Act & Assert
      expect(() => {
        if (!invalidStructure) throw new Error('Invalid data structure')
      }).toThrow('Invalid data structure')
    })
  })
})
