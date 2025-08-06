'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CalendarDays, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  List,
  Phone,
  Mail,
  User,
  MapPin,
  MessageSquare,
  Target,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  goals?: string
  experience?: string
  message?: string
  location?: string
  createdAt: string
  updatedAt: string
}

interface CalendarBooking extends Booking {
  dateObj: Date
}

type ViewMode = 'month' | 'week'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
}

const statusLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}


export default function AdminCalendarPage(): React.JSX.Element {
  const { user } = useAdminAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [selectedBookings, setSelectedBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)

  // Fetch bookings for the current month view
  const fetchBookings = useCallback(async (monthDate: Date): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Get first and last day of the month to fetch bookings
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const params = new URLSearchParams({
        dateFrom: firstDay.toISOString().split('T')[0],
        dateTo: lastDay.toISOString().split('T')[0],
      })

      const response = await fetch(`/api/admin/bookings?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`)
      }

      const data = await response.json()
      const bookingsData = Array.isArray(data.bookings) ? data.bookings : []
      
      // Convert bookings with date objects for easier manipulation
      const calendarBookings: CalendarBooking[] = bookingsData.map((booking: Booking) => ({
        ...booking,
        dateObj: new Date(booking.date)
      }))

      setBookings(calendarBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load bookings when month changes
  useEffect(() => {
    fetchBookings(currentMonth)
  }, [currentMonth, fetchBookings])

  // Update selected bookings when date changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0]
    const dayBookings = bookings.filter(booking => 
      booking.date === dateString
    ).sort((a, b) => a.time.localeCompare(b.time))
    
    setSelectedBookings(dayBookings)
  }, [selectedDate, bookings])

  const updateBookingStatus = async (bookingId: string, newStatus: string): Promise<void> => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      // Refresh bookings for current month
      await fetchBookings(currentMonth)
    } catch (err) {
      console.error('Error updating booking status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update booking')
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'PENDING':
        return 'CONFIRMED'
      case 'CONFIRMED':
        return 'COMPLETED'
      default:
        return null
    }
  }

  const getBookingsForDate = (date: Date): CalendarBooking[] => {
    const dateString = date.toISOString().split('T')[0]
    return bookings.filter(booking => booking.date === dateString)
  }

  const formatTime = (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next'): void => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  // Navigate to today
  const navigateToToday = (): void => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }


  if (!user) {
    return <></>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and bookings</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={navigateToToday}
            variant="outline"
            size="sm"
          >
            Today
          </Button>
          
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Month
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Week
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  {currentMonth.toLocaleDateString('en-AU', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigateMonth('prev')}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigateMonth('next')}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading calendar...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading calendar</p>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <Button 
                      onClick={() => fetchBookings(currentMonth)} 
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="calendar-container">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                    modifiers={{
                      hasBookings: (date) => getBookingsForDate(date).length > 0,
                      hasPending: (date) => getBookingsForDate(date).some(b => b.status === 'PENDING'),
                      hasConfirmed: (date) => getBookingsForDate(date).some(b => b.status === 'CONFIRMED'),
                      hasCompleted: (date) => getBookingsForDate(date).some(b => b.status === 'COMPLETED'),
                      hasCancelled: (date) => getBookingsForDate(date).some(b => b.status === 'CANCELLED')
                    }}
                    modifiersStyles={{
                      hasBookings: {
                        backgroundColor: '#f9fafb',
                        borderColor: '#e5e7eb',
                        fontWeight: '500'
                      },
                      hasPending: {
                        backgroundColor: '#fef3c7',
                        color: '#92400e'
                      },
                      hasConfirmed: {
                        backgroundColor: '#dbeafe',
                        color: '#1e40af'
                      },
                      hasCompleted: {
                        backgroundColor: '#d1fae5',
                        color: '#065f46'
                      },
                      hasCancelled: {
                        backgroundColor: '#fee2e2',
                        color: '#991b1b'
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedDate.toLocaleDateString('en-AU', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {selectedBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No bookings scheduled</p>
                </div>
              ) : (
                selectedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedBooking(booking)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{booking.name}</p>
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{formatTime(booking.time)}</p>
                        <p className="text-xs text-gray-500 truncate">{booking.service}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Detail Modal - Reused from Phase 3B */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>Booking Details</span>
                <Badge className={statusColors[selectedBooking.status]}>
                  {statusLabels[selectedBooking.status]}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`name-${selectedBooking.id}`} className="text-sm font-medium text-gray-600">Name</label>
                    <p className="mt-1">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <label htmlFor={`email-${selectedBooking.id}`} className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1">
                      <a 
                        href={`mailto:${selectedBooking.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedBooking.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label htmlFor={`phone-${selectedBooking.id}`} className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="mt-1">
                      <a 
                        href={`tel:${selectedBooking.phone}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedBooking.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Session Details */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Session Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service</label>
                    <p className="mt-1">{selectedBooking.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="mt-1">{selectedBooking.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="mt-1">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Time</label>
                    <p className="mt-1">{formatTime(selectedBooking.time)}</p>
                  </div>
                </div>
                
                {selectedBooking.location && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedBooking.location}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Client Information */}
              {(selectedBooking.goals || selectedBooking.experience) && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Client Information
                  </h4>
                  <div className="space-y-4">
                    {selectedBooking.goals && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Goals</label>
                        <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{selectedBooking.goals}</p>
                      </div>
                    )}
                    {selectedBooking.experience && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Experience Level</label>
                        <p className="mt-1">{selectedBooking.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Messages */}
              {selectedBooking.message && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Message
                  </h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedBooking.message}</p>
                </div>
              )}
              
              {/* Status Update Actions */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Status Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {getNextStatus(selectedBooking.status) && (
                    <Button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, getNextStatus(selectedBooking.status)!)
                        setSelectedBooking(null)
                      }}
                      size="sm"
                    >
                      Mark as {statusLabels[getNextStatus(selectedBooking.status)! as keyof typeof statusLabels]}
                    </Button>
                  )}
                  
                  {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                    <Button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'CANCELLED')
                        setSelectedBooking(null)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel Booking
                    </Button>
                  )}
                  
                  {selectedBooking.status === 'CANCELLED' && (
                    <Button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'PENDING')
                        setSelectedBooking(null)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Restore to Pending
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}