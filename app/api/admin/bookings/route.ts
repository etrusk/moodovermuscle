import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Admin authentication is already verified by middleware
    const adminId = request.headers.get('x-admin-id');
    const adminEmail = request.headers.get('x-admin-email');

    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add 24 hours to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    // Fetch filtered bookings
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { time: 'desc' },
      ],
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Admin authentication is already verified by middleware
    const adminId = request.headers.get('x-admin-id');
    const adminEmail = request.headers.get('x-admin-email');

    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update booking status with transaction safety and status tracking
    const result = await prisma.$transaction(async (tx: any) => {
      // Verify booking exists and get current status
      const existingBooking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      // Only create status change record if status is actually changing
      if (existingBooking.status !== status) {
        // Create status change record
        await tx.bookingStatusChange.create({
          data: {
            bookingId: bookingId,
            fromStatus: existingBooking.status,
            toStatus: status,
          },
        });

        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: { 
            status,
            updatedAt: new Date(),
          },
        });

        return updatedBooking;
      }

      return existingBooking;
    });

    return NextResponse.json({ booking: result });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update booking' },
      { status: 500 }
    );
  }
}