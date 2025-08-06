import {
  getAvailableTimesForDate,
  checkSingleSlotAvailability,
  validateRealTimeAvailability,
  AvailabilityConflictError,
} from '@/app/api/availability/functions/availability-checking'
import { prisma } from '@/lib/prisma'
import { timeSlots } from '@/components/booking-form/steps/timeSlots'

// Mock dependencies
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

// Helper functions to keep main describe block under line limit
const setupMockTransactionWithNoBookings = () => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = { booking: { findMany: jest.fn().mockResolvedValue([]) } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return callback(mockTx as any)
  })
}

const setupMockTransactionWithBookings = (
  bookings: Array<{ id: string; time: string }>
) => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = {
      booking: { findMany: jest.fn().mockResolvedValue(bookings) },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return callback(mockTx as any)
  })
}

const setupMockTransactionForSlotCheck = (result: unknown) => {
  mockPrisma.$transaction.mockImplementation(async callback => {
    const mockTx = {
      booking: { findFirst: jest.fn().mockResolvedValue(result) },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return callback(mockTx as any)
  })
}

describe('availability-checking', () => {
  const testDate = new Date('2024-12-25')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAvailableTimesForDate', () => {
    it('should return all available times when no bookings exist', async () => {
      setupMockTransactionWithNoBookings()
      const result = await getAvailableTimesForDate(testDate)
      expect(result).toEqual({
        availableTimes: timeSlots,
        bookedTimes: [],
        date: '2024-12-25',
      })
    })

    it('should return filtered available times when bookings exist', async () => {
      const existingBookings = [
        { id: '1', time: '09:00' },
        { id: '2', time: '14:00' },
      ]
      setupMockTransactionWithBookings(existingBookings)
      const result = await getAvailableTimesForDate(testDate)
      expect(result).toEqual({
        availableTimes: ['10:00', '11:00', '15:00', '16:00'],
        bookedTimes: ['09:00', '14:00'],
        date: '2024-12-25',
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))
      await expect(getAvailableTimesForDate(testDate)).rejects.toThrow(
        'Failed to fetch availability data'
      )
    })
  })

  describe('checkSingleSlotAvailability', () => {
    it('should return available when slot is free', async () => {
      setupMockTransactionForSlotCheck(null)
      const result = await checkSingleSlotAvailability(testDate, '10:00')
      expect(result).toEqual({ isAvailable: true })
    })

    it('should return unavailable when slot is booked', async () => {
      const conflictingBooking = { id: '1', date: testDate, time: '10:00' }
      setupMockTransactionForSlotCheck(conflictingBooking)
      const result = await checkSingleSlotAvailability(testDate, '10:00')
      expect(result).toEqual({ isAvailable: false, conflictingBooking })
    })

    it('should throw error for invalid time slot', async () => {
      setupMockTransactionForSlotCheck(null)
      await expect(
        checkSingleSlotAvailability(testDate, '99:00')
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))
      await expect(
        checkSingleSlotAvailability(testDate, '10:00')
      ).rejects.toThrow('Failed to check slot availability')
    })
  })

  describe('validateRealTimeAvailability', () => {
    it('should pass validation when slot is available', async () => {
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as any)
      ).resolves.not.toThrow()
      expect(mockClient.booking.findFirst).toHaveBeenCalledWith({
        where: { date: testDate, time: '10:00' },
      })
    })

    it('should throw AvailabilityConflictError when slot is booked', async () => {
      const conflictingBooking = {
        id: '1',
        date: testDate,
        time: '10:00',
        name: 'John Doe',
      }
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(conflictingBooking) },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as any)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('should throw error for invalid time slot', async () => {
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(
        validateRealTimeAvailability(testDate, '99:00', mockClient as any)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('should use default prisma client when no transaction client provided', async () => {
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
    it('should create error with message and optional conflicting booking', () => {
      const booking = { id: '1', name: 'John Doe' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = new AvailabilityConflictError(
        'Test message',
        booking as any
      )
      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBe(booking)
    })

    it('should create error without conflicting booking', () => {
      const error = new AvailabilityConflictError('Test message')
      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBeUndefined()
    })
  })
})
