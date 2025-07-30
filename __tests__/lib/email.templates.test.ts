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
    sessionType: 'Pilates',
    sessionDate: '2025-09-02',
    sessionTime: '10:00 AM',
  }

  it('createCustomerConfirmationEmail includes all booking details', () => {
    const { subject, html, text } = createCustomerConfirmationEmail(bookingFull)
    expect(subject).toContain('Booking Confirmation')
    expect(html).toContain(bookingFull.customerName)
    expect(html).toContain(bookingFull.sessionType)
    expect(html).toContain(bookingFull.goals!)
    expect(html).toContain(bookingFull.experience!)
    expect(text).toContain(bookingFull.customerEmail)
  })

  it('createCustomerConfirmationEmail omits optional fields when absent', () => {
    const { html, text } = createCustomerConfirmationEmail(bookingMinimal)
    expect(html).toContain('Booking Details')
    expect(html).not.toContain('Goals:')
    expect(html).not.toContain('Experience Level:')
    expect(text).not.toContain('Goals:')
    expect(text).not.toContain('Experience Level:')
  })

  it('createAdminNotificationEmail includes admin alert and details', () => {
    const { subject, html, text } = createAdminNotificationEmail(bookingFull)
    expect(subject).toContain('New Booking:')
    expect(html).toContain('New Booking Alert')
    expect(html).toContain(bookingFull.sessionDate)
    expect(html).toContain(bookingFull.sessionTime)
    expect(text).toContain('Action Required')
  })

  it('createAdminNotificationEmail omits optional fields when absent', () => {
    const { html, text } = createAdminNotificationEmail(bookingMinimal)
    expect(html).toContain('Customer Details')
    expect(html).not.toContain('Goals:')
    expect(html).not.toContain('Experience Level:')
    expect(text).not.toContain('Goals:')
    expect(text).not.toContain('Experience Level:')
  })
})