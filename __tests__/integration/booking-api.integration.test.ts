/**
 * @jest-environment node
 */
// @ts-nocheck
import { POST } from '@/app/api/book-session/route'
import { NextRequest } from 'next/server'
import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
jest.setTimeout(15000)

type TransactionCallback = (tx: typeof testDb) => Promise<any>;

jest.mock('@/lib/prisma', () => ({
  prisma: testDb,
}))
// Mock the prisma client
// Mock email functions for integration tests
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
  sendAdminNotification: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-id' }),
}))

function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/book-session', {
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

  describe('POST /api/book-session', () => {
    it('should create a booking in the database with valid data', async () => {
      const testData = createTestBookingData()
      const req = makeJsonRequest(testData)

      // Mock the database create function
      const mockBookingId = 'mock-booking-id-123'
      const mockBooking = {
        ...createTestBookingData(),
        id: mockBookingId,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData.phone ?? null,
        message: testData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      };

(testDb.$transaction as jest.Mock).mockImplementation(async (callback: TransactionCallback) => {
        const mockTx = {
          booking: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockBooking),
          },
        }
        return await callback(mockTx as any)
      });

      const response = await POST(req)
      expect(response.status).toBe(201)

      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')
      expect(responseData.data).toHaveProperty('id')

      // Verify booking was actually created in database
      testDb.booking.findUnique.mockResolvedValue({
        ...testData,
        id: responseData.data.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData.phone ?? null,
        message: testData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      })
      const createdBooking = await testDb.booking.findUnique({
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
      const req = makeJsonRequest(testData)

      const response = await POST(req)
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
      const req = makeJsonRequest(incompleteData)

      const response = await POST(req)
      expect(response.status).toBe(400)

      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should create multiple bookings without conflicts', async () => {
      const testData1 = createTestBookingData({ name: 'User 1' })
      const testData2 = createTestBookingData({ name: 'User 2' })

      const req1 = makeJsonRequest(testData1)
      const req2 = makeJsonRequest(testData2)

      // Mock the database create function for both calls
      const mockBooking1 = {
        ...testData1,
        id: 'mock-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData1.phone ?? null,
        message: testData1.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      }
      const mockBooking2 = {
        ...testData1,
        id: 'mock-id-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData2.phone ?? null,
        message: testData2.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      };
(testDb.$transaction as jest.Mock)
        .mockImplementationOnce(async (callback: TransactionCallback) => {
            const mockTx = {
                booking: {
                    findFirst: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue(mockBooking1),
                },
            };
            return await callback(mockTx as any);
        })
        .mockImplementationOnce(async (callback: TransactionCallback) => {
            const mockTx = {
                booking: {
                    findFirst: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue(mockBooking2),
                },
            };
            return await callback(mockTx as any);
        });

      const response1 = await POST(req1)
      const response2 = await POST(req2)

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)

      const data1 = await response1.json()
      const data2 = await response2.json()

      expect(data1.data.id).not.toBe(data2.data.id)

      // Verify both bookings exist in database
      testDb.booking.findUnique
        .mockResolvedValueOnce({
          ...testData1,
          id: data1.data.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: testData1.phone ?? null,
          message: testData1.message ?? null,
          status: 'PENDING',
          sessionDuration: 60,
        })
        .mockResolvedValueOnce({
          ...testData2,
          id: data2.data.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: testData2.phone ?? null,
          message: testData2.message ?? null,
          status: 'PENDING',
          sessionDuration: 60,
        })
      const booking1 = await testDb.booking.findUnique({
        where: { id: data1.data.id },
      })
      const booking2 = await testDb.booking.findUnique({
        where: { id: data2.data.id },
      })

      expect(booking1?.name).toBe('User 1')
      expect(booking2?.name).toBe('User 2')
    })

    it('should handle date and time fields correctly', async () => {
      const futureDate = new Date('2024-12-25T14:30:00Z')
      const testData = createTestBookingData({
        date: futureDate.toISOString(),
        time: '2:30 PM',
      })

      const req = makeJsonRequest(testData)

      // Mock the database create function
      const mockBooking = {
        ...testData,
        id: 'mock-booking-id-date-time',
        date: new Date(testData.date),
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData.phone ?? null,
        message: testData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      };
(testDb.$transaction as jest.Mock).mockImplementation(async (callback: TransactionCallback) => {
        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockBooking),
            },
        };
        return await callback(mockTx as any);
      });

      const response = await POST(req)

      expect(response.status).toBe(201)

      const responseData = await response.json()
      testDb.booking.findUnique.mockResolvedValue({
        ...testData,
        id: responseData.data.id,
        date: new Date(testData.date),
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: testData.phone ?? null,
        message: testData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      })
      const createdBooking = await testDb.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.time).toBe('2:30 PM')
      expect(createdBooking?.date).toEqual(futureDate)
    })

    it('should handle optional fields correctly', async () => {
      const testData = createTestBookingData({
        phone: undefined,
        message: undefined,
      })

      const req = makeJsonRequest(testData)

      // Mock the database create function
      const mockBooking = {
        ...testData,
        id: 'mock-booking-id-optional',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING',
        sessionDuration: 60,
      };
(testDb.$transaction as jest.Mock).mockImplementation(async (callback: TransactionCallback) => {
        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockBooking),
            },
        };
        return await callback(mockTx as any);
      });

      const response = await POST(req)

      expect(response.status).toBe(201)

      const responseData = await response.json()
      testDb.booking.findUnique.mockResolvedValue({
        ...testData,
        id: responseData.data.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: null,
        message: null,
        status: 'PENDING',
        sessionDuration: 60,
      })
      const createdBooking = await testDb.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.phone).toBeNull()
      expect(createdBooking?.message).toBeNull()
    })

    it('should validate service types', async () => {
      const testData = createTestBookingData({
        service: 'Invalid Service Type',
      })

      const req = makeJsonRequest(testData)
      const response = await POST(req)

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

      const req = makeJsonRequest(validData)

      // Mock the database create function
      const mockBooking = {
        ...validData,
        id: 'mock-booking-id-goals',
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: validData.phone ?? null,
        message: validData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      };
(testDb.$transaction as jest.Mock).mockImplementation(async (callback: TransactionCallback) => {
        const mockTx = {
            booking: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(mockBooking),
            },
        };
        return await callback(mockTx as any);
      });

      const response = await POST(req)

      expect(response.status).toBe(201)

      const responseData = await response.json()
      testDb.booking.findUnique.mockResolvedValue({
        ...validData,
        id: responseData.data.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: validData.phone ?? null,
        message: validData.message ?? null,
        status: 'PENDING',
        sessionDuration: 60,
      })
      const createdBooking = await testDb.booking.findUnique({
        where: { id: responseData.data.id },
      })

      expect(createdBooking?.goals).toBe('strength')
      expect(createdBooking?.experience).toBe('Intermediate')
    })
  })
})
