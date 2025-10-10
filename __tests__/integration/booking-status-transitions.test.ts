/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
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

describe('Booking Status Lifecycle Integration', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    ;(testDb.$transaction as jest.Mock).mockImplementation(
      async (cb: (tx: Prisma.TransactionClient) => Promise<Booking>) =>
        await cb(testDb as unknown as Prisma.TransactionClient)
    )
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Valid Status Transitions', () => {
    it('transitions booking from pending to confirmed with audit trail', async () => {
      const bookingId = 'booking-transition-1'
      const pendingBooking = {
        id: bookingId,
        name: 'Alice Smith',
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
      
      const confirmedBooking = {
        ...pendingBooking,
        status: BookingStatus.CONFIRMED,
        updatedAt: new Date(),
      }

      testDb.booking.findUnique.mockResolvedValue(pendingBooking)
      testDb.booking.update.mockResolvedValue(confirmedBooking)
      ;(
        testDb.bookingStatusChange as unknown as { create: jest.Mock }
      ).create.mockResolvedValue({
        id: 'change-1',
        fromStatus: 'PENDING',
        toStatus: 'CONFIRMED',
        bookingId,
        createdAt: new Date(),
      })

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual(confirmedBooking)

      // Verify audit trail created
      expect(
        (testDb.bookingStatusChange as unknown as { create: jest.Mock }).create
      ).toHaveBeenCalledWith({
        data: {
          bookingId,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
        },
      })
    })

    it('sends customer notification on confirmation', async () => {
      const bookingId = 'booking-notification-1'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
        email: 'customer@example.com',
      }

      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)
      testDb.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CONFIRMED,
      } as unknown as Booking)
      ;(
        testDb.bookingStatusChange as unknown as { create: jest.Mock }
      ).create.mockResolvedValue({})

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      expect(email.sendCustomerConfirmation).toHaveBeenCalled()
      expect(email.sendAdminNotification).toHaveBeenCalled()
    })
  })

  describe('Invalid Status Transitions', () => {
    it('prevents transition from cancelled to confirmed', async () => {
      const bookingId = 'booking-invalid-1'
      const cancelledBooking = { 
        id: bookingId, 
        status: BookingStatus.CANCELLED 
      }
      
      testDb.booking.findUnique.mockResolvedValue(
        cancelledBooking as unknown as Booking
      )

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toMatch(/Cannot transition/i)
      
      // Verify no status change occurred
      expect(testDb.booking.update).not.toHaveBeenCalled()
      expect(
        (testDb.bookingStatusChange as unknown as { create: jest.Mock }).create
      ).not.toHaveBeenCalled()
    })

    it('rejects invalid status values', async () => {
      const bookingId = 'booking-invalid-status'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }

      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)

      const request = makeStatusRequest(bookingId, 'INVALID_STATUS')
      const response = await POST(request, { params: { id: bookingId } })
      
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBeDefined()
    })
  })

  describe('Non-existent Booking Handling', () => {
    it('returns 404 for missing booking', async () => {
      const bookingId = 'non-existent-booking'
      testDb.booking.findUnique.mockResolvedValue(null)

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Booking not found')
    })
  })

  describe('Audit Trail Verification', () => {
    it('creates status change record for every transition', async () => {
      const bookingId = 'booking-audit-1'
      const original = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }

      testDb.booking.findUnique.mockResolvedValue(original as unknown as Booking)
      testDb.booking.update.mockResolvedValue({
        ...original,
        status: BookingStatus.CONFIRMED,
      } as unknown as Booking)
      ;(
        testDb.bookingStatusChange as unknown as { create: jest.Mock }
      ).create.mockResolvedValue({
        id: 'audit-1',
        bookingId,
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.CONFIRMED,
        createdAt: new Date(),
      })

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      const createCall = (
        testDb.bookingStatusChange as unknown as { create: jest.Mock }
      ).create.mock.calls[0][0]

      expect(createCall.data).toMatchObject({
        bookingId,
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.CONFIRMED,
      })
    })
  })

  describe('Database Transaction Integrity', () => {
    it('updates booking status within transaction', async () => {
      const bookingId = 'booking-transaction-1'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }

      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)
      testDb.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CONFIRMED,
      } as unknown as Booking)
      ;(
        testDb.bookingStatusChange as unknown as { create: jest.Mock }
      ).create.mockResolvedValue({})

      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      expect(testDb.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
      })
    })
  })
})
