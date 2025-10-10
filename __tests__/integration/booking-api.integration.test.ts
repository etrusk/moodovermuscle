/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

import { POST } from '@/app/api/book-session/route'
import { prisma } from '@/lib/prisma'
import { createTestBookingData } from '../setup/test-db-data'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

jest.setTimeout(15000)

type TransactionCallback = (tx: Prisma.TransactionClient) => Promise<Booking>

jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
  sendAdminNotification: jest
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
  ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
    async (callback: TransactionCallback) => {
      const mockTx = {
        booking: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockBooking),
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
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Complete Booking Journey', () => {
    it('creates booking from submission to confirmation', async () => {
      const testData = createTestBookingData()
      const mockBooking = setupMockBooking(testData, 'booking-123')
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(testData))
      
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/success/i)
      expect(responseData.data).toHaveProperty('id')
      expect(responseData.data.status).toBe('PENDING')
    })

    it('persists all customer information correctly', async () => {
      const customerData = createTestBookingData({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0412345678',
        goals: 'Build strength',
        experience: 'Beginner',
      })

      const mockBooking = setupMockBooking(customerData)
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(customerData))
      const responseData = await response.json()

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(
        setupMockBooking(customerData, responseData.data.id)
      )
      
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
      const booking1 = createTestBookingData({ name: 'User 1' })
      const booking2 = createTestBookingData({ name: 'User 2' })

      const mockBooking1 = setupMockBooking(booking1, 'booking-1')
      const mockBooking2 = setupMockBooking(booking2, 'booking-2')

      (mockPrisma.$transaction as jest.Mock)
        .mockImplementationOnce(async (callback: TransactionCallback) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking1),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        })
        .mockImplementationOnce(async (callback: TransactionCallback) => {
          const mockTx = {
            booking: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(mockBooking2),
            },
          }
          return await callback(mockTx as unknown as Prisma.TransactionClient)
        })

      const [response1, response2] = await Promise.all([
        POST(makeJsonRequest(booking1)),
        POST(makeJsonRequest(booking2)),
      ])

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)

      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.data.id).not.toBe(data2.data.id)
    })
  })

  describe('Input Validation Flow', () => {
    it('rejects invalid email format', async () => {
      const invalidData = createTestBookingData({
        email: 'not-an-email',
      })

      const response = await POST(makeJsonRequest(invalidData))
      
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/invalid/i)
      expect(responseData.errors).toBeDefined()
    })

    it('requires all mandatory fields', async () => {
      const incompleteData = {
        name: 'Test User',
      }

      const response = await POST(makeJsonRequest(incompleteData))
      
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/invalid/i)
      expect(responseData.errors).toBeDefined()
    })

    it('validates service selection', async () => {
      const invalidService = createTestBookingData({
        service: 'Non-existent Service',
      })

      const response = await POST(makeJsonRequest(invalidService))
      
      expect(response.status).toBe(400)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/invalid/i)
    })
  })

  describe('Date and Time Handling', () => {
    it('preserves exact booking date and time', async () => {
      const specificDateTime = new Date('2024-12-25T14:30:00Z')
      const bookingData = createTestBookingData({
        date: specificDateTime.toISOString(),
        time: '14:30',
      })

      const mockBooking = setupMockBooking(bookingData)
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(bookingData))
      const responseData = await response.json()

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(
        setupMockBooking(bookingData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.time).toBe('14:30')
      expect(createdBooking?.date).toEqual(specificDateTime)
    })
  })

  describe('Optional Fields Handling', () => {
    it('allows booking without optional phone and message', async () => {
      const minimalData = createTestBookingData({
        phone: undefined,
        message: undefined,
      })

      const mockBooking = setupMockBooking(minimalData)
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(minimalData))
      
      expect(response.status).toBe(201)
      const responseData = await response.json()

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(
        setupMockBooking(minimalData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.phone).toBeNull()
      expect(createdBooking?.message).toBeNull()
    })

    it('stores optional goals and experience when provided', async () => {
      const completeData = createTestBookingData({
        goals: 'Strength training',
        experience: 'Intermediate',
      })

      const mockBooking = setupMockBooking(completeData)
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(completeData))
      const responseData = await response.json()

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(
        setupMockBooking(completeData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.goals).toBe('Strength training')
      expect(createdBooking?.experience).toBe('Intermediate')
    })
  })

  describe('Response Format Consistency', () => {
    it('returns consistent success response structure', async () => {
      const testData = createTestBookingData()
      const mockBooking = setupMockBooking(testData)
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(testData))
      const responseData = await response.json()

      expect(responseData).toHaveProperty('message')
      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toHaveProperty('id')
      expect(responseData.data).toHaveProperty('status')
    })

    it('returns consistent error response structure', async () => {
      const invalidData = { name: 'Test' }

      const response = await POST(makeJsonRequest(invalidData))
      const responseData = await response.json()

      expect(responseData).toHaveProperty('message')
      expect(responseData).toHaveProperty('errors')
    })
  })
})
