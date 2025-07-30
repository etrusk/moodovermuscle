import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/schemas'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
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
        phone,
        service,
        date: date,
        time,
        message,
        goals,
        experience,
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
