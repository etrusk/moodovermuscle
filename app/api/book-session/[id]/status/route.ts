import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { Booking, BookingStatus, Prisma } from '../../../../../lib/generated/prisma'
import {
  sendCustomerConfirmation,
  sendAdminNotification,
} from '../../../../../lib/email'

async function validateStatus(toStatus: BookingStatus): Promise<NextResponse | null> {
  const validStatuses = Object.values(BookingStatus)
  if (!validStatuses.includes(toStatus)) {
    return NextResponse.json(
      { error: `Invalid status: ${toStatus}` },
      { status: 400 }
    )
  }
  return null
}

async function validateTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): Promise<NextResponse | null> {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.CANCELLED,
      BookingStatus.COMPLETED,
    ],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.COMPLETED]: [],
  }

  if (!transitions[fromStatus].includes(toStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition booking from ${fromStatus} to ${toStatus}`,
      },
      { status: 400 }
    )
  }
  return null
}

async function updateBookingStatus(
  bookingId: string,
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): Promise<Booking> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: toStatus },
    })
    await tx.bookingStatusChange.create({
      data: {
        bookingId,
        fromStatus,
        toStatus,
      },
    })
    return updated
  })
}

async function sendNotifications(booking: Booking): Promise<void> {
  if (booking.status === 'CONFIRMED') {
    sendCustomerConfirmation({
      customerName: booking.name,
      customerEmail: booking.email,
      sessionType: booking.service,
      sessionDate: booking.date?.toISOString().split('T')[0] ?? '',
      sessionTime: booking.time,
      goals: booking.goals ?? undefined,
      experience: booking.experience ?? undefined,
    })
  }
  sendAdminNotification({
    customerName: booking.name,
    customerEmail: booking.email,
    sessionType: booking.service,
    sessionDate: booking.date?.toISOString().split('T')[0] ?? '',
    sessionTime: booking.time,
    goals: booking.goals ?? undefined,
    experience: booking.experience ?? undefined,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params
  const bookingId = resolvedParams.id
  const body = await request.json()
  const { status: toStatus } = body as { status: BookingStatus }

  const statusValidationError = await validateStatus(toStatus)
  if (statusValidationError) {
    return statusValidationError
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const transitionValidationError = await validateTransition(
    booking.status,
    toStatus
  )
  if (transitionValidationError) {
    return transitionValidationError
  }

  const result = await updateBookingStatus(bookingId, booking.status, toStatus)
  await sendNotifications(result)

  return NextResponse.json(result)
}
