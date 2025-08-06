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

    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    // Query database for booking statistics using transaction safety pattern
    const [totalBookings, pendingBookings, todayBookings, weeklyBookings] = await Promise.all([
      // Total bookings count
      prisma.booking.count(),
      
      // Pending bookings count
      prisma.booking.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Today's bookings count
      prisma.booking.count({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Weekly bookings count (last 7 days)
      prisma.booking.count({
        where: {
          date: {
            gte: weekAgo
          }
        }
      })
    ]);

    // Return consistent API response pattern
    return NextResponse.json({
      totalBookings: totalBookings,
      pendingBookings: pendingBookings,
      todayBookings: todayBookings,
      thisWeekBookings: weeklyBookings
    });

  } catch (error) {
    console.error('Admin stats API error:', error);
    
    // Apply error response pattern
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics' 
      },
      { status: 500 }
    );
  }
}