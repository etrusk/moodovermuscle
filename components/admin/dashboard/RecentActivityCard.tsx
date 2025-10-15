'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'

interface RecentBooking {
  id: string
  name: string
  service: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  updatedAt: string
}

const statusColors = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-blue-500',
}

const statusLabels = {
  PENDING: 'Booking pending',
  CONFIRMED: 'New booking confirmed',
  CANCELLED: 'Booking cancelled',
  COMPLETED: 'Session completed',
}

function getTimeAgo(dateString: string): string {
  const updatedAt = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - updatedAt.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

function ActivityItem({ booking }: { booking: RecentBooking }): React.JSX.Element {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 ${statusColors[booking.status]} rounded-full`}></div>
      <div className="flex-1 text-sm">
        <p className="font-medium">{statusLabels[booking.status]}</p>
        <p className="text-gray-500">{booking.name} - {booking.service}</p>
      </div>
      <div className="text-xs text-gray-400">{getTimeAgo(booking.updatedAt)}</div>
    </div>
  )
}

function ActivityContent({ 
  isLoading, 
  error, 
  bookings, 
  onRetry 
}: { 
  isLoading: boolean
  error: string | null
  bookings: RecentBooking[]
  onRetry: () => void
}): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    )
  }
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <ActivityItem key={booking.id} booking={booking} />
      ))}
    </div>
  )
}

function CardHeaderSection({
  isLoading,
  error,
  onRefresh
}: {
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest booking updates and activities</CardDescription>
      </div>
      {!isLoading && !error && (
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Refresh recent activity"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default function RecentActivityCard(): React.JSX.Element {
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentActivity = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/bookings?limit=3&sortBy=updatedAt&sortOrder=desc', {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch recent activity')
      const data = await response.json()
      setBookings(data.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentActivity()
  }, [fetchRecentActivity])

  return (
    <Card>
      <CardHeader>
        <CardHeaderSection
          isLoading={isLoading}
          error={error}
          onRefresh={fetchRecentActivity}
        />
      </CardHeader>
      <CardContent>
        <ActivityContent
          isLoading={isLoading}
          error={error}
          bookings={bookings}
          onRetry={fetchRecentActivity}
        />
      </CardContent>
    </Card>
  )
}