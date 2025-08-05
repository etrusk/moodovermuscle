import { prisma } from '../../../../lib/prisma'
import type { Booking } from '../../../../lib/generated/prisma'
import { z } from 'zod'
import { bookingSchema } from '../../../../lib/schemas'

type BookingData = z.infer<typeof bookingSchema>

export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingConflictError'
  }
}

export async function createBooking(
  bookingData: BookingData
): Promise<Booking> {
  const { name, email, phone, service, date, time, message, goals, experience } =
    bookingData

  try {
    const newBooking = await prisma.$transaction(async (tx) => {
      // Conflict detection: ensure no existing booking at same date and time
      const conflict = await tx.booking.findFirst({
        where: { date, time },
      })
      if (conflict) {
        throw new BookingConflictError(
          'Booking conflict: Selected date and time is already booked.'
        )
      }
      // Create booking within transaction
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
    if (error instanceof BookingConflictError) {
      throw error
    }
    console.error('Error creating booking:', error)
    throw new Error('Failed to create booking in database.')
  }
}