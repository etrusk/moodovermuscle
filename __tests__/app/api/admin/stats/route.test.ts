import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
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

import { GET } from '@/app/api/admin/stats/route'

// Mock admin auth check
vi.mock('@/lib/utils/admin-auth-check', () => ({
  verifyAdminAuth: vi.fn(),
}))

describe('app/api/admin/stats/route', () => {
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

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('should return dashboard statistics for authenticated admin', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      // Mock Prisma count queries
      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(150) // Total bookings
        .mockResolvedValueOnce(12)  // Pending bookings
        .mockResolvedValueOnce(5)   // Today's bookings
        .mockResolvedValueOnce(28)  // Weekly bookings

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
          'x-admin-email': 'emily@moodovermuscle.com.au',
        },
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        totalBookings: 150,
        pendingBookings: 12,
        todayBookings: 5,
        thisWeekBookings: 28,
      })
      expect(testDb.booking.count).toHaveBeenCalledTimes(4)
    })

    it('should query pending bookings with correct status filter', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(15)

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
          'x-admin-email': 'emily@moodovermuscle.com.au',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(testDb.booking.count).toHaveBeenNthCalledWith(2, {
        where: {
          status: 'PENDING',
        },
      })
    })

    it('should query today bookings with correct date range', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(15)

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      const thirdCall = vi.mocked(testDb.booking.count).mock.calls[2][0]
      expect(thirdCall).toHaveProperty('where.date.gte')
      expect(thirdCall).toHaveProperty('where.date.lt')
      
      const dateFilter = thirdCall?.where?.date as any
      const gte = dateFilter?.gte as Date
      const lt = dateFilter?.lt as Date
      
      // Verify it's querying for today
      expect(gte.getHours()).toBe(0)
      expect(gte.getMinutes()).toBe(0)
      expect(gte.getSeconds()).toBe(0)
      
      // Verify upper bound is 24 hours later
      expect(lt.getTime() - gte.getTime()).toBe(24 * 60 * 60 * 1000)
    })

    it('should query weekly bookings with correct date range', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(15)

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      const fourthCall = vi.mocked(testDb.booking.count).mock.calls[3][0]
      expect(fourthCall).toHaveProperty('where.date.gte')
      
      const dateFilter2 = fourthCall?.where?.date as any
      const gte = dateFilter2?.gte as Date
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const expectedWeekAgo = new Date(today)
      expectedWeekAgo.setDate(today.getDate() - 7)
      
      // Verify it's querying for last 7 days
      expect(gte.getTime()).toBe(expectedWeekAgo.getTime())
    })

    it('should return 500 on database error', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.count).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({
        error: 'Failed to fetch dashboard statistics',
      })
    })

    it('should handle zero bookings across all categories', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        totalBookings: 0,
        pendingBookings: 0,
        todayBookings: 0,
        thisWeekBookings: 0,
      })
    })

    it('should execute all queries in parallel using Promise.all', async () => {
      // Arrange
      vi.mocked(adminAuthCheck.verifyAdminAuth).mockReturnValue({
        adminId: 'admin-123',
        adminEmail: 'emily@moodovermuscle.com.au',
        error: null,
      })

      const promiseAllSpy = vi.spyOn(Promise, 'all')
      
      vi.mocked(testDb.booking.count)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(25)

      const request = new NextRequest('http://localhost:3000/api/admin/stats', {
        method: 'GET',
      })

      // Act
      await GET(request)

      // Assert
      expect(promiseAllSpy).toHaveBeenCalled()
      
      // Cleanup
      promiseAllSpy.mockRestore()
    })
  })
})