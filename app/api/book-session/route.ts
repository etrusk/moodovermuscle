import { NextResponse } from 'next/server'
import {
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
  rateLimitStore,
} from '@/lib/rate-limit'
import { validateBookingRequest } from './functions/booking-validation'
import {
  createBooking,
  BookingConflictError,
} from './functions/booking-creation'
import { sendBookingNotifications } from './functions/booking-notification'

export async function POST(request: Request): Promise<NextResponse> {
  // Rate limiting per IP via x-forwarded-for header only
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ip = forwarded.split(',')[0]
    const now = Date.now()
    const prev = rateLimitStore[ip]
    if (prev && now - prev.firstRequest < RATE_LIMIT_WINDOW) {
      if (prev.count >= RATE_LIMIT_MAX) {
        console.warn(`Rate limit exceeded for IP ${ip}`)
        return NextResponse.json(
          { message: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
      rateLimitStore[ip] = {
        count: prev.count + 1,
        firstRequest: prev.firstRequest,
      }
    } else {
      rateLimitStore[ip] = { count: 1, firstRequest: now }
    }
  }

  try {
    const validationResult = await validateBookingRequest(request)
    if (!validationResult.success || !validationResult.data) {
      return (
        validationResult.error ??
        NextResponse.json({ message: 'Invalid data' }, { status: 400 })
      )
    }

    const newBooking = await createBooking(validationResult.data)

    sendBookingNotifications(newBooking)

    return NextResponse.json(
      { message: 'Booking submitted successfully!', data: newBooking },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing booking form:', error)

    if (error instanceof BookingConflictError) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to submit booking.', error: (error as Error).message },
      { status: 500 }
    )
  }
}
