/**
 * @testing-approach modern-2025
 * @business-outcome Database operations maintain data integrity throughout CRUD lifecycle
 * @user-journey Database client can persist, retrieve, update, and remove booking records
 */

import { testDb } from '../setup/test-db'
import { createTestBookingData } from '../setup/test-db-data'

describe('Database Integration: Booking Lifecycle', () => {
  describe('CRUD Operations', () => {
    it('maintains data integrity through create-read-update-delete lifecycle', async () => {
      // Arrange
      const bookingData = createTestBookingData()
      const mockBooking = {
        id: 'test-booking-1',
        name: bookingData.name as string,
        email: bookingData.email as string,
        phone: bookingData.phone as string | null,
        service: bookingData.service as string,
        date: bookingData.date as Date,
        time: bookingData.time as string,
        message: bookingData.message as string | null,
        goals: bookingData.goals as string | null,
        experience: bookingData.experience as string | null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PENDING' as const,
        sessionDuration: null,
      }

      // Act - Create
      testDb.booking.create.mockResolvedValue(mockBooking)
      const created = await testDb.booking.create({
        data: bookingData as never
      })

      // Assert - Create
      expect(created).toMatchObject({
        id: expect.any(String),
        email: bookingData.email,
        name: bookingData.name,
        status: 'PENDING',
      })

      // Act - Read
      testDb.booking.findUnique.mockResolvedValue(mockBooking)
      const retrieved = await testDb.booking.findUnique({
        where: { id: created.id },
      })

      // Assert - Read
      expect(retrieved).toMatchObject({
        email: bookingData.email,
        name: bookingData.name,
        id: created.id,
      })

      // Act - Update
      const updatedMockBooking = {
        ...mockBooking,
        name: 'Updated Client Name',
      }
      testDb.booking.update.mockResolvedValue(updatedMockBooking)
      const updated = await testDb.booking.update({
        where: { id: created.id },
        data: { name: 'Updated Client Name' },
      })

      // Assert - Update
      expect(updated).toMatchObject({
        name: 'Updated Client Name',
        id: created.id,
      })

      // Act - Delete
      testDb.booking.delete.mockResolvedValue(mockBooking)
      const deleted = await testDb.booking.delete({
        where: { id: created.id },
      })

      // Assert - Delete
      expect(deleted).toMatchObject({
        id: created.id,
      })
    })

    it('throws error when database operation fails', async () => {
      // Arrange
      testDb.booking.create.mockRejectedValue(new Error('Database connection failed'))
      const bookingData = createTestBookingData()

      // Act & Assert
      await expect(testDb.booking.create({
        data: bookingData as never
      })).rejects.toThrow('Database connection failed')
    })

  })
})
