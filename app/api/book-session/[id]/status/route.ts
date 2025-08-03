// @ts-nocheck
import { NextResponse } from 'next/server'
import { Prisma, prisma } from '../../../../../lib/prisma'
import { BookingStatus } from '@prisma/client'
import {
  sendCustomerConfirmation,
  sendAdminNotification,
} from '../../../../../lib/email'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id
  const body = await request.json()
  const { status: toStatus } = body as { status: BookingStatus }

  // Validate target status
  const validStatuses = Object.values(BookingStatus)
  if (!validStatuses.includes(toStatus)) {
    return NextResponse.json(
      { error: `Invalid status: ${toStatus}` },
      { status: 400 }
    )
  }

  // Define allowed transitions
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED, BookingStatus.COMPLETED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.COMPLETED]: [],
  }

  // Fetch current booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const fromStatus = booking.status
  if (!transitions[fromStatus].includes(toStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition booking from ${fromStatus} to ${toStatus}`,
      },
      { status: 400 }
    )
  }

  // Perform update and audit in a transaction
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

  // Trigger email notifications fire-and-forget
  if (toStatus === 'CONFIRMED') {
    sendCustomerConfirmation({
      customerName: result.name,
      customerEmail: result.email,
      sessionType: result.service,
      sessionDate: result.date.toISOString().split('T')[0],
      sessionTime: result.time,
      goals: result.goals || undefined,
      experience: result.experience || undefined,
    })
  }
  // Notify admin of any status change
  sendAdminNotification({
    customerName: result.name,
    customerEmail: result.email,
    sessionType: result.service,
    sessionDate: result.date.toISOString().split('T')[0],
    sessionTime: result.time,
    goals: result.goals || undefined,
    experience: result.experience || undefined,
  })

  return NextResponse.json(result)
}