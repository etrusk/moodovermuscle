import { vi, describe, it, expect, beforeEach } from 'vitest'
import { sendBookingNotifications } from '@/app/api/book-session/functions/booking-notification'
import * as email from '@/lib/email'
import type { Booking, BookingStatus } from '../../lib/generated/prisma/client'

vi.mock('@/lib/email', () => ({
  sendCustomerConfirmation: vi.fn(),
  sendAdminNotification: vi.fn(),
}))

const mockedEmail = email as vi.Mocked<typeof email>

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

const expectedPayload = {
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  sessionType: '1-on-1 Personal Training',
  sessionDate: '01/01/2025',
  sessionTime: '10:00 AM',
  goals: 'community',
  experience: 'Beginner',
}

describe('sendBookingNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls both email functions with correct data', async () => {
    // Arrange
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: true,
      messageId: '1',
    })
    mockedEmail.sendAdminNotification.mockResolvedValue({
      success: true,
      messageId: '2',
    })

    // Act
    await sendBookingNotifications(mockBooking)

    // Assert
    expect(mockedEmail.sendCustomerConfirmation).toHaveBeenCalledWith(
      expectedPayload
    )
    expect(mockedEmail.sendAdminNotification).toHaveBeenCalledWith(
      expectedPayload
    )
  })

  it('resolves true when both emails are sent', async () => {
    // Arrange
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: true,
      messageId: '1',
    })
    mockedEmail.sendAdminNotification.mockResolvedValue({
      success: true,
      messageId: '2',
    })

    // Act & Assert
    await expect(sendBookingNotifications(mockBooking)).resolves.toBe(true)
  })

  it('does not resolve until both sends have settled', async () => {
    // Arrange
    let releaseCustomer: (value: { success: boolean }) => void = () => {}
    let releaseAdmin: (value: { success: boolean }) => void = () => {}
    mockedEmail.sendCustomerConfirmation.mockReturnValue(
      new Promise((resolve) => {
        releaseCustomer = resolve
      })
    )
    mockedEmail.sendAdminNotification.mockReturnValue(
      new Promise((resolve) => {
        releaseAdmin = resolve
      })
    )

    // Act
    let settled = false
    const pending = sendBookingNotifications(mockBooking).then((result) => {
      settled = true
      return result
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Assert
    expect(settled).toBe(false)

    releaseCustomer({ success: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(settled).toBe(false)

    releaseAdmin({ success: true })
    await expect(pending).resolves.toBe(true)
  })

  it('resolves false once the send deadline passes rather than blocking the response', async () => {
    // Arrange
    vi.useFakeTimers()
    mockedEmail.sendCustomerConfirmation.mockReturnValue(new Promise(() => {}))
    mockedEmail.sendAdminNotification.mockReturnValue(new Promise(() => {}))
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Act
    const pending = sendBookingNotifications(mockBooking)
    await vi.advanceTimersByTimeAsync(10_000)

    // Assert
    await expect(pending).resolves.toBe(false)
    consoleErrorSpy.mockRestore()
    vi.useRealTimers()
  })

  it('resolves false and logs when the customer confirmation fails', async () => {
    // Arrange
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: false,
      error: 'Failed to send',
    })
    mockedEmail.sendAdminNotification.mockResolvedValue({
      success: true,
      messageId: '2',
    })
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Act
    const result = await sendBookingNotifications(mockBooking)

    // Assert
    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send customer confirmation email:',
      'Failed to send'
    )
    consoleErrorSpy.mockRestore()
  })

  it('still sends the admin notification when the customer email rejects', async () => {
    // Arrange
    mockedEmail.sendCustomerConfirmation.mockRejectedValue(
      new Error('SMTP error')
    )
    mockedEmail.sendAdminNotification.mockResolvedValue({
      success: true,
      messageId: '2',
    })
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Act
    const result = await sendBookingNotifications(mockBooking)

    // Assert
    expect(result).toBe(false)
    expect(mockedEmail.sendAdminNotification).toHaveBeenCalledWith(
      expectedPayload
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in sendCustomerConfirmation:',
      expect.any(Error)
    )
    consoleErrorSpy.mockRestore()
  })

  it('resolves false and logs when the admin notification rejects', async () => {
    // Arrange
    mockedEmail.sendCustomerConfirmation.mockResolvedValue({
      success: true,
      messageId: '1',
    })
    mockedEmail.sendAdminNotification.mockRejectedValue(
      new Error('SMTP error')
    )
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Act
    const result = await sendBookingNotifications(mockBooking)

    // Assert
    expect(result).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in sendAdminNotification:',
      expect.any(Error)
    )
    consoleErrorSpy.mockRestore()
  })
})
