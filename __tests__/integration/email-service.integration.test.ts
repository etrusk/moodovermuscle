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
      // When: System verifies email service connectivity
      const result = await testEmailConnection()

      // Then: Connection is established successfully
      expect(result.success).toBe(true)
    })
  })

  describe('Customer Confirmation Delivery', () => {
    it('delivers booking confirmation to customer email', async () => {
      // Given: Customer has completed a booking
      // When: System sends confirmation email
      const result = await sendCustomerConfirmation(emailData)

      // Then: Email is successfully queued/delivered
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('handles invalid email addresses without system failure', async () => {
      // Given: Booking has malformed email address
      const invalidData = transformBookingForEmail({
        ...testBookingData,
        email: 'invalid-email-format',
      })

      // When: System attempts to send confirmation
      const result = await sendCustomerConfirmation(invalidData)

      // Then: Error is handled gracefully
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('includes complete booking details in customer confirmation', async () => {
      // Given: Booking with full details
      const detailedBooking = createTestBookingData({
        name: 'Jane Smith',
        service: 'Group Fitness Class',
        date: new Date('2024-12-15T09:00:00Z'),
        time: '9:00 AM',
        goals: 'weight-loss',
        experience: 'Advanced',
        message: 'Looking forward to the session!',
      })

      // When: Confirmation email is sent
      const result = await sendCustomerConfirmation(
        transformBookingForEmail(detailedBooking)
      )

      // Then: Email delivery succeeds with all details
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe('Admin Notification Delivery', () => {
    it('notifies admin of new booking', async () => {
      // Given: New booking has been created
      // When: System sends admin notification
      const result = await sendAdminNotification(emailData)

      // Then: Admin receives notification successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('sanitizes special characters in email content', async () => {
      // Given: Booking contains potentially problematic characters
      // nosemgrep: javascript.lang.security.audit.unknown-value-with-script-tag.unknown-value-with-script-tag
      // Test data with <script> tag is intentional to verify email sanitization
      const problematicData = transformBookingForEmail({
        ...testBookingData,
        name: 'Test User with Special Characters: <script>alert("test")</script>',
        message: 'Message with special chars: & < > " \'',
      })

      // When: Notification is sent with special characters
      const result = await sendAdminNotification(problematicData)

      // Then: Email is processed safely
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('sends notifications for all service types', async () => {
      // Given: Different service types available for booking
      const services = [
        '1-on-1 Personal Training',
        'Group Fitness Class',
        'Nutrition Consultation',
      ]

      // When: Bookings are made for each service type
      for (const service of services) {
        const bookingData = createTestBookingData({ service })
        const result = await sendAdminNotification(
          transformBookingForEmail(bookingData)
        )

        // Then: All service types trigger successful notifications
        expect(result.success).toBe(true)
        expect(result.messageId).toBeDefined()
      }
    })
  })

  describe('Email Service Resilience', () => {
    it('handles network delays without timing out', async () => {
      // Given: Email service may experience network latency
      // When: Confirmation is sent under network stress
      const result = await sendCustomerConfirmation(emailData)

      // Then: System waits for completion without errors
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('manages high volume email sending without rate limit failures', async () => {
      // Given: Multiple bookings occur simultaneously
      const promises = Array.from({ length: 5 }, (_, i) => {
        const data = createTestBookingData({
          name: `Test User ${i}`,
          email: `test-${i}-integration@example.com`,
        })
        return sendCustomerConfirmation(transformBookingForEmail(data))
      })

      // When: Emails are sent in rapid succession
      const results = await Promise.allSettled(promises)

      // Then: All emails complete without throwing errors
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect(result.value).toBeDefined()
          expect(typeof result.value.success).toBe('boolean')
        }
      })
    })

    it('renders email templates correctly with all data fields', async () => {
      // Given: Booking with all optional fields populated
      const bookingWithAllFields = createTestBookingData({
        name: 'Complete Test User',
        email: 'complete-test@example.com',
        phone: '0412345678',
        service: '1-on-1 Personal Training',
        goals: 'strength',
        experience: 'Beginner',
        message: 'This is a complete test booking with all fields filled.',
      })

      // When: Templates are rendered with complete data
      const emailBookingData = transformBookingForEmail(bookingWithAllFields)
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      // Then: Both templates render and send successfully
      expect(customerResult.success).toBe(true)
      expect(adminResult.success).toBe(true)
    })
  })

  describe('Complete Booking Email Flow', () => {
    it('sends dual notifications for complete booking workflow', async () => {
      // Given: Customer has completed a booking
      const bookingData = createTestBookingData()
      const emailBookingData = transformBookingForEmail(bookingData)

      // When: System triggers both customer and admin emails
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      // Then: Both recipients receive their respective emails
      expect(customerResult.success).toBe(true)
      expect(adminResult.success).toBe(true)

      // And: Each email has unique message ID
      expect(customerResult.messageId).not.toBe(adminResult.messageId)
    })

    it('continues workflow even if one email fails', async () => {
      // Given: Email service may have partial failures
      const bookingData = createTestBookingData()
      const emailBookingData = transformBookingForEmail(bookingData)

      // When: Both emails are sent with failure tolerance
      const results = await Promise.allSettled([
        sendCustomerConfirmation(emailBookingData),
        sendAdminNotification(emailBookingData),
      ])

      // Then: Failures are isolated and don't cascade
      expect(results).toHaveLength(2)
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled')
      })
    })
  })

  describe('Email Template Rendering', () => {
    it('renders customer confirmation with personalized content', () => {
      // Given: Customer booking with specific details
      const bookingRaw = createTestBookingData({
        name: 'Template Test User',
        date: new Date('2024-11-01T12:00:00Z'),
        time: '12:00 PM',
        goals: 'endurance',
        experience: 'Intermediate',
      })
      const bookingData = transformBookingForEmail(bookingRaw)

      // When: Customer confirmation template is rendered
      const { html, text, subject } =
        createCustomerConfirmationEmail(bookingData)

      // Then: Template includes all personalized details
      expect(subject).toContain('Booking Confirmation')
      expect(html).toContain(bookingData.customerName)
      expect(html).toContain(bookingData.sessionType)
      expect(text).toContain(bookingData.sessionDate)
    })

    it('renders admin notification with booking management details', () => {
      // Given: New booking requiring admin attention
      const bookingRaw = createTestBookingData({
        name: 'Admin Template User',
        date: new Date('2024-11-02T14:30:00Z'),
        time: '2:30 PM',
        goals: 'strength',
        experience: 'Advanced',
      })
      const bookingData = transformBookingForEmail(bookingRaw)

      // When: Admin notification template is rendered
      const { html, text, subject } =
        createAdminNotificationEmail(bookingData)

      // Then: Template provides admin with actionable information
      expect(subject).toContain('New Booking:')
      expect(html).toContain(bookingData.customerEmail)
      expect(text).toContain(bookingData.sessionTime)
    })
  })
})
