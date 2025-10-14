/**
 * @testing-approach modern-2025
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
import type { Booking, Prisma } from '@/lib/generated/prisma'

// Test timeout configured in vitest.config.ts

vi.mock('@/lib/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma: require('../setup/test-db').testDb,
}))

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

function makeCancellationRequest(id: string, notes?: string): NextRequest {
  const body = notes ? { status: 'CANCELLED', notes } : { status: 'CANCELLED' }
  return new Request(`http://localhost/api/book-session/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest
}

describe('Booking Cancellation Integration', () => {
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

  describe('Happy Path Tests', () => {
    it('cancels PENDING booking successfully with audit trail', async () => {
      // Arrange
      const bookingId = 'booking-cancel-pending'
      const pendingBooking = {
        id: bookingId,
        name: 'John Doe',
        email: 'customer@example.com',
        phone: null,
        service: 'Personal Training',
        date: new Date('2025-12-01'),
        time: '10:00',
        message: null,
        goals: null,
        experience: null,
        status: BookingStatus.PENDING,
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const cancelledBooking = {
        ...pendingBooking,
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
      }
      testDb.booking.findUnique.mockResolvedValue(pendingBooking)
      testDb.booking.update.mockResolvedValue(cancelledBooking)
      ;(
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({
        id: 'change-1',
        fromStatus: 'PENDING',
        toStatus: 'CANCELLED',
        bookingId,
        createdAt: new Date(),
      })

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toMatchObject({
        id: bookingId,
        status: BookingStatus.CANCELLED,
      })
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).toHaveBeenCalledWith({
        data: {
          bookingId,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CANCELLED,
        },
      })
    })

    it('cancels CONFIRMED booking successfully with audit trail', async () => {
      // Arrange
      const bookingId = 'booking-cancel-confirmed'
      const confirmedBooking = {
        id: bookingId,
        name: 'Jane Smith',
        email: 'customer2@example.com',
        phone: null,
        service: 'Yoga',
        date: new Date('2025-12-05'),
        time: '14:00',
        message: null,
        goals: null,
        experience: null,
        status: BookingStatus.CONFIRMED,
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const cancelledBooking = {
        ...confirmedBooking,
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
      }
      testDb.booking.findUnique.mockResolvedValue(confirmedBooking)
      testDb.booking.update.mockResolvedValue(cancelledBooking)
      ;(
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({
        id: 'change-2',
        fromStatus: 'CONFIRMED',
        toStatus: 'CANCELLED',
        bookingId,
        createdAt: new Date(),
      })

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toMatchObject({
        id: bookingId,
        status: BookingStatus.CANCELLED,
      })
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).toHaveBeenCalledWith({
        data: {
          bookingId,
          fromStatus: BookingStatus.CONFIRMED,
          toStatus: BookingStatus.CANCELLED,
        },
      })
    })

    it('sends email notification on cancellation', async () => {
      // Arrange
      const bookingId = 'booking-cancel-notify'
      const booking = {
        id: bookingId,
        name: 'Test User',
        email: 'test@example.com',
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)
      testDb.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CANCELLED,
      } as unknown as Booking)
      ;(
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({})

      // Act
      const request = makeCancellationRequest(bookingId)
      await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(email.sendAdminNotification).toHaveBeenCalledTimes(1)
    })

    it('handles cancellation with optional notes/reason', async () => {
      // Arrange
      const bookingId = 'booking-cancel-notes'
      const pendingBooking = {
        id: bookingId,
        name: 'User With Notes',
        email: 'notes@example.com',
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(
        pendingBooking as unknown as Booking
      )
      testDb.booking.update.mockResolvedValue({
        ...pendingBooking,
        status: BookingStatus.CANCELLED,
      } as unknown as Booking)
      ;(
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({})

      // Act
      const request = makeCancellationRequest(
        bookingId,
        'Customer requested cancellation due to schedule conflict'
      )
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toMatchObject({
        status: BookingStatus.CANCELLED,
      })
    })
  })

  describe('Edge Cases', () => {
    it('prevents cancellation of COMPLETED booking', async () => {
      // Arrange
      const bookingId = 'booking-completed'
      const completedBooking = {
        id: bookingId,
        email: 'completed@example.com',
        status: BookingStatus.COMPLETED,
      }
      testDb.booking.findUnique.mockResolvedValue(
        completedBooking as unknown as Booking
      )

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toMatch(/Cannot transition/i)
      expect(testDb.booking.update).not.toHaveBeenCalled()
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).not.toHaveBeenCalled()
    })

    it('prevents cancellation of already CANCELLED booking', async () => {
      // Arrange
      const bookingId = 'booking-already-cancelled'
      const cancelledBooking = {
        id: bookingId,
        email: 'cancelled@example.com',
        status: BookingStatus.CANCELLED,
      }
      testDb.booking.findUnique.mockResolvedValue(
        cancelledBooking as unknown as Booking
      )

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toMatch(/Cannot transition/i)
      expect(testDb.booking.update).not.toHaveBeenCalled()
      expect(
        (testDb.bookingStatusChange as unknown as { create: vi.Mock }).create
      ).not.toHaveBeenCalled()
    })

    it('handles non-existent booking ID', async () => {
      // Arrange
      const bookingId = 'non-existent-booking'
      testDb.booking.findUnique.mockResolvedValue(null)

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toMatchObject({
        error: 'Booking not found',
      })
    })

    it('validates empty cancellation request body', async () => {
      // Arrange
      const bookingId = 'booking-empty-request'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)

      // Act
      const request = new Request(
        `http://localhost/api/book-session/${bookingId}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      ) as NextRequest
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body).toMatchObject({
        error: expect.any(String),
      })
    })
  })

  describe('Error Conditions', () => {
    it('handles database transaction failure during cancellation', async () => {
      // Arrange
      const bookingId = 'booking-transaction-error'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)
      testDb.booking.update.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      const request = makeCancellationRequest(bookingId)
      await expect(
        POST(request, { params: Promise.resolve({ id: bookingId }) })
      ).rejects.toThrow('Database connection failed')
    })

    it('rolls back transaction on audit trail creation failure', async () => {
      // Arrange
      const bookingId = 'booking-audit-error'
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      }
      testDb.booking.findUnique.mockResolvedValue(booking as unknown as Booking)
      ;(testDb.$transaction as vi.Mock).mockRejectedValue(
        new Error('Audit trail creation failed')
      )

      // Act & Assert
      const request = makeCancellationRequest(bookingId)
      await expect(
        POST(request, { params: Promise.resolve({ id: bookingId }) })
      ).rejects.toThrow('Audit trail creation failed')
      expect(testDb.booking.update).not.toHaveBeenCalled()
    })

    it('calls email notification service on cancellation', async () => {
      // Arrange
      const bookingId = 'booking-email-call'
      const booking = {
        id: bookingId,
        name: 'Email Test User',
        email: 'emailtest@example.com',
        phone: null,
        service: 'Yoga',
        date: new Date('2025-12-10'),
        time: '10:00',
        message: null,
        goals: null,
        experience: null,
        status: BookingStatus.PENDING,
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      testDb.booking.findUnique.mockResolvedValue(booking)
      testDb.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CANCELLED,
      })
      ;(
        testDb.bookingStatusChange as unknown as { create: vi.Mock }
      ).create.mockResolvedValue({})

      // Act
      const request = makeCancellationRequest(bookingId)
      const response = await POST(request, { params: Promise.resolve({ id: bookingId }) })

      // Assert
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toMatchObject({
        status: BookingStatus.CANCELLED,
      })
      expect(email.sendAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: booking.email,
          sessionType: booking.service,
        })
      )
    })

    it('rejects invalid booking ID format', async () => {
      // Arrange
      const invalidBookingId = ''
      testDb.booking.findUnique.mockResolvedValue(null)

      // Act
      const request = makeCancellationRequest(invalidBookingId)
      const response = await POST(request, { params: Promise.resolve({ id: invalidBookingId }) })

      // Assert
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toMatchObject({
        error: 'Booking not found',
      })
    })
  })
})