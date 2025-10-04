// @ts-nocheck
/**
 * @jest-environment node
 */

// Mock Prisma before any imports to ensure proper hoisting
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

jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}));

import { POST } from '@/app/api/book-session/route'
import { prisma } from '@/lib/prisma'
import { createTestBookingData } from '../setup/test-db-data'
import * as email from '@/lib/email'
import { setupIntegrationTest, teardownIntegrationTest } from '../setup/test-helpers'

// Get the mocked prisma instance
const mockPrisma = prisma as jest.Mocked<typeof prisma>

jest.setTimeout(15000)

function makeJsonRequest(data: Record<string, unknown>): Request {
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

describe('Booking Transactions Integration Tests', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    // Reset all mocks
    jest.clearAllMocks()
    // Setup proper transaction mock that passes the transaction client
    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => await cb(mockPrisma))
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  it('Successful booking: valid booking is created within a transaction', async () => {
    const data = createTestBookingData()
    const req = makeJsonRequest(data)

    ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
    const created: any = {
      ...data,
      id: 'trans-success-id',
      status: 'PENDING',
      sessionDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: (data as any).phone ?? null,
      message: (data as any).message ?? null,
    }
    ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(created)

    const response = await POST(req)
    expect(response.status).toBe(201)
    const resData = await response.json()
    expect(resData.data).toEqual(created)
  })

  it('Conflict detection: prevents booking a taken time slot and rolls back', async () => {
    const data = createTestBookingData()
    const req = makeJsonRequest(data)

    const conflictBooking: any = {
      id: 'existing',
      ...data,
      status: 'PENDING',
      sessionDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Clear previous mock calls
    ;(mockPrisma.booking.create as jest.Mock).mockClear()
    
    // Mock the availability checking to find the conflict - this will be used by validateRealTimeAvailability
    ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(conflictBooking)

    const response = await POST(req)
    expect(response.status).toBe(409)
    const resData = await response.json()
    expect(resData.message).toMatch(/Booking conflict/)
    expect(mockPrisma.booking.create).not.toHaveBeenCalled()
  })

  it('Email failure does not roll back booking transaction', async () => {
    const data = createTestBookingData()
    const req = makeJsonRequest(data)

    ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
    const created: any = {
      ...data,
      id: 'email-fail-id',
      status: 'PENDING',
      sessionDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: (data as any).phone ?? null,
      message: (data as any).message ?? null,
    }
    ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(created)

    jest.spyOn(email, 'sendCustomerConfirmation').mockRejectedValue(new Error('Email send failure'))
    const response = await POST(req)
    expect(response.status).toBe(201)
    const resData = await response.json()
    expect(resData.data).toEqual(created)
  })

  it('Concurrency: only one of concurrent requests for same slot succeeds', async () => {
    const data = createTestBookingData()
    const req1 = makeJsonRequest(data)
    const req2 = makeJsonRequest(data)

    ;(mockPrisma.booking.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'existing',
        ...data,
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
    const created: any = {
      ...data,
      id: 'concurrency-id',
      status: 'PENDING',
      sessionDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: (data as any).phone ?? null,
      message: (data as any).message ?? null,
    }
    ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(created)

    const [res1, res2] = await Promise.all([POST(req1), POST(req2)])
    const statuses = [res1.status, res2.status].sort()
    expect(statuses).toEqual([201, 409])
  })
})