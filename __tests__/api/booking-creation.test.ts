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
    findFirst: jest.fn(),
    create: jest.fn().mockResolvedValue(mockFullBooking),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(mockTx)
    }),
  },
}))

describe('createBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a booking successfully', async () => {
    mockTx.booking.findFirst.mockResolvedValue(null)
    const newBooking = await createBooking(mockBookingData)
    expect(newBooking).toEqual(mockFullBooking)
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

  it('should throw BookingConflictError on conflict', async () => {
    mockTx.booking.findFirst.mockResolvedValue(mockFullBooking)
    await expect(createBooking(mockBookingData)).rejects.toThrow(
      BookingConflictError
    )
  })

  it('should throw a generic error on other database errors', async () => {
    mockTx.booking.findFirst.mockResolvedValue(null)
    mockTx.booking.create.mockRejectedValue(new Error('DB error'))
    await expect(createBooking(mockBookingData)).rejects.toThrow(
      'Failed to create booking in database.'
    )
  })
})