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
      // Arrange
      setupMockTransactionWithNoBookings()

      // Act
      const result = await getAvailableTimesForDate(testDate)

      // Assert
      expect(result).toStrictEqual({
        availableTimes: timeSlots,
        bookedTimes: [],
        date: '2024-12-25',
      })
    })

    it('returns filtered available times when bookings exist', async () => {
      // Arrange
      const existingBookings: MockBooking[] = [
        { id: '1', time: '09:00' },
        { id: '2', time: '14:00' },
      ]
      setupMockTransactionWithBookings(existingBookings)

      // Act
      const result = await getAvailableTimesForDate(testDate)

      // Assert
      expect(result).toStrictEqual({
        availableTimes: ['10:00', '11:00', '15:00', '16:00'],
        bookedTimes: ['09:00', '14:00'],
        date: '2024-12-25',
      })
    })

    it('handles database errors gracefully', async () => {
      // Arrange
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(getAvailableTimesForDate(testDate)).rejects.toThrow(
        'Failed to fetch availability data'
      )
    })
  })

  describe('checkSingleSlotAvailability', () => {
    it('returns available when slot is free', async () => {
      // Arrange
      setupMockTransactionForSlotCheck(null)

      // Act
      const result = await checkSingleSlotAvailability(testDate, '10:00')

      // Assert
      expect(result).toStrictEqual({ isAvailable: true })
    })

    it('returns unavailable when slot is booked', async () => {
      // Arrange
      const conflictingBooking = { id: '1', date: testDate, time: '10:00' }
      setupMockTransactionForSlotCheck(conflictingBooking)

      // Act
      const result = await checkSingleSlotAvailability(testDate, '10:00')

      // Assert
      expect(result).toStrictEqual({ isAvailable: false, conflictingBooking })
    })

    it('throws error for invalid time slot', async () => {
      // Arrange
      setupMockTransactionForSlotCheck(null)

      // Act & Assert
      await expect(
        checkSingleSlotAvailability(testDate, '99:00')
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('handles database errors gracefully', async () => {
      // Arrange
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      // Act & Assert
      await expect(
        checkSingleSlotAvailability(testDate, '10:00')
      ).rejects.toThrow('Failed to check slot availability')
    })
  })

  describe('validateRealTimeAvailability', () => {
    it('passes validation when slot is available', async () => {
      // Arrange
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }

      // Act & Assert
      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as never)
      ).resolves.not.toThrow()

      expect(mockClient.booking.findFirst).toHaveBeenCalledWith({
        where: { date: testDate, time: '10:00' },
      })
    })

    it('throws AvailabilityConflictError when slot is booked', async () => {
      // Arrange
      const conflictingBooking = {
        id: '1',
        date: testDate,
        time: '10:00',
        name: 'John Doe',
      }
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(conflictingBooking) },
      }

      // Act & Assert
      await expect(
        validateRealTimeAvailability(testDate, '10:00', mockClient as never)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('throws error for invalid time slot', async () => {
      // Arrange
      const mockClient = {
        booking: { findFirst: jest.fn().mockResolvedValue(null) },
      }

      // Act & Assert
      await expect(
        validateRealTimeAvailability(testDate, '99:00', mockClient as never)
      ).rejects.toThrow(AvailabilityConflictError)
    })

    it('uses default prisma client when no transaction client provided', async () => {
      // Arrange
      mockPrisma.booking.findFirst = jest.fn().mockResolvedValue(null)

      // Act & Assert
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
      // Arrange
      const booking = { id: '1', name: 'John Doe' }

      // Act
      const error = new AvailabilityConflictError('Test message', booking as never)

      // Assert
      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBe(booking)
    })

    it('creates error without conflicting booking', () => {
      // Arrange & Act
      const error = new AvailabilityConflictError('Test message')

      // Assert
      expect(error.name).toBe('AvailabilityConflictError')
      expect(error.message).toBe('Test message')
      expect(error.conflictingBooking).toBeUndefined()
    })
  })
})
