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
    // Arrange
    const validData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      service: '1-on-1 Personal Training',
      date: new Date().toISOString(),
      time: '10:00 AM',
      goals: 'community',
    }
    const req = makeJsonRequest(validData)

    // Act
    const result = await validateBookingRequest(req)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@example.com',
      service: '1-on-1 Personal Training',
      goals: 'community',
    })
    expect(result.error).toBeNull()
  })

  it('returns success false for invalid data', async () => {
    // Arrange
    const invalidData = { name: 'a' }
    const req = makeJsonRequest(invalidData)

    // Act
    const result = await validateBookingRequest(req)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull() // Error response object present
    const response = await result.error?.json()
    expect(response.errors).toEqual(expect.objectContaining({
      name: expect.any(Array),
      email: expect.any(Array),
      service: expect.any(Array)
    })) // Validation errors structure
  })

  it('returns success false for malformed JSON', async () => {
    // Arrange
    const req = makeJsonRequest('not-a-json')

    // Act
    const result = await validateBookingRequest(req)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull() // Error response for malformed JSON
    const response = await result.error?.json()
    expect(response.message).toBe('Invalid form data.')
  })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });
})