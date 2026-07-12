import { prisma } from '@/lib/prisma'
import { timeSlots } from '@/components/booking-form/steps/timeSlots'
import type { Booking } from '@/lib/generated/prisma/client'

export interface AvailabilityData {
  availableTimes: string[]
  bookedTimes: string[]
  date: string
}

export interface SingleSlotCheck {
  isAvailable: boolean
  conflictingBooking?: Pick<Booking, 'id' | 'date' | 'time'>
}

export class AvailabilityConflictError extends Error {
  constructor(
    message: string,
    public readonly conflictingBooking?: Booking
  ) {
    super(message)
    this.name = 'AvailabilityConflictError'
  }
}

/**
 * Get all available time slots for a specific date using transaction-safe reading
 * Applies Transaction Safety Pattern for consistent data reads
 */
export async function getAvailableTimesForDate(
  date: Date
): Promise<AvailabilityData> {
  try {
    return await prisma.$transaction(async tx => {
      // Get all existing bookings for the date within transaction
      const existingBookings = await tx.booking.findMany({
        where: {
          date: date,
          // Only consider confirmed/pending bookings, not cancelled ones
          // Add status filter if booking status is implemented
        },
        select: {
          id: true,
          time: true,
        },
      })

      const bookedTimes = existingBookings.map(booking => booking.time)
      const availableTimes = timeSlots.filter(
        slot => !bookedTimes.includes(slot)
      )

      return {
        availableTimes,
        bookedTimes,
        date: date.toISOString().split('T')[0],
      }
    })
  } catch (error) {
    console.error('Error fetching availability for date:', error)
    throw new Error('Failed to fetch availability data')
  }
}

/**
 * Check if a specific time slot is available using transaction-safe validation
 * Used during booking process to prevent race conditions
 */
export async function checkSingleSlotAvailability(
  date: Date,
  time: string
): Promise<SingleSlotCheck> {
  try {
    return await prisma.$transaction(async tx => {
      // Check for existing booking at the exact date and time
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          date: date,
          time: time,
        },
        select: {
          id: true,
          date: true,
          time: true,
        },
      })

      if (conflictingBooking) {
        return {
          isAvailable: false,
          conflictingBooking,
        }
      }

      // Verify the time slot is in our allowed time slots
      if (!timeSlots.includes(time)) {
        throw new AvailabilityConflictError(
          `Invalid time slot: ${time}. Must be one of the available time slots.`
        )
      }

      return {
        isAvailable: true,
      }
    })
  } catch (error) {
    if (error instanceof AvailabilityConflictError) {
      throw error
    }
    console.error('Error checking single slot availability:', error)
    throw new Error('Failed to check slot availability')
  }
}

/**
 * Real-time availability validation for booking process
 * Integrates with booking transaction to prevent conflicts
 */
export async function validateRealTimeAvailability(
  date: Date,
  time: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionClient?: any // Transaction client type varies, using any for flexibility
): Promise<void> {
  const client = transactionClient || prisma

  const conflictingBooking = await client.booking.findFirst({
    where: {
      date: date,
      time: time,
    },
  })

  if (conflictingBooking) {
    throw new AvailabilityConflictError(
      `Booking conflict: Selected date ${date.toISOString().split('T')[0]} and time ${time} is no longer available.`,
      conflictingBooking
    )
  }

  // Verify the time slot is still valid
  if (!timeSlots.includes(time)) {
    throw new AvailabilityConflictError(
      `Invalid time slot: ${time}. This time slot is not available for booking.`
    )
  }
}
