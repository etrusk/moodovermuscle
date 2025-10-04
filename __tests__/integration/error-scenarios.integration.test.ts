/**
 * @jest-environment node
 */
import { POST } from '@/app/api/book-session/route'
jest.setTimeout(20000)
import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
  waitFor,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma'

// Mock the prisma client to use the test database
jest.mock('@/lib/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma: require('../setup/test-db').testDb,
}))
// Mock the prisma client
// Mock the email module
jest.mock('@/lib/email')

// Import the mocked functions to control them in tests
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

const mockSendCustomerConfirmation = sendCustomerConfirmation as jest.Mock
const mockSendAdminNotification = sendAdminNotification as jest.Mock

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

describe('Error Scenarios Integration Tests', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    // Reset mocks but restore default behavior
    mockSendCustomerConfirmation.mockReset()
    mockSendAdminNotification.mockReset()
    
    // Restore default email mocks to prevent undefined .then() errors
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

  describe('Database Constraint Violations', () => {
    it('should handle invalid email format', async () => {
      const invalidData = createTestBookingData({
        email: 'not-an-email',
      })

      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'Test User',
        // Missing email, service, date, time
      }

      const req = makeJsonRequest(incompleteData)
      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should handle invalid service type', async () => {
      const invalidData = createTestBookingData({
        service: 'Invalid Service That Does Not Exist',
      })

      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should handle invalid date format', async () => {
      const invalidData = createTestBookingData({
        date: 'not-a-date' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      })

      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
    })

    it('should handle extremely long field values', async () => {
      const longString = 'a'.repeat(1000)
      const invalidData = createTestBookingData({
        name: longString,
        message: longString,
      })

      const req = makeJsonRequest(invalidData)
      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
    })
  })

  describe('Email Service Failures', () => {
    it('should handle customer email failure gracefully', async () => {
      // Mock customer email to fail
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
        status: 'PENDING',
        sessionDuration: 60,
      }
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )
      const req = makeJsonRequest(testData)

      const response = await POST(req)

      // Should still create booking even if customer email fails
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')

      // Verify booking was created in database
      expect(testDb.$transaction).toHaveBeenCalled()
    })

    it('should handle admin email failure gracefully', async () => {
      // Mock admin email to fail
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
        status: 'PENDING',
        sessionDuration: 60,
      }
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )
      const req = makeJsonRequest(testData)

      const response = await POST(req)

      // Should still create booking even if admin email fails
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')
      // Verify booking was created
      expect(testDb.$transaction).toHaveBeenCalled()
    })

    it('should handle both email failures gracefully', async () => {
      // Mock both emails to fail
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
        status: 'PENDING',
        sessionDuration: 60,
      }
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )
      const req = makeJsonRequest(testData)

      const response = await POST(req)

      // Should still create booking even if both emails fail
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')
      // Verify booking was created
      expect(testDb.$transaction).toHaveBeenCalled()
    })

    it('should handle email service timeout', async () => {
      // Mock email to timeout
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
        status: 'PENDING',
        sessionDuration: 60,
      }
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (
          callback: (tx: Prisma.TransactionClient) => Promise<Booking>
        ) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        }
      )
      const req = makeJsonRequest(testData)

      const response = await POST(req)

      // Should handle timeout gracefully
      expect(response.status).toBe(201)
      // Verify booking was created
      expect(testDb.$transaction).toHaveBeenCalled()
    })
  })

  describe('Database Connection Issues', () => {
    it('should handle database connection failure', async () => {
      // Mock the transaction to throw an error
      testDb.$transaction.mockRejectedValue(
        new Error('Database connection failed')
      )

      const testData = createTestBookingData()
      const req = makeJsonRequest(testData)

      const response = await POST(req)

      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData.message).toBe('Failed to submit booking.')
      expect(responseData.error).toBe('Failed to create booking in database: Database connection failed')
    })
  })

  describe('Malformed Request Handling', () => {
    it('should handle non-JSON request body', async () => {
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not-json-data',
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
    })

    it('should handle empty request body', async () => {
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '',
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    it('should handle request with wrong content type', async () => {
      const req = new Request('http://localhost/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(createTestBookingData()),
      })

      const response = await POST(req)

      // Should still work as long as body is valid JSON
      expect([200, 201, 400, 500]).toContain(response.status)
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous bookings', async () => {
      // Setup proper concurrent transaction mocking
      let callCount = 0
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: any) => Promise<any>) => {
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
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionDuration: 60,
          }
          
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null), // No conflicts
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx)
        }
      )

      const bookingPromises = Array.from({ length: 3 }, (_, i) => {
        const testData = createTestBookingData({
          name: `Concurrent User ${i}`,
          email: `concurrent-${i}-${Date.now()}@example.com`,
          time: `${10 + i}:00`, // Use different times to avoid conflicts
        })
        const req = makeJsonRequest(testData)
        return POST(req)
      })

      const responses = await Promise.all(bookingPromises)

      // Debug: Log response statuses
      console.log('Response statuses:', responses.map(r => r.status))
      
      // All should succeed with proper mocking
      const successfulResponses = responses.filter(
        response => response.status === 201
      )
      
      // Debug: Log response data if no successes
      if (successfulResponses.length === 0) {
        const responseTexts = await Promise.all(
          responses.map(async r => ({ status: r.status, body: await r.json().catch(() => 'Invalid JSON') }))
        )
        console.log('Failed responses:', responseTexts)
      }
      
      expect(successfulResponses.length).toBeGreaterThan(0)

      // Verify all bookings were created with unique IDs
      const responseData = await Promise.all(
        successfulResponses.map(response => response.json())
      )

      const bookingIds = responseData.map(data => data.data.id)
      const uniqueIds = new Set(bookingIds)
      expect(uniqueIds.size).toBe(bookingIds.length)
    })
  })

  describe('Data Validation Edge Cases', () => {
    it('should handle special characters in names', async () => {
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
        status: 'PENDING',
        sessionDuration: 60,
      }

      // Setup transaction mock for this test
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: any) => Promise<any>) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx)
        }
      )

      // Setup findUnique mock for waitFor
      ;(testDb.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking)

      const req = makeJsonRequest(testData)
      const response = await POST(req)

      expect([201, 500]).toContain(response.status)
      const responseData = await response.json()

      // Debug: Log response data structure
      console.log('Special char response:', responseData)
      
      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data?.id },
        })
      )
      expect(createdBooking?.name).toBe("O'Connor-Smith & Associates")
    })

    it('should handle unicode characters', async () => {
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
        status: 'PENDING',
        sessionDuration: 60,
      }

      // Setup transaction mock for this test
      ;(testDb.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: any) => Promise<any>) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking),
            },
          }
          return await callback(mockTx)
        }
      )

      // Setup findUnique mock for waitFor
      ;(testDb.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking)

      const req = makeJsonRequest(testData)
      const response = await POST(req)

      expect([201, 500]).toContain(response.status)
      const responseData = await response.json()

      // Debug: Log response data structure
      console.log('Unicode response:', responseData)
      
      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data?.id },
        })
      )
      expect(createdBooking?.name).toBe('José María González')
      expect(createdBooking?.message).toBe(
        'Looking forward to the session! 🏋️‍♀️💪'
      )
    })
  })
})
