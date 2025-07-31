import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/schemas'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'
import {
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
  rateLimitStore,
} from '@/lib/rate-limit'

export async function POST(request: Request) {
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
    let formData
    try {
      formData = await request.json()
    } catch {
      return NextResponse.json(
        { message: 'Invalid form data.' },
        { status: 400 }
      )
    }
    const validatedData = bookingSchema.safeParse(formData)

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: 'Invalid form data.',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

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
    } = validatedData.data

    const newBooking = await prisma.booking.create({
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

    // Send emails without awaiting them to avoid blocking the response
    sendCustomerConfirmation({
      customerName: name,
      customerEmail: email,
      sessionType: service,
      sessionDate: date.toLocaleDateString('en-AU'),
      sessionTime: time,
      goals,
      experience,
    })
      .then(res => {
        if (!res.success) {
          console.error(
            'Failed to send customer confirmation email:',
            res.error
          )
        }
      })
      .catch(err => {
        console.error('Error in sendCustomerConfirmation:', err)
      })

    sendAdminNotification({
      customerName: name,
      customerEmail: email,
      sessionType: service,
      sessionDate: date.toLocaleDateString('en-AU'),
      sessionTime: time,
      goals,
      experience,
    })
      .then(res => {
        if (!res.success) {
          console.error('Failed to send admin notification email:', res.error)
        }
      })
      .catch(err => {
        console.error('Error in sendAdminNotification:', err)
      })

    return NextResponse.json(
      { message: 'Booking submitted successfully!', data: newBooking },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing booking form:', error)
    return NextResponse.json(
      { message: 'Failed to submit booking.', error: (error as Error).message },
      { status: 500 }
    )
  }
}
export { RATE_LIMIT_MAX, rateLimitStore }
