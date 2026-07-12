import { prisma } from '../../../../lib/prisma'
import type { Booking } from '../../../../lib/generated/prisma/client'
import { z } from 'zod'
import { bookingSchema } from '../../../../lib/schemas'
import {
  validateRealTimeAvailability,
  AvailabilityConflictError,
} from '../../availability/functions/availability-checking'

type BookingData = z.infer<typeof bookingSchema>

export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingConflictError'
    // Ensure prototype chain is maintained for instanceof checks
    Object.setPrototypeOf(this, BookingConflictError.prototype)
  }
}

function handleBookingError(error: unknown): never {
  if (error instanceof BookingConflictError) {
    throw error
  }
  console.error('Error creating booking:', error)
  console.error('Error details:', {
    name: error instanceof Error ? error.name : 'Unknown',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  throw new Error(`Failed to create booking in database: ${error instanceof Error ? error.message : String(error)}`)
}

export async function createBooking(
  bookingData: BookingData
): Promise<Booking> {
  const {
    name,
    email,
    phone,
    service,
    date,
    time,
    message,
    goals,
    experience,
  } = bookingData

  try {
    const newBooking = await prisma.$transaction(async tx => {
      // Apply Real-Time Availability Pattern - validate within transaction
      try {
        await validateRealTimeAvailability(date, time, tx)
      } catch (error) {
        if (error instanceof AvailabilityConflictError) {
          throw new BookingConflictError(error.message)
        }
        throw error
      }

      // Create booking within transaction after availability validation
      return tx.booking.create({
        data: {
          name,
          email,
          phone: phone ?? null,
          service,
          date,
          time,
          message: message ?? null,
          goals,
          experience: experience ?? null,
        },
      })
    })

    return newBooking
  } catch (error) {
    handleBookingError(error)
  }
}
