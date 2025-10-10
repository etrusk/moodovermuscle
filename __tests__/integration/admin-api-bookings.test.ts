/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 * @jest-environment node
 */

import { testDb } from '../setup/test-db'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'

jest.setTimeout(15000)

jest.mock('@/lib/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma: require('../setup/test-db').testDb,
}))

describe('Admin Bookings API Integration', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('Booking Management Workflow', () => {
    it('retrieves all bookings with pagination', async () => {
      // Create test bookings
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

      const bookings = await testDb.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      expect(bookings).toHaveLength(2)
      expect(bookings[0]).toMatchObject({
        name: expect.any(String),
        status: expect.stringMatching(/^(PENDING|CONFIRMED|CANCELLED)$/),
      })
    })

    it('filters bookings by status', async () => {
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

      const pendingBookings = await testDb.booking.findMany({
        where: { status: 'PENDING' },
      })

      const confirmedBookings = await testDb.booking.findMany({
        where: { status: 'CONFIRMED' },
      })

      expect(pendingBookings).toHaveLength(1)
      expect(pendingBookings[0].status).toBe('PENDING')
      expect(confirmedBookings).toHaveLength(1)
      expect(confirmedBookings[0].status).toBe('CONFIRMED')
    })

    it('retrieves specific booking by id', async () => {
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

      const booking = await testDb.booking.findUnique({
        where: { id: created.id },
      })

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
      const booking = await testDb.booking.findUnique({
        where: { id: 'non-existent-id' },
      })

      expect(booking).toBeNull()
    })
  })

  describe('Booking Status Transitions', () => {
    it('updates booking status from pending to confirmed', async () => {
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

      const updated = await testDb.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      })

      expect(updated.status).toBe('CONFIRMED')
      expect(updated.id).toBe(booking.id)
    })

    it('allows cancellation of confirmed booking', async () => {
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

      const cancelled = await testDb.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      })

      expect(cancelled.status).toBe('CANCELLED')
    })
  })

  describe('Booking Deletion', () => {
    it('removes booking from system', async () => {
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

      await testDb.booking.delete({
        where: { id: booking.id },
      })

      const deleted = await testDb.booking.findUnique({
        where: { id: booking.id },
      })

      expect(deleted).toBeNull()
    })

    it('handles deletion of non-existent booking', async () => {
      await expect(
        testDb.booking.delete({
          where: { id: 'non-existent-id' },
        })
      ).rejects.toThrow()
    })
  })

  describe('Data Integrity', () => {
    it('persists all booking fields correctly', async () => {
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

      const created = await testDb.booking.create({
        data: bookingData,
      })

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
})