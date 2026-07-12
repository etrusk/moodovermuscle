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
    // Arrange
    // (validData is already defined in the describe scope)

    // Act
    const result = bookingSchema.safeParse(validData)

    // Assert
    expect(result.success).toBe(true)
    
    // Strong type assertion for quality check
    if (result.success) {
      expect(result.data).toMatchObject({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        service: '1-on-1 Personal Training'
      })
    }
  })

  it('fails when name is too short', () => {
    // Arrange
    const data = { ...validData, name: 'J' }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Name must be at least 2 characters.')
    }
  })

  it('fails when email is invalid', () => {
    // Arrange
    const data = { ...validData, email: 'not-an-email' }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please enter a valid email address.')
    }
  })

  it('fails when phone number is too short', () => {
    // Arrange
    const data = { ...validData, phone: '12345' }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please enter a valid phone number.')
    }
  })

  it('fails when service is missing', () => {
    // Arrange
    const dataWithoutService = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutService.service

    // Act
    const result = bookingSchema.safeParse(dataWithoutService)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please select a valid service.')
    }
  })

  it('fails when message exceeds max length', () => {
    // Arrange
    const longMessage = 'a'.repeat(501)
    const data = { ...validData, message: longMessage }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Message must be less than 500 characters.')
    }
  })

  it('fails when experience is not in enum', () => {
    // Arrange
    const data = { ...validData, experience: 'Expert' }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please select your experience level.')
    }
  })
  it('parses date from string input', () => {
    // Arrange
    const data = { ...validData, date: validData.date.toISOString() }

    // Act
    const result = bookingSchema.safeParse(data)

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date)
      
      // Strong type assertion for quality check
      expect(result.data).toMatchObject({
        name: validData.name,
        email: validData.email
      })
    }
  })

  it('fails when date is missing', () => {
    // Arrange
    const dataWithoutDate = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutDate.date

    // Act
    const result = bookingSchema.safeParse(dataWithoutDate)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please select a date.')
    }
  })

  it('fails when time is missing', () => {
    // Arrange
    const dataWithoutTime = { ...validData } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete dataWithoutTime.time

    // Act
    const result = bookingSchema.safeParse(dataWithoutTime)

    // Assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please select a time.')
    }
  })
})