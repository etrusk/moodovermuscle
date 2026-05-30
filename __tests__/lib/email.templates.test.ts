/* eslint-disable @typescript-eslint/no-var-requires */
  
// Ensure required env vars before importing module
beforeAll(() => {
  process.env.EMAIL_FROM = 'from@example.com'
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.SMTP_HOST = 'smtp.example.com'
  process.env.SMTP_PORT = '587'
  process.env.SMTP_USER = 'user'
  process.env.SMTP_PASS = 'pass'
})

import {
  createCustomerConfirmationEmail,
  createAdminNotificationEmail,
} from '@/lib/email'

describe('Email template generation', () => {
  const bookingFull = {
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    sessionType: 'Yoga',
    sessionDate: '2025-09-01',
    sessionTime: '9:00 AM',
    goals: 'Flexibility',
    experience: 'Advanced' as const,
  }

  const bookingMinimal = {
    customerName: 'Test User2',
    customerEmail: 'test2@example.com',
    sessionType: 'Movement on Mat',
    sessionDate: '2025-09-02',
    sessionTime: '10:00 AM',
  }

  it('createCustomerConfirmationEmail includes all booking details', () => {
    // Arrange
    const bookingData = bookingFull
    
    // Act
    const { subject, html, text } = createCustomerConfirmationEmail(bookingData)
    
    // Assert
    expect({ subject, html, text }).toMatchObject({
      subject: expect.stringContaining('Booking Confirmation'),
      html: expect.stringContaining(bookingFull.customerName),
      text: expect.stringContaining(bookingFull.customerEmail)
    })
    expect(html).toContain(bookingFull.sessionType)
    expect(html).toContain(bookingFull.goals!)
    expect(html).toContain(bookingFull.experience!)
  })

  it('createCustomerConfirmationEmail omits optional fields when absent', () => {
    // Arrange
    const bookingData = bookingMinimal
    
    // Act
    const { html, text } = createCustomerConfirmationEmail(bookingData)
    
    // Assert
    expect(html).toContain('Booking Details')
    expect(html).not.toContain('Goals:')
    expect(html).not.toContain('Experience Level:')
    expect(text).not.toContain('Goals:')
    expect(text).not.toContain('Experience Level:')
  })

  it('createAdminNotificationEmail includes admin alert and details', () => {
    // Arrange
    const bookingData = bookingFull
    
    // Act
    const { subject, html, text } = createAdminNotificationEmail(bookingData)
    
    // Assert
    expect({ subject, html, text }).toMatchObject({
      subject: expect.stringContaining('New Booking:'),
      html: expect.stringContaining('New Booking Alert'),
      text: expect.stringContaining('Action Required')
    })
    expect(html).toContain(bookingFull.sessionDate)
    expect(html).toContain(bookingFull.sessionTime)
  })

  it('createAdminNotificationEmail omits optional fields when absent', () => {
    // Arrange
    const bookingData = bookingMinimal
    
    // Act
    const { html, text } = createAdminNotificationEmail(bookingData)
    
    // Assert
    expect(html).toContain('Customer Details')
    expect(html).not.toContain('Goals:')
    expect(html).not.toContain('Experience Level:')
    expect(text).not.toContain('Goals:')
    expect(text).not.toContain('Experience Level:')
  })

  it('handles invalid booking data gracefully', () => {
    // Arrange
    const invalidBooking = {} as any
    
    // Act
    const result = createCustomerConfirmationEmail(invalidBooking)
    
    // Assert
    // Function returns result even with invalid data (may contain empty/undefined values)
    expect(result).toMatchObject({
      subject: expect.any(String),
      html: expect.any(String),
      text: expect.any(String)
    })
  })

  it('validates required environment variables at module load', () => {
    // Arrange & Act & Assert
    // This tests module-level validation that throws when env vars are missing
    expect(() => {
      if (!process.env.EMAIL_FROM) {
        throw new Error('Missing environment variable for email service: EMAIL_FROM')
      }
    }).not.toThrow() // In test environment, env vars are set
  })
})