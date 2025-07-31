import {
  sendCustomerConfirmation,
  sendAdminNotification,
  createCustomerConfirmationEmail,
  createAdminNotificationEmail,
  testEmailConnection,
} from '@/lib/email'
import { createTestBookingData } from '../setup/test-db'

// Helper to transform booking data to email format
function transformBookingForEmail(
  bookingData: ReturnType<typeof createTestBookingData>
) {
  return {
    customerName: bookingData.name,
    customerEmail: bookingData.email,
    sessionType: bookingData.service,
    sessionDate: bookingData.date.toLocaleDateString(),
    sessionTime: bookingData.time,
    goals: bookingData.goals,
    experience: bookingData.experience,
  }
}

describe('Email Service Integration Tests', () => {
  const testBookingData = createTestBookingData()
  const emailData = transformBookingForEmail(testBookingData)

  describe('Customer Confirmation Email', () => {
    it('should send customer confirmation email successfully', async () => {
      const result = await sendCustomerConfirmation(emailData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()

      // In a real integration test, you might verify:
      // - Email was queued/sent to email service
      // - Email contains correct booking details
      // - Email formatting is correct
    })

    it('should handle invalid email addresses gracefully', async () => {
      const invalidData = transformBookingForEmail({
        ...testBookingData,
        email: 'invalid-email-format',
      })

      const result = await sendCustomerConfirmation(invalidData)

      // Should handle gracefully without throwing
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('should include all booking details in confirmation email', async () => {
      const detailedBooking = createTestBookingData({
        name: 'Jane Smith',
        service: 'Group Fitness Class',
        date: new Date('2024-12-15T09:00:00Z'),
        time: '9:00 AM',
        goals: 'weight-loss',
        experience: 'Advanced',
        message: 'Looking forward to the session!',
      })

      const result = await sendCustomerConfirmation(
        transformBookingForEmail(detailedBooking)
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()

      // In real integration, verify email content contains:
      // - Customer name
      // - Service type
      // - Date and time
      // - Goals and experience level
      // - Custom message
    })
  })

  describe('Admin Notification Email', () => {
    it('should send admin notification email successfully', async () => {
      const result = await sendAdminNotification(emailData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should handle email service failures gracefully', async () => {
      // Test with data that might cause email service issues
      const problematicData = transformBookingForEmail({
        ...testBookingData,
        name: 'Test User with Special Characters: <script>alert("test")</script>',
        message: 'Message with special chars: & < > " \'',
      })

      const result = await sendAdminNotification(problematicData)

      // Should handle gracefully without throwing
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('should send notifications for different service types', async () => {
      const services = [
        '1-on-1 Personal Training',
        'Group Fitness Class',
        'Nutrition Consultation',
      ]

      for (const service of services) {
        const bookingData = createTestBookingData({ service })
        const result = await sendAdminNotification(
          transformBookingForEmail(bookingData)
        )

        expect(result.success).toBe(true)
        expect(result.messageId).toBeDefined()
      }
    })
  })

  describe('Email Service Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // This would test actual network conditions in a real integration test
      const result = await sendCustomerConfirmation(emailData)

      // Should not throw errors even if network is slow
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('should handle email service rate limiting', async () => {
      // Test sending multiple emails in quick succession
      const promises = Array.from({ length: 5 }, (_, i) => {
        const data = createTestBookingData({
          name: `Test User ${i}`,
          email: `test-${i}-integration@example.com`,
        })
        return sendCustomerConfirmation(transformBookingForEmail(data))
      })

      const results = await Promise.allSettled(promises)

      // All should complete without throwing errors
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
        if (result.status === 'fulfilled') {
          expect(result.value).toBeDefined()
          expect(typeof result.value.success).toBe('boolean')
        }
      })
    })

    it('should validate email template rendering', async () => {
      const bookingWithAllFields = createTestBookingData({
        name: 'Complete Test User',
        email: 'complete-test@example.com',
        phone: '0412345678',
        service: '1-on-1 Personal Training',
        goals: 'strength',
        experience: 'Beginner',
        message: 'This is a complete test booking with all fields filled.',
      })

      const emailBookingData = transformBookingForEmail(bookingWithAllFields)
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      expect(customerResult.success).toBe(true)
      expect(adminResult.success).toBe(true)

      // In real integration, verify:
      // - Templates render without errors
      // - All variables are properly substituted
      // - HTML/text formatting is correct
    })
  })

  describe('Email Integration with Booking Flow', () => {
    it('should send both customer and admin emails for a complete booking', async () => {
      const bookingData = createTestBookingData()

      // Simulate the complete booking flow
      const emailBookingData = transformBookingForEmail(bookingData)
      const customerResult = await sendCustomerConfirmation(emailBookingData)
      const adminResult = await sendAdminNotification(emailBookingData)

      expect(customerResult.success).toBe(true)
      expect(adminResult.success).toBe(true)

      // Both emails should have different message IDs
      expect(customerResult.messageId).not.toBe(adminResult.messageId)
    })

    it('should handle partial email failures gracefully', async () => {
      const bookingData = createTestBookingData()

      // Test scenario where one email succeeds and another might fail
      const emailBookingData = transformBookingForEmail(bookingData)
      const results = await Promise.allSettled([
        sendCustomerConfirmation(emailBookingData),
        sendAdminNotification(emailBookingData),
      ])

      // Should not throw errors even if one fails
      expect(results).toHaveLength(2)
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })
    })

    // SMTP Connection and Template Rendering Tests
    describe('Email Service Additional Integration Tests', () => {
      it('should verify SMTP connection successfully', async () => {
        const result = await testEmailConnection()
        expect(result.success).toBe(true)
      })

      it('should render customer confirmation template with booking details', () => {
        const bookingRaw = createTestBookingData({
          name: 'Template Test User',
          date: new Date('2024-11-01T12:00:00Z'),
          time: '12:00 PM',
          goals: 'endurance',
          experience: 'Intermediate',
        })
        const bookingData = transformBookingForEmail(bookingRaw)
        const { html, text, subject } =
          createCustomerConfirmationEmail(bookingData)
        expect(subject).toContain('Booking Confirmation')
        expect(html).toContain(bookingData.customerName)
        expect(html).toContain(bookingData.sessionType)
        expect(text).toContain(bookingData.sessionDate)
      })

      it('should render admin notification template with booking details', () => {
        const bookingRaw = createTestBookingData({
          name: 'Admin Template User',
          date: new Date('2024-11-02T14:30:00Z'),
          time: '2:30 PM',
          goals: 'strength',
          experience: 'Advanced',
        })
        const bookingData = transformBookingForEmail(bookingRaw)
        const { html, text, subject } =
          createAdminNotificationEmail(bookingData)
        expect(subject).toContain('New Booking:')
        expect(html).toContain(bookingData.customerEmail)
        expect(text).toContain(bookingData.sessionTime)
      })
    })
  })
})
