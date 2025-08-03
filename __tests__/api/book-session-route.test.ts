import { POST } from '@/app/api/book-session/route'
import { RATE_LIMIT_MAX, rateLimitStore } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => {
  const mockBooking = {
    id: 'mock-booking-id',
    name: 'Test User',
    email: 'test@example.com',
    phone: '0412345678',
    service: '1-on-1 Personal Training',
    date: new Date(),
    time: '10:00 AM',
    message: '',
    goals: 'community',
    experience: 'Beginner',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTx = {
    booking: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockBooking),
    },
  }

  return {
    prisma: {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      }),
      booking: {
        create: jest.fn().mockResolvedValue(mockBooking),
      },
    },
  }
})

// Mock email functions
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'mock-id' }),
  sendAdminNotification: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'mock-id' }),
}))

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

describe('API POST /api/book-session', () => {
  test('returns 400 on invalid data', async () => {
    const req = makeJsonRequest({ name: 'a' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Invalid form data.')
    expect(json).toHaveProperty('errors')
  })

  test('returns 201 on valid data', async () => {
    const validData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      date: new Date().toISOString(),
      time: '10:00 AM',
      goals: 'community',
      experience: 'Beginner',
      message: '',
    }
    const req = makeJsonRequest(validData)
    const res = await POST(req)

    // Debug: log the response if it's not 201
    if (res.status !== 201) {
      const json = await res.json()
      console.log('Validation errors:', json)
    }

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Booking submitted successfully!')
    expect(json.data).toHaveProperty('id')
  })

  test('returns 500 on server exception', async () => {
    // Mock Prisma to throw an error
    const mockTransaction = prisma.$transaction as jest.MockedFunction<
      typeof prisma.$transaction
    >;
    mockTransaction.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const validData = {
      name: 'Error Case',
      email: 'error@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      date: new Date().toISOString(),
      time: '10:00 AM',
      goals: 'community',
      experience: 'Beginner',
      message: '',
    }
    const req = makeJsonRequest(validData)
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Failed to submit booking.')
    expect(json).toHaveProperty('error')
  })
  it('returns 400 when JSON body is invalid', async () => {
    const req = new Request('http://localhost/api/book-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-a-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Invalid form data.')
  })

  it('returns 429 when rate limit exceeded', async () => {
    const ip = '1.2.3.4'
    // Clear any existing record for IP
    delete rateLimitStore[ip]
    const validData = {
      name: 'Rate Test',
      email: 'rate@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      date: new Date().toISOString(),
      time: '10:00 AM',
      goals: 'community',
      experience: 'Beginner',
      message: '',
    }
    // Send max allowed requests
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      const req = makeJsonRequest(validData, { 'x-forwarded-for': ip })
      const res = await POST(req)
      expect(res.status).toBe(201)
    }
    // Sixth request should be rate limited
    const req6 = makeJsonRequest(validData, { 'x-forwarded-for': ip })
    const res6 = await POST(req6)
    expect(res6.status).toBe(429)
    const json6 = await res6.json()
    expect(json6).toHaveProperty(
      'message',
      'Too many requests. Please try again later.'
    )
  })
})
