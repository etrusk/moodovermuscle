/**
 * @jest-environment node
 */
import { POST } from '@/app/api/book-session/[id]/status/route'
import { NextRequest } from 'next/server'
import { testDb } from '../setup/test-db'
import * as email from '@/lib/email'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma'

jest.setTimeout(15000)

jest.mock('@/lib/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma: require('../setup/test-db').testDb,
}))

jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}))

// Define BookingStatus enum locally to avoid Prisma client import issues
const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const

function makeStatusRequest(id: string, status: string): NextRequest {
  return new Request(`http://localhost/api/book-session/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }) as NextRequest
}

describe('Booking Status Transition API', () => {
  beforeEach(async () => {
    await setupIntegrationTest()(
      testDb.$transaction as jest.Mock
    ).mockImplementation(
      async (cb: (tx: Prisma.TransactionClient) => Promise<Booking>) =>
        await cb(testDb as unknown as Prisma.TransactionClient)
    )
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  it('Successfully transitions PENDING to CONFIRMED and creates audit + emails', async () => {
    const bookingId = 'bid-1'
    const original = {
      id: bookingId,
      name: 'Alice',
      email: 'alice@example.com',
      phone: null,
      service: 'Yoga',
      date: new Date('2025-08-10'),
      time: '10:00',
      message: null,
      goals: null,
      experience: null,
      status: BookingStatus.PENDING,
      sessionDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updated = {
      ...original,
      status: BookingStatus.CONFIRMED,
      updatedAt: new Date(),
    }

    testDb.booking.findUnique.mockResolvedValue(original)
    testDb.booking.update.mockResolvedValue(updated)
    ;(
      testDb.bookingStatusChange as unknown as { create: jest.Mock }
    ).create.mockResolvedValue({
      id: 'c1',
      fromStatus: 'PENDING',
      toStatus: 'CONFIRMED',
      bookingId,
      createdAt: new Date(),
    })

    const req = makeStatusRequest(bookingId, 'CONFIRMED')
    const res = await POST(req, { params: { id: bookingId } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(updated)

    expect(testDb.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    })
    expect(
      (testDb.bookingStatusChange as unknown as { create: jest.Mock }).create
    ).toHaveBeenCalledWith({
      data: {
        bookingId,
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.CONFIRMED,
      },
    })
    expect(email.sendCustomerConfirmation).toHaveBeenCalled()
    expect(email.sendAdminNotification).toHaveBeenCalled()
  })

  it('Rejects invalid status transition', async () => {
    const bookingId = 'bid-2'
    const original = { id: bookingId, status: BookingStatus.CANCELLED }
    testDb.booking.findUnique.mockResolvedValue(original as unknown as Booking)

    const req = makeStatusRequest(bookingId, 'CONFIRMED')
    const res = await POST(req, { params: { id: bookingId } })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Cannot transition/)
    expect(testDb.booking.update).not.toHaveBeenCalled()
    expect(
      (testDb.bookingStatusChange as unknown as { create: jest.Mock }).create
    ).not.toHaveBeenCalled()
  })

  it('Returns 404 for non-existent booking', async () => {
    const bookingId = 'missing'
    testDb.booking.findUnique.mockResolvedValue(null)

    const req = makeStatusRequest(bookingId, 'CONFIRMED')
    const res = await POST(req, { params: { id: bookingId } })
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Booking not found')
  })
})
