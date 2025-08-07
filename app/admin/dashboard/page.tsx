'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, Clock, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'

// This will be replaced with real data from the booking API
interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  todayBookings: number
  thisWeekBookings: number
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      const data = await response.json()
      setStats({
        totalBookings: data.totalBookings,
        pendingBookings: data.pendingBookings,
        todayBookings: data.todayBookings,
        thisWeekBookings: data.thisWeekBookings,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, fetchStats])

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Layout handles authentication redirects, so we don't need to check here
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your fitness coaching business today.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error loading dashboard data</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <Button
                onClick={fetchStats}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.pendingBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.todayBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.thisWeekBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View All Bookings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Review Pending Bookings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Check Today's Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest booking updates and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">New booking confirmed</p>
                  <p className="text-gray-500">Sarah M. - Personal Training</p>
                </div>
                <div className="text-xs text-gray-400">2h ago</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Session completed</p>
                  <p className="text-gray-500">Lisa J. - Mums &amp; Bubs Class</p>
                </div>
                <div className="text-xs text-gray-400">4h ago</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Booking pending</p>
                  <p className="text-gray-500">Mike R. - Personal Training</p>
                </div>
                <div className="text-xs text-gray-400">6h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}