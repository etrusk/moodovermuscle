import { bookingSchema } from '@/lib/schemas'
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('bookingSchema validation', () => {
  const validData = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '0412345678',
    service: '1-on-1 Personal Training',
    date: new Date(),
    time: '10:00 AM',
    message: 'Looking forward to it!',
    goals: 'strength',
    experience: 'Intermediate' as const,
  }

  it('parses valid data successfully', () => {
    const result = bookingSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('fails when name is too short', () => {
    const data = { ...validData, name: 'J' }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Name must be at least 2 characters.')
    }
  })

  it('fails when email is invalid', () => {
    const data = { ...validData, email: 'not-an-email' }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please enter a valid email address.')
    }
  })

  it('fails when phone number is too short', () => {
    const data = { ...validData, phone: '12345' }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please enter a valid phone number.')
    }
  })

  it('fails when service is missing', () => {
    const dataWithoutService = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutService.service
    const result = bookingSchema.safeParse(dataWithoutService)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please select a service.')
    }
  })

  it('fails when message exceeds max length', () => {
    const longMessage = 'a'.repeat(501)
    const data = { ...validData, message: longMessage }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Message must be less than 500 characters.')
    }
  })

  it('fails when experience is not in enum', () => {
    const data = { ...validData, experience: 'Expert' }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid enum value')
    }
  })
  it('parses date from string input', () => {
    const data = { ...validData, date: validData.date.toISOString() }
    const result = bookingSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date)
    }
  })

  it('fails when date is missing', () => {
    const dataWithoutDate = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutDate.date
    const result = bookingSchema.safeParse(dataWithoutDate)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please select a date.')
    }
  })

  it('fails when time is missing', () => {
    const dataWithoutTime = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutTime.time
    const result = bookingSchema.safeParse(dataWithoutTime)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Please select a time.')
    }
  })
})