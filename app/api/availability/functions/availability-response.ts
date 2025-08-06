import { NextResponse } from 'next/server'
import type { AvailabilityData, SingleSlotCheck } from './availability-checking'

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
      // Shorter cache for single slot checks to ensure real-time accuracy
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=15',
      },
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
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
    },
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
