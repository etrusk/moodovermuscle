import { POST } from '@/app/api/book-session/route'
import { RATE_LIMIT_MAX, rateLimitStore } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import * as validation from '@/app/api/book-session/functions/booking-validation'
import * as creation from '@/app/api/book-session/functions/booking-creation'
import * as notification from '@/app/api/book-session/functions/booking-notification'

// Mock the external functions
jest.mock('@/app/api/book-session/functions/booking-validation')
jest.mock('@/app/api/book-session/functions/booking-creation')
jest.mock('@/app/api/book-session/functions/booking-notification')

const mockValidation = validation as jest.Mocked<typeof validation>
const mockCreation = creation as jest.Mocked<typeof creation>
const mockNotification = notification as jest.Mocked<typeof notification>

jest.spyOn(NextResponse, 'json').mockImplementation((body, init) => {
  return {
    status: init?.status || 200,
    json: () => Promise.resolve(body),
  } as NextResponse
})

function makeJsonRequest(
  data: Record<string, unknown>,
  headers: Record<string, string> = {}
): Request {
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
}

const validData = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '0412345678',
  service: '1-on-1 Personal Training' as const,
  date: new Date(),
  time: '10:00 AM',
  goals: 'community',
  experience: 'Beginner' as const,
  message: '',
}

const mockBooking = {
  id: 'mock-booking-id',
  ...validData,
  status: 'PENDING' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  sessionDuration: 60,
}

describe('API POST /api/book-session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset rate limit store
    for (const key in rateLimitStore) {
      delete rateLimitStore[key]
    }
  })

  test('returns 400 on invalid data', async () => {
    // Arrange
    mockValidation.validateBookingRequest.mockResolvedValue({
      success: false,
      error: NextResponse.json(
        { message: 'Invalid form data.', errors: { name: ['Too short'] } },
        { status: 400 }
      ),
      data: null,
    })
    const req = makeJsonRequest({ name: 'a' })

    // Act
    const res = await POST(req)

    // Assert
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Invalid form data.')
    expect(json).toHaveProperty('errors')
  })

  test('returns 201 on valid data', async () => {
    // Arrange
    mockValidation.validateBookingRequest.mockResolvedValue({
      success: true,
      data: validData,
      error: null,
    })
    mockCreation.createBooking.mockResolvedValue(mockBooking)
    const req = makeJsonRequest(validData)

    // Act
    const res = await POST(req)

    // Assert
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Booking submitted successfully!')
    expect(json.data).toStrictEqual(mockBooking)
    expect(mockNotification.sendBookingNotifications).toHaveBeenCalledWith(
      mockBooking
    )
  })

  test('returns 409 on booking conflict', async () => {
    // Arrange
    mockValidation.validateBookingRequest.mockResolvedValue({
      success: true,
      data: validData,
      error: null,
    })

    const conflictError = new Error('Booking conflict')
    conflictError.name = 'BookingConflictError'
    Object.setPrototypeOf(
      conflictError,
      creation.BookingConflictError.prototype
    )

    mockCreation.createBooking.mockRejectedValue(conflictError)
    const req = makeJsonRequest(validData)

    // Act
    const res = await POST(req)

    // Assert
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Booking conflict')
  })

  test('returns 500 on server exception', async () => {
    // Arrange
    mockValidation.validateBookingRequest.mockResolvedValue({
      success: true,
      data: validData,
      error: null,
    })
    mockCreation.createBooking.mockRejectedValue(new Error('Database error'))
    const req = makeJsonRequest(validData)

    // Act
    const res = await POST(req)

    // Assert
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Failed to submit booking.')
    expect(json).toHaveProperty('error', 'Database error')
  })

  test('returns 429 when rate limit exceeded', async () => {
    // Arrange
    const ip = '1.2.3.4'
    mockValidation.validateBookingRequest.mockResolvedValue({
      success: true,
      data: validData,
      error: null,
    })
    mockCreation.createBooking.mockResolvedValue(mockBooking)

    // Act - Make requests up to rate limit
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      const req = makeJsonRequest(validData, { 'x-forwarded-for': ip })
      const res = await POST(req)
      expect(res.status).toBe(201)
    }

    // Act - Exceed rate limit
    const reqLimited = makeJsonRequest(validData, { 'x-forwarded-for': ip })
    const resLimited = await POST(reqLimited)

    // Assert
    expect(resLimited.status).toBe(429)
    const jsonLimited = await resLimited.json()
    expect(jsonLimited).toHaveProperty(
      'message',
      'Too many requests. Please try again later.'
    )
  })
})
