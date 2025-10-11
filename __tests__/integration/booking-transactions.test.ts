/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

// @ts-nocheck - Complex Prisma mock typing, focus on behavior

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
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true }),
}))

import { POST } from '@/app/api/book-session/route'
import { prisma } from '@/lib/prisma'
import { createTestBookingData } from '../setup/test-db-data'
import * as email from '@/lib/email'
import { 
  setupIntegrationTest, 
  teardownIntegrationTest 
} from '../setup/test-helpers'

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

describe('Booking Transaction Integrity Integration', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
    jest.clearAllMocks()
    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => await cb(mockPrisma)
    )
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Successful Transaction Flow', () => {
    it('creates booking within atomic transaction', async () => {
      const bookingData = createTestBookingData()
      const request = makeJsonRequest(bookingData)

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      const createdBooking = {
        ...bookingData,
        id: 'transaction-success-1',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      }
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(createdBooking)

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.data).toEqual(createdBooking)
    })

    it('persists booking data correctly', async () => {
      const bookingData = createTestBookingData({
        name: 'John Doe',
        email: 'john@example.com',
        service: '1-on-1 Personal Training',
      })

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      const createdBooking = {
        ...bookingData,
        id: 'persist-test-1',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      }
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(createdBooking)

      const response = await POST(makeJsonRequest(bookingData))
      const responseData = await response.json()

      expect(responseData).toHaveProperty('data')
      expect(responseData.data).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        service: '1-on-1 Personal Training',
      })
    })
  })

  describe('Conflict Detection and Prevention', () => {
    it('prevents double booking for same timeslot', async () => {
      const bookingData = createTestBookingData()
      const request = makeJsonRequest(bookingData)

      const existingBooking = {
        id: 'existing-booking',
        ...bookingData,
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      ;(mockPrisma.booking.create as jest.Mock).mockClear()
      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(existingBooking)

      const response = await POST(request)
      
      expect(response.status).toBe(409)
      const responseData = await response.json()
      expect(responseData.message).toMatch(/conflict/i)
      expect(mockPrisma.booking.create).not.toHaveBeenCalled()
    })

    it('allows bookings for different timeslots', async () => {
      const booking1 = createTestBookingData({ 
        time: '09:00 AM' 
      })
      const booking2 = createTestBookingData({ 
        time: '10:00 AM' 
      })

      ;(mockPrisma.booking.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      
      ;(mockPrisma.booking.create as jest.Mock)
        .mockResolvedValueOnce({
          ...booking1,
          id: 'slot-1',
          status: 'PENDING',
          sessionDuration: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: booking1.phone ?? null,
          message: booking1.message ?? null,
        })
        .mockResolvedValueOnce({
          ...booking2,
          id: 'slot-2',
          status: 'PENDING',
          sessionDuration: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: booking2.phone ?? null,
          message: booking2.message ?? null,
        })

      const [response1, response2] = await Promise.all([
        POST(makeJsonRequest(booking1)),
        POST(makeJsonRequest(booking2)),
      ])

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)

      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.data.time).toBe('09:00 AM')
      expect(data2.data.time).toBe('10:00 AM')
    })
  })

  describe('Email Notification Independence', () => {
    it('completes booking even if email notification fails', async () => {
      const bookingData = createTestBookingData()
      const request = makeJsonRequest(bookingData)

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      const createdBooking = {
        ...bookingData,
        id: 'email-fail-test',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      }
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(createdBooking)

      jest.spyOn(email, 'sendCustomerConfirmation').mockRejectedValue(
        new Error('Email service unavailable')
      )

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      const responseData = await response.json()
      expect(responseData.data).toEqual(createdBooking)
    })

    it('sends both customer and admin notifications on success', async () => {
      const bookingData = createTestBookingData()

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue({
        ...bookingData,
        id: 'notification-test',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      })

      await POST(makeJsonRequest(bookingData))

      // Email notifications don't block transaction
      expect(email.sendCustomerConfirmation).toHaveBeenCalled()
      expect(email.sendAdminNotification).toHaveBeenCalled()
    })
  })

  describe('Concurrent Booking Requests', () => {
    it('handles race condition for same timeslot', async () => {
      const bookingData = createTestBookingData()
      const request1 = makeJsonRequest(bookingData)
      const request2 = makeJsonRequest(bookingData)

      ;(mockPrisma.booking.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // First request: no conflict
        .mockResolvedValueOnce({     // Second request: conflict detected
          id: 'existing',
          ...bookingData,
          status: 'PENDING',
          sessionDuration: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      
      const createdBooking = {
        ...bookingData,
        id: 'race-winner',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      }
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(createdBooking)

      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ])

      const statuses = [response1.status, response2.status].sort()
      
      // One succeeds (201), one fails with conflict (409)
      expect(statuses).toEqual([201, 409])
    })
  })

  describe('Transaction Rollback Scenarios', () => {
    it('rolls back transaction on database constraint violation', async () => {
      const bookingData = createTestBookingData()

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.booking.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint violation')
      )

      const response = await POST(makeJsonRequest(bookingData))
      
      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Data Integrity', () => {
    it('maintains data consistency through transaction', async () => {
      const bookingData = createTestBookingData({
        name: 'Data Integrity Test',
        email: 'integrity@example.com',
        goals: 'Test Goals',
        experience: 'Beginner',
      })

      ;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue({
        ...bookingData,
        id: 'integrity-test',
        status: 'PENDING',
        sessionDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        phone: bookingData.phone ?? null,
        message: bookingData.message ?? null,
      })

      const response = await POST(makeJsonRequest(bookingData))
      const responseData = await response.json()

      expect(responseData.data).toMatchObject({
        name: 'Data Integrity Test',
        email: 'integrity@example.com',
        goals: 'Test Goals',
        experience: 'Beginner',
      })
    })
  })
})