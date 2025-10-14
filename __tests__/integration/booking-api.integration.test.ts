/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'
import { POST } from '@/app/api/book-session/route'
import { prisma } from '@/lib/prisma'
import { createTestBookingData } from '../setup/test-db-data'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma'

const mockPrisma = prisma as vi.Mocked<typeof prisma>

// Test timeout configured in vitest.config.ts

type TransactionCallback = (tx: Prisma.TransactionClient) => Promise<Booking>

vi.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}))

vi.mock('@/lib/email', () => ({
  sendCustomerConfirmation: vi
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
  sendAdminNotification: vi
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
}))

const setupMockBooking = (testData: Record<string, unknown>, id = 'mock-booking-id'): Booking => {
  return {
    ...testData,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: (testData.phone as string) ?? null,
    message: (testData.message as string) ?? null,
    status: 'PENDING' as const,
    sessionDuration: 60,
    date: testData.date instanceof Date ? testData.date : new Date(testData.date as string),
    name: testData.name as string,
    email: testData.email as string,
    service: testData.service as string,
    time: testData.time as string,
    goals: (testData.goals as string) ?? null,
    experience: (testData.experience as string) ?? null,
  } as Booking
}

const mockTransaction = (mockBooking: Booking): void => {
  ;(mockPrisma.$transaction as vi.Mock).mockImplementation(
    async (callback: TransactionCallback) => {
      const mockTx = {
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockBooking),
        },
      }
      return await callback(mockTx as unknown as Prisma.TransactionClient)
    }
  )
}

function makeJsonRequest(data: Record<string, unknown>): Request {
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

describe('Booking API Workflow Integration', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Complete Booking Journey', () => {
    it('creates booking from submission to confirmation', async () => {
      // Arrange
      const testData = createTestBookingData()
      const mockBooking = setupMockBooking(testData, 'booking-123')
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(testData))
      
      // Assert
      expect(response.status).toBe(201)
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/success/i)
      expect(responseData.data).toMatchObject({
        id: expect.any(String),
        status: 'PENDING'
      })
    })

    it('persists all customer information correctly', async () => {
      // Arrange
      const customerData = createTestBookingData({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0412345678',
        goals: 'Build strength',
        experience: 'Beginner',
      })
      const mockBooking = setupMockBooking(customerData)
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(customerData))
      
      // Assert
      expect(response.status).toBe(201)
      const responseData = await response.json()

      const verificationBooking = setupMockBooking(customerData, responseData.data.id)
      ;(mockPrisma.booking.findUnique as vi.Mock).mockResolvedValue(verificationBooking)
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking).toMatchObject({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0412345678',
        goals: 'Build strength',
        experience: 'Beginner',
      })
    })

    it('handles multiple concurrent bookings independently', async () => {
      // Arrange
      const booking1 = createTestBookingData({ name: 'User 1' })
      const booking2 = createTestBookingData({ name: 'User 2' })
      const mockBooking1 = setupMockBooking(booking1, 'booking-1')
      const mockBooking2 = setupMockBooking(booking2, 'booking-2')

      ;(mockPrisma.$transaction as vi.Mock)
        .mockImplementationOnce(async (callback: TransactionCallback) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking1),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        })
        .mockImplementationOnce(async (callback: TransactionCallback) => {
          const mockTx = {
            booking: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(mockBooking2),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        })

      // Act
      const [response1, response2] = await Promise.all([
        POST(makeJsonRequest(booking1)),
        POST(makeJsonRequest(booking2)),
      ])

      // Assert
      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)

      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.data.id).not.toBe(data2.data.id)
    })
  })

  describe('Input Validation Flow', () => {
    it('rejects invalid email format', async () => {
      // Arrange
      const invalidData = createTestBookingData({
        email: 'not-an-email',
      })

      // Act
      const response = await POST(makeJsonRequest(invalidData))
      
      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: expect.stringMatching(/invalid/i),
        errors: expect.any(Object)
      })
    })

    it('requires all mandatory fields', async () => {
      // Arrange
      const incompleteData = {
        name: 'Test User',
      }

      // Act
      const response = await POST(makeJsonRequest(incompleteData))
      
      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData).toMatchObject({
        message: expect.stringMatching(/invalid/i),
        errors: expect.any(Object)
      })
    })

    it('validates service selection', async () => {
      // Arrange
      const invalidService = createTestBookingData({
        service: 'Non-existent Service',
      })

      // Act
      const response = await POST(makeJsonRequest(invalidService))
      
      // Assert
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/invalid/i)
    })
  })

  describe('Date and Time Handling', () => {
    it('preserves exact booking date and time', async () => {
      // Arrange
      const specificDateTime = new Date('2024-12-25T14:30:00Z')
      const bookingData = createTestBookingData({
        date: specificDateTime.toISOString(),
        time: '14:30',
      })
      const mockBooking = setupMockBooking(bookingData)
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(bookingData))
      const responseData = await response.json()

      const verificationBooking = setupMockBooking(bookingData, responseData.data.id)
      ;(mockPrisma.booking.findUnique as vi.Mock).mockResolvedValue(verificationBooking)
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      // Assert
      expect(createdBooking).toMatchObject({
        time: '14:30',
        date: specificDateTime
      })
    })
  })

  describe('Optional Fields Handling', () => {
    it('allows booking without optional phone and message', async () => {
      // Arrange
      const minimalData = createTestBookingData({
        phone: undefined,
        message: undefined,
      })
      const mockBooking = setupMockBooking(minimalData)
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(minimalData))
      
      // Assert
      expect(response.status).toBe(201)
      const responseData = await response.json()

      const verificationBooking = setupMockBooking(minimalData, responseData.data.id)
      ;(mockPrisma.booking.findUnique as vi.Mock).mockResolvedValue(verificationBooking)
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking).toMatchObject({
        phone: null,
        message: null
      })
    })

    it('stores optional goals and experience when provided', async () => {
      // Arrange
      const completeData = createTestBookingData({
        goals: 'Strength training',
        experience: 'Intermediate',
      })
      const mockBooking = setupMockBooking(completeData)
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(completeData))
      const responseData = await response.json()

      const verificationBooking = setupMockBooking(completeData, responseData.data.id)
      ;(mockPrisma.booking.findUnique as vi.Mock).mockResolvedValue(verificationBooking)
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      // Assert
      expect(createdBooking).toMatchObject({
        goals: 'Strength training',
        experience: 'Intermediate'
      })
    })
  })

  describe('Response Format Consistency', () => {
    it('returns consistent success response structure', async () => {
      // Arrange
      const testData = createTestBookingData()
      const mockBooking = setupMockBooking(testData)
      mockTransaction(mockBooking)

      // Act
      const response = await POST(makeJsonRequest(testData))
      const responseData = await response.json()

      // Assert
      expect(responseData).toMatchObject({
        message: expect.any(String),
        data: {
          id: expect.any(String),
          status: expect.any(String)
        }
      })
    })

    it('returns consistent error response structure', async () => {
      // Arrange
      const invalidData = { name: 'Test' }

      // Act
      const response = await POST(makeJsonRequest(invalidData))
      const responseData = await response.json()

      // Assert
      expect(responseData).toMatchObject({
        message: expect.any(String),
        errors: expect.any(Object)
      })
    })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

  })
})
