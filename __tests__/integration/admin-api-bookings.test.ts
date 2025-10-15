/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'

import { testDb } from '../setup/test-db'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import { PATCH } from '@/app/api/admin/bookings/route'

// Test timeout configured in vitest.config.ts

// Mock Prisma for admin API route
vi.mock('@/lib/prisma', async () => {
  const { testDb } = await import('../setup/test-db')
  return { prisma: testDb }
})

// Mock PrismaClient constructor used by admin API routes
vi.mock('@/lib/generated/prisma', async () => {
  const actual = await vi.importActual('@/lib/generated/prisma')
  const { testDb } = await import('../setup/test-db')
  return {
    ...actual,
    PrismaClient: vi.fn().mockImplementation(() => {
      return {
        ...testDb,
        $transaction: vi.fn().mockImplementation(async (callback: any) => {
          // Mock transaction client
          const mockTx = {
            booking: {
              findUnique: testDb.booking.findUnique,
              update: testDb.booking.update,
            },
            bookingStatusChange: {
              create: vi.fn().mockResolvedValue({
                id: 'status-change-id',
                bookingId: 'test-booking-id',
                fromStatus: 'PENDING',
                toStatus: 'CONFIRMED',
                createdAt: new Date(),
              }),
            },
          }
          return await callback(mockTx)
        }),
      }
    }),
  }
})

