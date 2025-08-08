/**
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

// Get the mocked prisma instance with proper typing
const mockPrisma = prisma as jest.Mocked<typeof prisma>

jest.setTimeout(15000)

type TransactionCallback = (tx: Prisma.TransactionClient) => Promise<Booking>

jest.mock('@/lib/prisma', () => ({
  // Inline mock factory - no external dependencies during hoisting
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

// Mock email functions for integration tests
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
  sendAdminNotification: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
}))

// Helper functions for test setup
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

describe('Booking API Integration Tests', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('POST /api/book-session - Basic Operations', () => {
    it('should create a booking in the database with valid data', async () => {
      const testData = createTestBookingData()
      const mockBooking = setupMockBooking(testData, 'mock-booking-id-123')
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(testData))
      expect(response.status).toBe(201)

      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')
      expect(responseData.data).toHaveProperty('id')

      // Verify booking creation
      ;(mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(
        setupMockBooking(testData, responseData.data.id)
      )
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking).toBeTruthy()
      expect(createdBooking?.name).toBe(testData.name)
      expect(createdBooking?.email).toBe(testData.email)
      expect(createdBooking?.service).toBe(testData.service)
      expect(createdBooking?.goals).toBe(testData.goals)
      expect(createdBooking?.experience).toBe(testData.experience)
    })

    it('should handle database constraint violations', async () => {
      const testData = createTestBookingData({
        email: 'invalid-email', // This should fail validation
      })

      const response = await POST(makeJsonRequest(testData))
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'Test User',
        // Missing required fields
      }

      const response = await POST(makeJsonRequest(incompleteData))
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })
  })

  describe('POST /api/book-session - Multiple Bookings', () => {
    it('should create multiple bookings without conflicts', async () => {
      const testData1 = createTestBookingData({ name: 'User 1' })
      const testData2 = createTestBookingData({ name: 'User 2' })

      const mockBooking1 = setupMockBooking(testData1, 'mock-id-1')
      const mockBooking2 = setupMockBooking(testData2, 'mock-id-2')

      // Setup transaction mocks for both bookings
      ;(mockPrisma.$transaction as jest.Mock)
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

      const response1 = await POST(makeJsonRequest(testData1))
      const response2 = await POST(makeJsonRequest(testData2))

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)

      const data1 = await response1.json()
      const data2 = await response2.json()
      expect(data1.data.id).not.toBe(data2.data.id)

      // Verify database calls
      mockPrisma.booking.findUnique
        .mockResolvedValueOnce(setupMockBooking(testData1, data1.data.id))
        .mockResolvedValueOnce(setupMockBooking(testData2, data2.data.id))
      
      const booking1 = await mockPrisma.booking.findUnique({ where: { id: data1.data.id } })
      const booking2 = await mockPrisma.booking.findUnique({ where: { id: data2.data.id } })

      expect(booking1?.name).toBe('User 1')
      expect(booking2?.name).toBe('User 2')
    })
  })

  describe('POST /api/book-session - Field Handling', () => {
    it('should handle date and time fields correctly', async () => {
      const futureDate = new Date('2024-12-25T14:30:00Z')
      const testData = createTestBookingData({
        date: futureDate.toISOString(),
        time: '14:30',
      })

      const mockBooking = setupMockBooking(testData, 'mock-booking-id-date-time')
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(testData))
      expect(response.status).toBe(201)

      const responseData = await response.json()
      mockPrisma.booking.findUnique.mockResolvedValue(
        setupMockBooking(testData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.time).toBe('14:30')
      expect(createdBooking?.date).toEqual(futureDate)
    })

    it('should handle optional fields correctly', async () => {
      const testData = createTestBookingData({
        phone: undefined,
        message: undefined,
      })

      const mockBooking = setupMockBooking(testData, 'mock-booking-id-optional')
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(testData))
      expect(response.status).toBe(201)

      const responseData = await response.json()
      mockPrisma.booking.findUnique.mockResolvedValue(
        setupMockBooking(testData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.phone).toBeNull()
      expect(createdBooking?.message).toBeNull()
    })
  })

  describe('POST /api/book-session - Validation', () => {
    it('should validate service types', async () => {
      const testData = createTestBookingData({
        service: 'Invalid Service Type',
      })

      const response = await POST(makeJsonRequest(testData))

      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should validate goals and experience fields', async () => {
      const validData = createTestBookingData({
        goals: 'strength',
        experience: 'Intermediate',
      })

      const mockBooking = setupMockBooking(validData, 'mock-booking-id-goals')
      mockTransaction(mockBooking)

      const response = await POST(makeJsonRequest(validData))
      expect(response.status).toBe(201)

      const responseData = await response.json()
      mockPrisma.booking.findUnique.mockResolvedValue(
        setupMockBooking(validData, responseData.data.id)
      )
      
      const createdBooking = await mockPrisma.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.goals).toBe('strength')
      expect(createdBooking?.experience).toBe('Intermediate')
    })
  })
})
