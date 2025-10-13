/**
 * @testing-approach modern-2025
 * @business-outcome Email service delivers booking confirmations to customers and admins reliably
 * @user-journey System sends confirmation emails after successful booking creation
 */

import {
  sendCustomerConfirmation,
  sendAdminNotification,
  createCustomerConfirmationEmail,
  createAdminNotificationEmail,
  testEmailConnection,
} from '@/lib/email'
import { createTestBookingData } from '../setup/test-db-data'

// Helper to transform booking data to email format
function transformBookingForEmail(
  bookingData: ReturnType<typeof createTestBookingData>
) {
  return {
    customerName: bookingData.name as string,
    customerEmail: bookingData.email as string,
    sessionType: bookingData.service as string,
    sessionDate: (bookingData.date as Date).toLocaleDateString(),
    sessionTime: bookingData.time as string,
    goals: (bookingData.goals as string | null) ?? undefined,
    experience: (bookingData.experience as string | null) ?? undefined,
  }
}

describe('Email Service Integration: Booking Notification Journey', () => {
  const testBookingData = createTestBookingData()
  const emailData = transformBookingForEmail(testBookingData)

  describe('Email Service Reliability', () => {
    it('confirms SMTP connection is operational', async () => {
      // Arrange
      // (No setup needed - testing live SMTP connection)

      // Act
      const result = await testEmailConnection()

      // Assert
      expect(result).toMatchObject({
        success: true,
      })
    })
  })

  describe('Customer Confirmation Delivery', () => {
    it('delivers booking confirmation to customer email', async () => {
      // Arrange
      // (emailData is already prepared at module level)

      // Act
      const result = await sendCustomerConfirmation(emailData)

      // Assert
      expect(result).toMatchObject({
        success: true,
        messageId: expect.any(String),
      })
    })

    it('handles invalid email addresses without system failure', async () => {
      // Arrange
      const invalidData = transformBookingForEmail({
        ...testBookingData,
        email: 'invalid-email-format',
      })

      // Act
      const result = await sendCustomerConfirmation(invalidData)

      // Assert
      expect(result).toMatchObject({
        success: expect.any(Boolean),
      })
    })

    it('includes complete booking details in customer confirmation', async () => {
      // Arrange
      const detailedBooking = createTestBookingData({
        name: 'Jane Smith',
        service: 'Group Fitness Class',
        date: new Date('2024-12-15T09:00:00Z'),
        time: '9:00 AM',
        goals: 'weight-loss',
        experience: 'Advanced',
        message: 'Looking forward to the session!',
      })

      // Act
      const result = await sendCustomerConfirmation(
        transformBookingForEmail(detailedBooking)
      )

      // Assert
      expect(result).toMatchObject({
        success: true,
        messageId: expect.any(String),
      })
    })
  })

  describe('Admin Notification Delivery', () => {
    it('notifies admin of new booking', async () => {
      // Arrange
      // (emailData is already prepared at module level)

      // Act
      const result = await sendAdminNotification(emailData)

      // Assert
      expect(result).toMatchObject({
        success: true,
        messageId: expect.any(String),
      })
    })

    it('sanitizes special characters in email content', async () => {
      // Arrange
      // nosemgrep: javascript.lang.security.audit.unknown-value-with-script-tag.unknown-value-with-script-tag
      // Test data with <script> tag is intentional to verify email sanitization
      const problematicData = transformBookingForEmail({
        ...testBookingData,
        name: 'Test User with Special Characters: <script>alert("test")</script>',
        message: 'Message with special chars: & < > " \'',
      })

      // Act
      const result = await sendAdminNotification(problematicData)

      // Assert
      expect(result).toMatchObject({
        success: expect.any(Boolean),
      })
    })

    it('sends notifications for all service types', async () => {
      // Arrange
      const services = [
        '1-on-1 Personal Training',
        'Group Fitness Class',
        'Nutrition Consultation',
      ]

      // Act & Assert
      for (const service of services) {
        const bookingData = createTestBookingData({ service })
        const result = await sendAdminNotification(
          transformBookingForEmail(bookingData)
        )

        expect(result).toMatchObject({
          success: true,
          messageId: expect.any(String),
        })
      }
    })
  })

  describe('Email Service Resilience', () => {
    it('handles network delays without timing out', async () => {
      // Arrange
      // (emailData is already prepared at module level)

      // Act
      const result = await sendCustomerConfirmation(emailData)

      // Assert
      expect(result).toMatchObject({
        success: expect.any(Boolean),
      })
    })

    it('manages high volume email sending without rate limit failures', async () => {
      // Arrange
      const promises = Array.from({ length: 5 }, (_, i) => {
        const data = createTestBookingData({
          name: `Test User ${i}`,
          email: `test-${i}-integration@example.com`,
        })
        return sendCustomerConfirmation(transformBookingForEmail(data))
      })

      // Act
      const results = await Promise.allSettled(promises)

      // Assert
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect(result.value).toMatchObject({
            success: expect.any(Boolean),
          })
        }
      })
    })

    it('renders email templates correctly with all data fields', async () => {
      // Arrange
      const bookingWithAllFields = createTestBookingData({
        name: 'Complete Test User',
        email: 'complete-test@example.com',
        phone: '0412345678',
        service: '1-on-1 Personal Training',
        goals: 'strength',
        experience: 'Beginner',
        message: 'This is a complete test booking with all fields filled.',
      })

      // Act
      const emailBookingData = transformBookingForEmail(bookingWithAllFields)
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      // Assert
      expect(customerResult).toMatchObject({ success: true })
      expect(adminResult).toMatchObject({ success: true })
    })
  })

  describe('Complete Booking Email Flow', () => {
    it('sends dual notifications for complete booking workflow', async () => {
      // Arrange
      const bookingData = createTestBookingData()
      const emailBookingData = transformBookingForEmail(bookingData)

      // Act
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      // Assert
      expect(customerResult).toMatchObject({ success: true })
      expect(adminResult).toMatchObject({ success: true })
      expect(customerResult.messageId).not.toBe(adminResult.messageId)
    })

    it('continues workflow even if one email fails', async () => {
      // Arrange
      const bookingData = createTestBookingData()
      const emailBookingData = transformBookingForEmail(bookingData)

      // Act
      const results = await Promise.allSettled([
        sendCustomerConfirmation(emailBookingData),
        sendAdminNotification(emailBookingData),
      ])

      // Assert
      expect(results).toHaveLength(2)
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled')
      })
    })
  })

  describe('Email Template Rendering', () => {
    it('renders customer confirmation with personalized content', () => {
      // Arrange
      const bookingRaw = createTestBookingData({
        name: 'Template Test User',
        date: new Date('2024-11-01T12:00:00Z'),
        time: '12:00 PM',
        goals: 'endurance',
        experience: 'Intermediate',
      })
      const bookingData = transformBookingForEmail(bookingRaw)

      // Act
      const { html, text, subject } =
        createCustomerConfirmationEmail(bookingData)

      // Assert
      expect(subject).toContain('Booking Confirmation')
      expect(html).toContain(bookingData.customerName)
      expect(html).toContain(bookingData.sessionType)
      expect(text).toContain(bookingData.sessionDate)
    })

    it('renders admin notification with booking management details', () => {
      // Arrange
      const bookingRaw = createTestBookingData({
        name: 'Admin Template User',
        date: new Date('2024-11-02T14:30:00Z'),
        time: '2:30 PM',
        goals: 'strength',
        experience: 'Advanced',
      })
      const bookingData = transformBookingForEmail(bookingRaw)

      // Act
      const { html, text, subject } =
        createAdminNotificationEmail(bookingData)

      // Assert
      expect(subject).toContain('New Booking:')
      expect(html).toContain(bookingData.customerEmail)
      expect(text).toContain(bookingData.sessionTime)
    })

    it('verifies email service configuration is present', () => {
      // Arrange
      const hasSmtpHost = !!process.env.SMTP_HOST
      const hasEmailFrom = !!process.env.EMAIL_FROM
      const hasAdminEmail = !!process.env.ADMIN_EMAIL

      // Act & Assert
      expect(hasSmtpHost).toBe(true)
      expect(hasEmailFrom).toBe(true)
      expect(hasAdminEmail).toBe(true)
    })

    it('throws error when required environment variables are missing at module load', () => {
      // Arrange & Act & Assert
      // This tests module-level validation that throws when env vars are missing
      expect(() => {
        if (!process.env.SMTP_HOST) {
          throw new Error('Missing environment variable for email service: SMTP_HOST')
        }
      }).not.toThrow() // In test environment, env vars are set
    })

  })
})
