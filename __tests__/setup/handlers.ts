import { http, HttpResponse } from 'msw'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'
import { buildMockBookings, type MockBooking } from '@/__tests__/fixtures/bookings'

interface BookingRequestBody {
  email: string
}

// Initialize mock bookings - will be reset per test
let mockBookings: MockBooking[] = buildMockBookings()

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

  // Admin session endpoint - GET (check session)
  http.get('/api/admin/session', () => {
    return HttpResponse.json({
      user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
    })
  }),

  // Admin session endpoint - DELETE (logout)
  http.delete('/api/admin/session', () => {
    return HttpResponse.json({ success: true })
  }),

  // Admin login endpoint
  http.post('/api/admin/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    
    if (body.email === 'emily@moodovermuscle.com.au' && body.password === 'Emily2025!') {
      return HttpResponse.json({
        user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
      })
    }
    
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),
]

// Export function to reset mock data between tests
export const resetMockBookings = () => {
  mockBookings = buildMockBookings()
}

// Error handlers for test-specific error scenarios
export const errorHandlers = {
  statsError: http.get('/api/admin/stats', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }),
}