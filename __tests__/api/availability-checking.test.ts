import {
  getAvailableTimesForDate,
  checkSingleSlotAvailability,
  validateRealTimeAvailability,
  AvailabilityConflictError,
} from '@/app/api/availability/functions/availability-checking'
import { prisma } from '@/lib/prisma'
import { timeSlots } from '@/components/booking-form/steps/timeSlots'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('@/components/booking-form/steps/timeSlots', () => ({
  timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

interface MockBooking {
  id: string
  time: string
}

const setupMockTransactionWithNoBookings = (): void => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = { booking: { findMany: jest.fn().mockResolvedValue([]) } }
    return callback(mockTx as never)
  })
}

const setupMockTransactionWithBookings = (bookings: MockBooking[]): void => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = {
      booking: { findMany: jest.fn().mockResolvedValue(bookings) },
    }
    return callback(mockTx as never)
  })
}

const setupMockTransactionForSlotCheck = (result: unknown): void => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = {
      booking: { findFirst: jest.fn().mockResolvedValue(result) },
    }
    return callback(mockTx as never)
  })
}

describe('availability-checking', () => {
  const testDate = new Date('2024-12-25')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAvailableTimesForDate', () => {
    it('returns all available times when no bookings exist', async () => {
      setupMockTransactionWithNoBookings()

      const result = await getAvailableTimesForDate(testDate)

      expect(result).toStrictEqual({
        availableTimes: timeSlots,
        bookedTimes: [],
        date: '2024-12-25',
      })
    })

    it('returns filtered available times when bookings exist', async () => {
      const existingBookings: MockBooking[] = [
        { id: '1', time: '09:00' },
        { id: '2', time: '14:00' },
      ]
      setupMockTransactionWithBookings(existingBookings)

      const result = await getAvailableTimesForDate(testDate)

      expect(result).toStrictEqual({
        availableTimes: ['10:00', '11:00', '15:00', '16:00'],
        bookedTimes: ['09:00', '14:00'],
        date: '2024-12-25',
      })
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      await expect(getAvailableTimesForDate(testDate)).rejects.toThrow(
        'Failed to fetch availability data'
      )
    })
  })

  describe('checkSingleSlotAvailability', () => {
    it('returns available when slot is free', async () => {
      setupMockTransactionForSlotCheck(null)

      const result = await checkSingleSlotAvailability(testDate, '10:00')

      expect(result).toStrictEqual({ isAvailable: true })
    })

    it('returns unavailable when slot is booked', async () => {
      const conflictingBooking = { id: '1', date: testDate, time: '10:00' }
      setupMockTransactionForSlotCheck(conflictingBooking)

      const result = await checkSingleSlotAvailability(testDate, '10:00')

      expect(result).toStrictEqual({ isAvailable: false, conflictingBooking })
    })

    it('throws error for invalid time slot', async () => {
      setupMockTransactionForSlotCheck(null)

      await expect(
        checkSingleSlotAvailability(testDate, '99:00')
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      await expect(
        checkSingleSlotAvailability(testDate, '10:00')
      ).rejects.toThrow('Failed to check slot availability')
    })
  })

  describe('validateRealTimeAvailability', () => {
    it('passes validation when slot is available', async () => {
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }

      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as never)
      ).resolves.not.toThrow()

      expect(mockClient.booking.findFirst).toHaveBeenCalledWith({
        where: { date: testDate, time: '10:00' },
      })
    })

    it('throws AvailabilityConflictError when slot is booked', async () => {
      const conflictingBooking = {
        id: '1',
        date: testDate,
        time: '10:00',
        name: 'John Doe',
      }
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(conflictingBooking) },
      }

      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as never)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('throws error for invalid time slot', async () => {
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }

      await expect(
        validateRealTimeAvailability(testDate, '99:00', mockClient as never)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('uses default prisma client when no transaction client provided', async () => {
      mockPrisma.booking.findFirst = jest.fn().mockResolvedValue(null)

      await expect(
        validateRealTimeAvailability(testDate, '10:00')
      ).resolves.not.toThrow()

      expect(mockPrisma.booking.findFirst).toHaveBeenCalledWith({
        where: { date: testDate, time: '10:00' },
      })
    })
  })

  describe('AvailabilityConflictError', () => {
    it('creates error with message and optional conflicting booking', () => {
      const booking = { id: '1', name: 'John Doe' }

      const error = new AvailabilityConflictError('Test message', booking as never)

      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBe(booking)
    })

    it('creates error without conflicting booking', () => {
      const error = new AvailabilityConflictError('Test message')

      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBeUndefined()
    })
  })
})
