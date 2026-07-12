import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import * as adminAuthCheck from '@/lib/utils/admin-auth-check'
import { testDb } from '@/__tests__/setup/test-db'

// Mock PrismaClient constructor to return testDb instance
vi.mock('@/lib/generated/prisma', () => {
  let db: any
  return {
    PrismaClient: vi.fn().mockImplementation(function () {
      if (!db) {
        db = testDb
      }
      return db
    }),
  }
})

import { GET, PATCH } from '@/app/api/admin/bookings/route'

// Mock admin auth check
vi.mock('@/lib/utils/admin-auth-check', () => ({
  verifyAdminAuth: vi.fn(),
}))

describe('app/api/admin/bookings/route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET handler', () => {
    it('should return 401 if admin auth check fails', async () => {
      // Arrange
      const mockErrorResponse = {
        json: vi.fn().mockResolvedValue({ error: 'Admin authentication required' }),
        status: 401,
      }
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: null,
        adminEmail: null,
        error: mockErrorResponse as any,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/bookings', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('should filter bookings by status parameter', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      const mockBookings = [{ id: '1', status: 'PENDING' }]
      vi.mocked(testDb.booking.findMany).mockResolvedValue(mockBookings as any)

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?status=PENDING', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      expect(testDb.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      )
    })

    it('should apply search filter to name and email', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?search=john', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      const callArgs = vi.mocked(testDb.booking.findMany).mock.calls[0][0]
      expect(callArgs?.where?.OR).toEqual([
        { name: { contains: 'john', mode: 'insensitive' } },
        { email: { contains: 'john', mode: 'insensitive' } },
      ])
    })

    it('should apply limit parameter for pagination', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?limit=10', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      expect(testDb.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      )
    })

    it('should return 500 on database error', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.findMany).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/bookings', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Failed to fetch bookings' })
    })
  })

  describe('PATCH handler', () => {
    it('should return 400 if booking ID is missing', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })

      // Act
      const response = await PATCH(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Booking ID is required' })
    })

    it('should return 400 for invalid status', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?id=booking-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      })

      // Act
      const response = await PATCH(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Invalid status' })
    })

    it('should update booking status successfully', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      const mockBooking = { id: 'booking-123', status: 'CONFIRMED' }
      vi.mocked(testDb.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          booking: {
            findUnique: vi.fn().mockResolvedValue({ id: 'booking-123', status: 'PENDING' }),
            update: vi.fn().mockResolvedValue(mockBooking),
          },
          bookingStatusChange: {
            create: vi.fn().mockResolvedValue({}),
          },
        })
      })

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?id=booking-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })

      // Act
      const response = await PATCH(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({ booking: mockBooking })
    })

    it('should return 500 on database error', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.$transaction).mockRejectedValue(new Error('Booking not found'))

      const request = new NextRequest('http://localhost:3000/api/admin/bookings?id=booking-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })

      // Act
      const response = await PATCH(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Booking not found' })
    })
  })
})