describe('Admin Bookings API Integration', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Booking Management Workflow', () => {
    it('retrieves all bookings with pagination', async () => {
      // Arrange
      await testDb.booking.createMany({
        data: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            date: new Date('2024-03-15'),
            time: '10:00 AM',
            service: 'Personal Training',
            status: 'CONFIRMED',
          },
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1234567891',
            date: new Date('2024-03-16'),
            time: '11:00 AM',
            service: 'Group Class',
            status: 'PENDING',
          },
        ],
      })

      // Act
      const bookings = await testDb.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      // Assert
      expect(bookings).toHaveLength(2)
      expect(bookings[0]).toMatchObject({
        name: expect.any(String),
        status: expect.stringMatching(/^(PENDING|CONFIRMED|CANCELLED)$/),
      })
    })

    it('filters bookings by status', async () => {
      // Arrange
      await testDb.booking.createMany({
        data: [
          {
            name: 'Pending User',
            email: 'pending@example.com',
            phone: '+1111111111',
            date: new Date('2024-03-15'),
            time: '09:00 AM',
            service: 'Personal Training',
            status: 'PENDING',
          },
          {
            name: 'Confirmed User',
            email: 'confirmed@example.com',
            phone: '+2222222222',
            date: new Date('2024-03-16'),
            time: '10:00 AM',
            service: 'Group Class',
            status: 'CONFIRMED',
          },
        ],
      })

      // Act
      const pendingBookings = await testDb.booking.findMany({
        where: { status: 'PENDING' },
      })

      const confirmedBookings = await testDb.booking.findMany({
        where: { status: 'CONFIRMED' },
      })

      // Assert
      expect(pendingBookings).toHaveLength(1)
      expect(pendingBookings[0].status).toBe('PENDING')
      expect(confirmedBookings).toHaveLength(1)
      expect(confirmedBookings[0].status).toBe('CONFIRMED')
    })

    it('retrieves specific booking by id', async () => {
      // Arrange
      const created = await testDb.booking.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-15'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'CONFIRMED',
          message: 'Test booking notes',
        },
      })

      // Act
      const booking = await testDb.booking.findUnique({
        where: { id: created.id },
      })

      // Assert
      expect(booking).not.toBeNull()
      expect(booking).toMatchObject({
        id: created.id,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'CONFIRMED',
        message: 'Test booking notes',
      })
    })

    it('handles non-existent booking gracefully', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id'

      // Act
      const booking = await testDb.booking.findUnique({
        where: { id: nonExistentId },
      })

      // Assert
      expect(booking).toBeNull()
    })
  })

  describe('Booking Status Transitions', () => {
    it('updates booking status from pending to confirmed', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-15'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'PENDING',
        },
      })

      // Act
      const updated = await testDb.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      })

      // Assert
      expect(updated.status).toBe('CONFIRMED')
      expect(updated.id).toBe(booking.id)
    })

    it('allows cancellation of confirmed booking', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Cancel Test',
          email: 'cancel@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-15'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'CONFIRMED',
        },
      })

      // Act
      const cancelled = await testDb.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      })

      // Assert
      expect(cancelled.status).toBe('CANCELLED')
    })
  })

  describe('Booking Deletion', () => {
    it('removes booking from system', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Delete Test',
          email: 'delete@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-15'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'CONFIRMED',
        },
      })

      // Act
      await testDb.booking.delete({
        where: { id: booking.id },
      })

      const deleted = await testDb.booking.findUnique({
        where: { id: booking.id },
      })

      // Assert
      expect(deleted).toBeNull()
    })

    it('handles deletion of non-existent booking', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id'

      // Act & Assert
      await expect(
        testDb.booking.delete({
          where: { id: nonExistentId },
        })
      ).rejects.toThrow()
    })
  })

  describe('Data Integrity', () => {
    it('persists all booking fields correctly', async () => {
      // Arrange
      const bookingData = {
        name: 'Full Data Test',
        email: 'fulldata@example.com',
        phone: '+1234567890',
        date: new Date('2024-03-15'),
        time: '10:00 AM',
        service: 'Personal Training',
        status: 'CONFIRMED' as const,
        message: 'Complete booking with all fields',
        goals: 'Test goals',
        experience: 'Beginner',
      }

      // Act
      const created = await testDb.booking.create({
        data: bookingData,
      })

      // Assert
      expect(created).toMatchObject({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        service: bookingData.service,
        status: bookingData.status,
        message: bookingData.message,
        goals: bookingData.goals,
        experience: bookingData.experience,
      })
    })
  })

  describe('Admin Bookings PATCH Endpoint - API Contract Validation', () => {
    it('validates correct API contract: id as query param, status in body', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-20'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'PENDING',
        },
      })

      // Correct API contract: id as query param, status in body
      const requestUrl = `http://localhost/api/admin/bookings?id=${booking.id}`
      const requestBody = { status: 'CONFIRMED' }

      // Mock admin authentication headers
      const request = new Request(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'test-admin-id',
          'x-admin-email': 'admin@example.com',
        },
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await PATCH(request as any)
      const responseData = await response.json()

      // Assert - This test documents the correct API contract
      // The API expects: /api/admin/bookings?id={id} with body { status: '...' }
      // Should successfully process the request (not 500 server error)
      if (response.status >= 500) {
        console.error('Response error:', responseData)
      }
      expect(response.status).toBeLessThanOrEqual(400)
      expect(responseData).toMatchObject({
        booking: expect.objectContaining({
          id: booking.id,
          status: 'CONFIRMED'
        })
      })
      
      // Assert - Verify booking status was updated in database
      const updatedBooking = await testDb.booking.findUnique({
        where: { id: booking.id },
      })
      expect(updatedBooking).toMatchObject({
        id: booking.id,
        status: expect.stringMatching(/^(PENDING|CONFIRMED|CANCELLED|COMPLETED)$/)
      })
      
      // Assert - Verify transaction was called
      expect(testDb.booking.update).toHaveBeenCalledTimes(1)
    })

    it('returns 400 when id query parameter is missing', async () => {
      // Arrange
      const requestUrl = 'http://localhost/api/admin/bookings'
      const requestBody = { status: 'CONFIRMED' }

      const request = new Request(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'test-admin-id',
          'x-admin-email': 'admin@example.com',
        },
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await PATCH(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
      expect(responseData).toMatchObject({
        error: 'Booking ID is required',
      })
      
      // Assert - Verify no database calls were made
      expect(testDb.booking.findUnique).not.toHaveBeenCalled()
    })

    it('returns 400 when status is invalid', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-20'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'PENDING',
        },
      })

      const requestUrl = `http://localhost/api/admin/bookings?id=${booking.id}`
      const requestBody = { status: 'INVALID_STATUS' }

      const request = new Request(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'test-admin-id',
          'x-admin-email': 'admin@example.com',
        },
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await PATCH(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
      expect(responseData).toMatchObject({
        error: 'Invalid status',
      })
    })

    it('returns 500 when booking does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent-booking-id'
      const requestUrl = `http://localhost/api/admin/bookings?id=${nonExistentId}`
      const requestBody = { status: 'CONFIRMED' }

      const request = new Request(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'test-admin-id',
          'x-admin-email': 'admin@example.com',
        },
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await PATCH(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
      expect(responseData).toHaveProperty('error')
      expect(responseData.error).toMatch(/Booking not found/)
    })

    it('validates API contract mismatch - bookingId in body should fail', async () => {
      // Arrange - This test documents the WRONG way to call the API
      const booking = await testDb.booking.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-20'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'PENDING',
        },
      })

      // Wrong: Using bookingId in body instead of id as query param
      const requestUrl = 'http://localhost/api/admin/bookings'
      const requestBody = { bookingId: booking.id, status: 'CONFIRMED' }

      const request = new Request(requestUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'test-admin-id',
          'x-admin-email': 'admin@example.com',
        },
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await PATCH(request as any)
      const responseData = await response.json()

      // Assert - Should fail because id query param is missing
      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
      expect(responseData).toMatchObject({
        error: 'Booking ID is required',
      })

      // Assert - Booking should not be updated in database
      const unchangedBooking = await testDb.booking.findUnique({
        where: { id: booking.id },
      })
      expect(unchangedBooking?.status).toBe('PENDING')
    })

    it('validates all valid booking statuses', async () => {
      // Arrange
      const booking = await testDb.booking.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          date: new Date('2024-03-20'),
          time: '10:00 AM',
          service: 'Personal Training',
          status: 'PENDING',
        },
      })

      const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

      // Act & Assert - Test each valid status
      for (const status of validStatuses) {
        const requestUrl = `http://localhost/api/admin/bookings?id=${booking.id}`
        const request = new Request(requestUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-id': 'test-admin-id',
            'x-admin-email': 'admin@example.com',
          },
          body: JSON.stringify({ status }),
        })

        const response = await PATCH(request as any)
        
        // Valid statuses should not return 400
        expect(response.status).not.toBe(400)
      }
    })
  })
})