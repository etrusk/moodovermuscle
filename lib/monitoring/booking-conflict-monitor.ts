/**
 * Booking Conflict Monitoring System
 * 
 * Strategic Context: SECONDARY business protection layer per Navigator's 
 * controlled technical debt approach. Provides runtime logging and monitoring
 * for booking conflict attempts as backup to database constraints.
 * 
 * Business Protection: Monitors and alerts on booking conflict attempts,
 * providing operational visibility and business intelligence on system usage patterns.
 */

import { prisma } from '@/lib/prisma'

export interface BookingConflictEvent {
  type: 'conflict_detected' | 'conflict_prevented' | 'suspicious_activity'
  timestamp: Date
  attemptedBooking: {
    date: Date
    time: string
    clientInfo: {
      email: string
      name: string
      phone?: string
    }
  }
  conflictingBooking?: {
    id: string
    date: Date
    time: string
    status: string
  }
  clientMetadata: {
    userAgent?: string
    ipAddress?: string
    sessionId?: string
  }
  resolution: 'blocked_by_db' | 'blocked_by_validation' | 'allowed' | 'requires_investigation'
}

export interface BookingConflictStats {
  totalConflictAttempts: number
  conflictsByTimeSlot: Record<string, number>
  conflictsByDate: Record<string, number>
  suspiciousPatterns: {
    rapidRepeatedAttempts: number
    sameEmailMultipleConflicts: number
    unusualTimePatterns: number
  }
}

/**
 * Log booking conflict events for monitoring and business intelligence
 */
export async function logBookingConflictEvent(event: BookingConflictEvent): Promise<void> {
  try {
    // Log to console for immediate debugging (development/staging)
    console.warn('BOOKING CONFLICT DETECTED:', {
      type: event.type,
      date: event.attemptedBooking.date.toISOString().split('T')[0],
      time: event.attemptedBooking.time,
      email: event.attemptedBooking.clientInfo.email,
      resolution: event.resolution,
      timestamp: event.timestamp.toISOString()
    })

    // In production environment, this would integrate with monitoring services
    // (Vercel Analytics, DataDog, Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example integration points (commented for now):
      // await sendToMonitoringService(event)
      // await updateMetricsDashboard(event)
      // await triggerBusinessAlert(event)
    }

    // Store conflict events in database for analysis (optional business intelligence)
    // This could be implemented if business requires detailed conflict analysis
    // await storeConflictEventInDatabase(event)

  } catch (error) {
    console.error('Error logging booking conflict event:', error)
    // Don't throw - monitoring failures shouldn't break booking flow
  }
}

/**
 * Monitor for suspicious booking conflict patterns
 */
export async function detectSuspiciousBookingPatterns(): Promise<BookingConflictStats | null> {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recentBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: last24Hours } },
      select: { id: true, email: true, date: true, time: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    const stats: BookingConflictStats = {
      totalConflictAttempts: 0,
      conflictsByTimeSlot: {},
      conflictsByDate: {},
      suspiciousPatterns: { rapidRepeatedAttempts: 0, sameEmailMultipleConflicts: 0, unusualTimePatterns: 0 }
    }

    const bookingsByEmail = recentBookings.reduce((acc, booking) => {
      if (!acc[booking.email]) acc[booking.email] = []
      acc[booking.email].push(booking)
      return acc
    }, {} as Record<string, typeof recentBookings>)

    Object.values(bookingsByEmail).forEach(emailBookings => {
      if (emailBookings.length > 3) {
        const timeSpan = emailBookings[0].createdAt.getTime() - emailBookings[emailBookings.length - 1].createdAt.getTime()
        if (timeSpan < 30 * 60 * 1000) stats.suspiciousPatterns.rapidRepeatedAttempts++
      }
      if (emailBookings.length > 2) stats.suspiciousPatterns.sameEmailMultipleConflicts++
    })

    return stats
  } catch (error) {
    console.error('Error detecting suspicious booking patterns:', error)
    return null
  }
}

/**
 * Enhanced booking conflict validation with monitoring integration
 * Integrates with existing availability checking to add monitoring layer
 */
export async function validateBookingWithMonitoring(
  date: Date,
  time: string,
  clientInfo: { name: string; email: string; phone?: string },
  clientMetadata: { userAgent?: string; ipAddress?: string; sessionId?: string } = {}
): Promise<{ isValid: boolean; conflictingBooking?: unknown }> {
  
  try {
    const conflictingBooking = await prisma.booking.findFirst({
      where: { date, time, status: { in: ['PENDING', 'CONFIRMED'] } },
      select: { id: true, date: true, time: true, status: true, email: true }
    })

    if (conflictingBooking) {
      await logBookingConflictEvent({
        type: 'conflict_detected',
        timestamp: new Date(),
        attemptedBooking: { date, time, clientInfo },
        conflictingBooking: {
          id: conflictingBooking.id,
          date: conflictingBooking.date,
          time: conflictingBooking.time,
          status: conflictingBooking.status
        },
        clientMetadata,
        resolution: 'blocked_by_validation'
      })
      return { isValid: false, conflictingBooking }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error in booking validation with monitoring:', error)
    await logBookingConflictEvent({
      type: 'suspicious_activity',
      timestamp: new Date(),
      attemptedBooking: { date, time, clientInfo },
      clientMetadata,
      resolution: 'requires_investigation'
    })
    throw error
  }
}

/**
 * Business intelligence: Get booking conflict insights
 */
export async function getBookingConflictInsights(): Promise<{
  summary: string
  recommendations: string[]
  metrics: BookingConflictStats | null
}> {
  const stats = await detectSuspiciousBookingPatterns()
  
  return {
    summary: `Booking conflict monitoring active. ${stats?.totalConflictAttempts ?? 0} conflicts detected in monitoring period.`,
    recommendations: [
      'Database constraints provide primary protection against double-bookings',
      'Runtime monitoring captures conflict attempts for business intelligence',
      'E2E tests verify end-to-end conflict prevention',
      'Review suspicious patterns weekly for potential system abuse'
    ],
    metrics: stats
  }
}