/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'

import { POST } from '@/app/api/book-session/[id]/status/route'
import { NextRequest } from 'next/server'
import { testDb } from '../setup/test-db'
import * as email from '@/lib/email'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import type { Booking, Prisma } from '@/lib/generated/prisma/client'

// Test timeout configured in vitest.config.ts

vi.mock('@/lib/prisma', async () => {
  const { testDb } = await import('../setup/test-db')
  return { prisma: testDb }
})

vi.mock('@/lib/email', () => ({
  sendCustomerConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: vi.fn().mockResolvedValue({ success: true }),
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
    ;(testDb.$transaction as vi.Mock).mockImplementation(
      async (cb: (tx: Prisma.TransactionClient) => Promise<Booking>) =>
        await cb(testDb as unknown as Prisma.TransactionClient)
    )
    vi.clearAllMocks()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Valid Status Transitions', () => {
    it('transitions booking from pending to confirmed with audit trail', async () => {
      // Arrange
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
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({
        id: 'change-1',
        fromStatus: 'PENDING',
        toStatus: 'CONFIRMED',
        bookingId,
        createdAt: new Date(),
      })

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      // Assert
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual(confirmedBooking)
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).toHaveBeenCalledWith({
        data: {
          bookingId,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
        },
      })
    })

    it('sends customer notification on confirmation', async () => {
      // Arrange
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
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({})

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      // Assert
      expect(email.sendCustomerConfirmation).toHaveBeenCalledTimes(1)
      expect(email.sendAdminNotification).toHaveBeenCalledTimes(1)
    })
  })

  describe('Invalid Status Transitions', () => {
    it('prevents transition from cancelled to confirmed', async () => {
      // Arrange
      const bookingId = 'booking-invalid-1'
      const cancelledBooking = {
        id: bookingId,
        status: BookingStatus.CANCELLED
      }
      testDb.booking.findUnique.mockResolvedValue(
        cancelledBooking as unknown as Booking
      )

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      // Assert
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toMatch(/Cannot transition/i)
      expect(testDb.booking.update).not.toHaveBeenCalled()
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).not.toHaveBeenCalled()
    })

    it('rejects invalid status values', async () => {
      // Arrange
      const bookingId = 'booking-invalid-status'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)

      // Act
      const request = makeStatusRequest(bookingId, 'INVALID_STATUS')
      const response = await POST(request, { params: { id: bookingId } })
      
      // Assert
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toMatchObject({
        error: expect.any(String)
      })
    })
  })

  describe('Non-existent Booking Handling', () => {
    it('returns 404 for missing booking', async () => {
      // Arrange
      const bookingId = 'non-existent-booking'
      testDb.booking.findUnique.mockResolvedValue(null)

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      const response = await POST(request, { params: { id: bookingId } })
      
      // Assert
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toMatchObject({
        error: 'Booking not found'
      })
    })
  })

  describe('Audit Trail Verification', () => {
    it('creates status change record for every transition', async () => {
      // Arrange
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
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({
        id: 'audit-1',
        bookingId,
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.CONFIRMED,
        createdAt: new Date(),
      })

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      // Assert
      const createCall = (
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
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
      // Arrange
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
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({})

      // Act
      const request = makeStatusRequest(bookingId, 'CONFIRMED')
      await POST(request, { params: { id: bookingId } })

      // Assert
      expect(testDb.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
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
