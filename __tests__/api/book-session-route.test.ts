import { POST } from '@/app/api/book-session/route'
import { NextRequest } from 'next/server'

function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    body: blob,
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
      experience: '',
      message: '',
    }
    const req = makeJsonRequest(validData)
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Booking submitted successfully!')
    expect(json.data).toHaveProperty('id')
  })

  test('returns 500 on server exception', async () => {
    // Force an exception by sending a date string that cannot parse to Date
    const badData = {
      name: 'Error Case',
      email: 'error@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      date: 'invalid-date',
      time: '10:00 AM',
      goals: 'community',
      experience: '',
      message: '',
    }
    const req = makeJsonRequest(badData)
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toHaveProperty('message', 'Failed to submit booking.')
    expect(json).toHaveProperty('error')
  })
})