import { validateBookingRequest } from '@/app/api/book-session/functions/booking-validation'

function makeJsonRequest(
  data: Record<string, unknown> | string,
  headers: Record<string, string> = {}
): Request {
  const body = typeof data === 'string' ? data : JSON.stringify(data)
  return new Request('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  })
}

describe('validateBookingRequest', () => {
  it('returns success true for valid data', async () => {
    const validData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      service: '1-on-1 Personal Training',
      date: new Date().toISOString(),
      time: '10:00 AM',
      goals: 'community',
    }
    const req = makeJsonRequest(validData)

    const result = await validateBookingRequest(req)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns success false for invalid data', async () => {
    const invalidData = { name: 'a' }
    const req = makeJsonRequest(invalidData)

    const result = await validateBookingRequest(req)

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    const response = await result.error?.json()
    expect(response.errors).toBeDefined()
  })

  it('returns success false for malformed JSON', async () => {
    const req = makeJsonRequest('not-a-json')

    const result = await validateBookingRequest(req)

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    const response = await result.error?.json()
    expect(response.message).toBe('Invalid form data.')
  })
})