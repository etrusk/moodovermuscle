import { sendBookingNotifications } from '@/app/api/book-session/functions/booking-notification'
import * as email from '@/lib/email'
import type { Booking, BookingStatus } from '../../lib/generated/prisma'

jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn(),
  sendAdminNotification: jest.fn(),
}))

const mockedEmail = email as jest.Mocked<typeof email>

const mockBooking: Booking = {
  id: 'mock-booking-id',
  name: 'Test User',
  email: 'test@example.com',
  phone: '0412345678',
  service: '1-on-1 Personal Training',
  date: new Date('2025-01-01T10:00:00.000Z'),
  time: '10:00 AM',
  message: '',
  goals: 'community',
  experience: 'Beginner',
  status: 'PENDING' as BookingStatus,
  sessionDuration: 60,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('sendBookingNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls both email functions with correct data', () => {
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: true,
      messageId: '1',
    })
    mockedEmail.sendAdminNotification.mockResolvedValue({
      success: true,
      messageId: '2',
    })

    sendBookingNotifications(mockBooking)

    expect(mockedEmail.sendCustomerConfirmation).toHaveBeenCalledWith({
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      sessionType: '1-on-1 Personal Training',
      sessionDate: '01/01/2025',
      sessionTime: '10:00 AM',
      goals: 'community',
      experience: 'Beginner',
    })

    expect(mockedEmail.sendAdminNotification).toHaveBeenCalledWith({
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      sessionType: '1-on-1 Personal Training',
      sessionDate: '01/01/2025',
      sessionTime: '10:00 AM',
      goals: 'community',
      experience: 'Beginner',
    })
  })

  it('handles email sending failures gracefully', async () => {
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: false,
      error: 'Failed to send',
    })
    mockedEmail.sendAdminNotification.mockRejectedValue(
      new Error('SMTP error')
    )

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    sendBookingNotifications(mockBooking)

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send customer confirmation email:',
      'Failed to send'
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in sendAdminNotification:',
      expect.any(Error)
    )
    consoleErrorSpy.mockRestore()
  })
})