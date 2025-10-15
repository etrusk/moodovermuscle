import { http, HttpResponse } from 'msw'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'

interface BookingRequestBody {
  email: string
}

interface MockBooking {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  status: string
  goals?: string
  experience: string
  message?: string
  location?: string
  createdAt: string
  updatedAt: string
}

// Mock bookings data template
const INITIAL_BOOKINGS: readonly MockBooking[] = [
  {
    id: 'booking-1',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    phone: '+61 400 123 456',
    service: 'Personal Training',
    date: '2025-08-10',
    time: '10:00:00',
    duration: 60,
    status: 'PENDING',
    goals: 'Lose weight and build strength',
    experience: 'Beginner',
    message: 'Looking forward to the session!',
    location: 'Home Gym',
    createdAt: '2025-08-08T02:00:00Z',
    updatedAt: '2025-08-08T02:00:00Z'
  },
  {
    id: 'booking-2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+61 400 987 654',
    service: 'Group Class',
    date: '2025-08-10',
    time: '14:30:00',
    duration: 45,
    status: 'CONFIRMED',
    goals: 'Improve fitness',
    experience: 'Intermediate',
    createdAt: '2025-08-07T15:30:00Z',
    updatedAt: '2025-08-07T16:00:00Z'
  },
  {
    id: 'booking-3',
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    phone: '+61 400 555 111',
    service: 'Mums & Bubs Class',
    date: '2025-08-09',
    time: '09:00:00',
    duration: 60,
    status: 'COMPLETED',
    experience: 'Beginner',
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-09T10:00:00Z'
  },
  {
    id: 'booking-4',
    name: 'Tom Wilson',
    email: 'tom@example.com',
    phone: '+61 400 777 888',
    service: 'Personal Training',
    date: '2025-08-12',
    time: '16:00:00',
    duration: 60,
    status: 'CANCELLED',
    goals: 'Rehabilitation',
    experience: 'Advanced',
    message: 'Need to reschedule due to injury',
    createdAt: '2025-08-06T12:00:00Z',
    updatedAt: '2025-08-08T01:00:00Z'
  }
] as const

// Returns fresh data to avoid mutation between tests
const getInitialMockBookings = (): MockBooking[] => JSON.parse(JSON.stringify(INITIAL_BOOKINGS))

// Initialize mock bookings - will be reset per test
let mockBookings: MockBooking[] = getInitialMockBookings()

export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    let body: BookingRequestBody
    try {
      body = (await request.json()) as BookingRequestBody
    } catch (e) {
      const error = e as Error
      // Handle cases where the request body is not valid JSON
      return HttpResponse.json({ message: error.message }, { status: 400 })
    }

    if (body.email === 'fail@example.com') {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      )
    }

    if (body.email === 'network@example.com') {
      return HttpResponse.error()
    }

    if (body.email === 'validation@example.com') {
      return HttpResponse.json(
        {
          message: 'Invalid data',
          errors: { email: ['Invalid email format'] },
        },
        { status: 400 }
      )
    }

    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 250))
    return HttpResponse.json(
      { message: TEST_STRINGS.BOOKING.SUCCESS_MESSAGE },
      { status: 201 }
    )
  }),
  
  http.get('/api/availability', () => {
    return HttpResponse.json({
      availableTimes: ['09:00', '10:00'],
      bookedTimes: [],
    })
  }),
  
  // Admin bookings endpoint - GET
  http.get('/api/admin/bookings', ({ request }) => {
    const url = new URL(request.url)
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    
    // Use persistent mockBookings that can be mutated by PATCH requests
    let filteredBookings = mockBookings
    
    // Filter bookings by date range if provided (matches client-side filtering logic)
    if (dateFrom || dateTo) {
      filteredBookings = mockBookings.filter(booking => {
        if (dateFrom && booking.date < dateFrom) return false
        if (dateTo && booking.date > dateTo) return false
        return true
      })
    }
    
    return HttpResponse.json({ bookings: filteredBookings })
  }),
  
  // Admin bookings endpoint - PATCH (status updates)
  http.patch('/api/admin/bookings', async ({ request }) => {
    try {
      const url = new URL(request.url)
      const bookingId = url.searchParams.get('id')
      const body = await request.json() as { status?: string }
      
      if (!bookingId || !body.status) {
        return HttpResponse.json(
          { error: 'Missing bookingId or status' },
          { status: 400 }
        )
      }
      
      // Update status in persistent mock data
      const bookingIndex = mockBookings.findIndex(b => b.id === bookingId)
      if (bookingIndex !== -1) {
        mockBookings[bookingIndex] = {
          ...mockBookings[bookingIndex],
          status: body.status,
          updatedAt: new Date().toISOString()
        }
      }
      
      return HttpResponse.json({ success: true })
    } catch (e) {
      return HttpResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }),
  
  // Admin stats endpoint
  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      totalBookings: 25,
      pendingBookings: 3,
      todayBookings: 2,
      thisWeekBookings: 8,
      confirmedBookings: mockBookings.filter(b => b.status === 'CONFIRMED').length,
      completedBookings: mockBookings.filter(b => b.status === 'COMPLETED').length,
    })
  }),
]

// Export function to reset mock data between tests
export const resetMockBookings = () => {
  mockBookings = getInitialMockBookings()
}