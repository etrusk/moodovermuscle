// @ts-nocheck
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/book-session/route'
import { NextRequest, NextResponse } from 'next/server'
import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'
import * as email from '@/lib/email'
import { setupIntegrationTest, teardownIntegrationTest } from '../setup/test-helpers'

jest.setTimeout(15000)

jest.mock('@/lib/prisma', () => ({
  prisma: testDb,
}))

jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}));


function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }) as NextRequest
}

describe('Booking Transactions Integration Tests', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    testDb.$transaction.mockImplementation(async (cb: any) => await cb(testDb))
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  it('Successful booking: valid booking is created within a transaction', async () => {
    const data = createTestBookingData()
    const req = makeJsonRequest(data)

    testDb.booking.findFirst.mockResolvedValue(null)
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
    testDb.booking.create.mockResolvedValue(created)

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
    testDb.booking.findFirst.mockResolvedValue(conflictBooking)

    const response = await POST(req)
    expect(response.status).toBe(409)
    const resData = await response.json()
    expect(resData.message).toMatch(/Booking conflict/)
    expect(testDb.booking.create).not.toHaveBeenCalled()
  })

  it('Email failure does not roll back booking transaction', async () => {
    const data = createTestBookingData()
    const req = makeJsonRequest(data)

    testDb.booking.findFirst.mockResolvedValue(null)
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
    testDb.booking.create.mockResolvedValue(created)

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

    testDb.booking.findFirst
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
    testDb.booking.create.mockResolvedValue(created)

    const [res1, res2] = await Promise.all([POST(req1), POST(req2)])
    const statuses = [res1.status, res2.status].sort()
    expect(statuses).toEqual([201, 409])
  })
})