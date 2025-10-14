import { vi, describe, it, expect, beforeEach } from 'vitest'

import {
  createBooking,
  BookingConflictError,
} from '@/app/api/book-session/functions/booking-creation'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/schemas'
import { z } from 'zod'

type BookingData = z.infer<typeof bookingSchema>

const mockBookingData: BookingData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '0412345678',
  service: '1-on-1 Personal Training',
  date: new Date(),
  time: '10:00',
  message: '',
  goals: 'community',
  experience: 'Beginner',
}

const mockFullBooking = {
  id: 'mock-booking-id',
  ...mockBookingData,
  status: 'PENDING',
  sessionDuration: 60,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockTx = {
  booking: {
    findFirst: vi.fn(),
    create: vi.fn().mockResolvedValue(mockFullBooking),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback(mockTx)
    }),
  },
}))

describe('createBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a booking successfully', async () => {
    // Arrange
    mockTx.booking.findFirst.mockResolvedValue(null)

    // Act
    const newBooking = await createBooking(mockBookingData)

    // Assert
    expect(newBooking).toStrictEqual(mockFullBooking)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(mockTx.booking.create).toHaveBeenCalledWith({
      data: {
        name: mockBookingData.name,
        email: mockBookingData.email,
        phone: mockBookingData.phone,
        service: mockBookingData.service,
        date: mockBookingData.date,
        time: mockBookingData.time,
        message: mockBookingData.message,
        goals: mockBookingData.goals,
        experience: mockBookingData.experience,
      },
    })
  })

  it('throws BookingConflictError on conflict', async () => {
    // Arrange
    mockTx.booking.findFirst.mockResolvedValue(mockFullBooking)

    // Act & Assert
    await expect(createBooking(mockBookingData)).rejects.toThrow(
      BookingConflictError
    )
  })

  it('throws a generic error on other database errors', async () => {
    // Arrange
    mockTx.booking.findFirst.mockResolvedValue(null)
    mockTx.booking.create.mockRejectedValue(new Error('DB error'))

    // Act & Assert
    await expect(createBooking(mockBookingData)).rejects.toThrow(
      'Failed to create booking in database: DB error'
    )
  })
})