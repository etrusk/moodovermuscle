import { NextResponse } from 'next/server'
import type { AvailabilityData, SingleSlotCheck } from './availability-checking'

// Availability is live booking state, and the single-slot variant is the
// pre-submit freshness check — caching it defeats the thing it exists to do.
// The previous 60s/30s CDN cache let the form offer a slot already taken, and
// made this endpoint unusable for verifying a booking actually landed. There
// is no load here worth shedding: the whole site takes a handful of bookings.
const NO_CACHE = 'no-store'

/**
 * Create response for single slot availability check
 */
export function createSingleSlotResponse(
  slotCheck: SingleSlotCheck,
  date: string,
  time: string
): NextResponse {
  return NextResponse.json(
    {
      isAvailable: slotCheck.isAvailable,
      date: date,
      time: time,
      ...(slotCheck.conflictingBooking && {
        conflictingBooking: slotCheck.conflictingBooking,
      }),
    },
    {
      status: 200,
      headers: { 'Cache-Control': NO_CACHE },
    }
  )
}

/**
 * Create response for full day availability
 */
export function createFullDayResponse(
  availabilityData: AvailabilityData
): NextResponse {
  return NextResponse.json(availabilityData, {
    status: 200,
    headers: { 'Cache-Control': NO_CACHE },
  })
}

/**
 * Create error response following Error Response Pattern
 */
export function createErrorResponse(
  error: Error,
  isAvailabilityConflict = false
): NextResponse {
  if (isAvailabilityConflict) {
    return NextResponse.json(
      {
        message: error.message,
        type: 'availability_conflict',
      },
      { status: 409 }
    )
  }

  return NextResponse.json(
    {
      message: 'Failed to fetch availability data',
      type: 'server_error',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
      }),
    },
    { status: 500 }
  )
}
