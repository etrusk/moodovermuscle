import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { timeSlots } from '@/components/booking-form/steps/timeSlots'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  if (!dateParam) {
    return NextResponse.json({ message: 'Missing date parameter' }, { status: 400 })
  }
  const parsedDate = new Date(dateParam)
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ message: 'Invalid date parameter' }, { status: 400 })
  }
  try {
    const existingBookings = await prisma.booking.findMany({
      where: { date: parsedDate },
      select: { time: true },
    })
    const bookedTimes = existingBookings.map(b => b.time)
    const availableTimes = timeSlots.filter(slot => !bookedTimes.includes(slot))
    return NextResponse.json(
      { availableTimes, bookedTimes, date: dateParam },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=30' },
      }
    )
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { message: 'Failed to fetch availability', error: (error as Error).message },
      { status: 500 }
    )
  }
}