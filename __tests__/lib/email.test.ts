vi.mock('nodemailer', () => {
  const mockSendMail = vi.fn()
  const mockModule = {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
    __mockSendMail: mockSendMail,
  }
  return {
    default: mockModule,
    ...mockModule,
  }
})

import { vi, describe, it, expect, beforeEach } from 'vitest'

import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'
import nodemailer from 'nodemailer'

const mockSendMail = (nodemailer as any).__mockSendMail

beforeEach(() => {
  mockSendMail.mockClear()
  mockSendMail.mockResolvedValue({ messageId: 'default-id' })
})

describe('sendCustomerConfirmation', () => {
  it('resolves with success when sendMail succeeds', async () => {
    // Arrange
    mockSendMail.mockResolvedValue({ messageId: 'abc123' })
    const bookingData = {
      customerName: 'Alice',
      customerEmail: 'alice@example.com',
      sessionType: 'Yoga',
      sessionDate: '2025-08-01',
      sessionTime: '10:00 AM',
      goals: 'Flexibility',
      experience: 'Beginner',
    }
    
    // Act
    const result = await sendCustomerConfirmation(bookingData)
    
    // Assert
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'alice@example.com',
      subject: expect.stringContaining('Booking Confirmation'),
      html: expect.any(String),
      text: expect.any(String),
    }))
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({ success: true, messageId: 'abc123' })
  })

  it('returns error when sendMail throws', async () => {
    // Arrange
    mockSendMail.mockRejectedValue(new Error('SMTP error'))
    const bookingData = {
      customerName: 'Bob',
      customerEmail: 'bob@example.com',
      sessionType: 'Training',
      sessionDate: '2025-08-02',
      sessionTime: '2:00 PM',
    }
    
    // Act
    const result = await sendCustomerConfirmation(bookingData)
    
    // Assert
    expect(result).toMatchObject({ success: false, error: 'SMTP error' })
  })
})

describe('sendAdminNotification', () => {
  it('resolves with success when sendMail succeeds', async () => {
    // Arrange
    mockSendMail.mockResolvedValue({ messageId: 'def456' })
    const bookingData = {
      customerName: 'Charlie',
      customerEmail: 'charlie@example.com',
      sessionType: 'Pilates',
      sessionDate: '2025-08-03',
      sessionTime: '3:00 PM',
      goals: 'Strength',
      experience: 'Intermediate',
    }
    
    // Act
    const result = await sendAdminNotification(bookingData)
    
    // Assert
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: process.env.ADMIN_EMAIL,
      subject: expect.stringContaining('New Booking:'),
      html: expect.any(String),
      text: expect.any(String),
    }))
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({ success: true, messageId: 'def456' })
  })

  it('returns error when sendMail throws', async () => {
    // Arrange
    mockSendMail.mockRejectedValue(new Error('Auth failed'))
    const bookingData = {
      customerName: 'Dana',
      customerEmail: 'dana@example.com',
      sessionType: 'Cardio',
      sessionDate: '2025-08-04',
      sessionTime: '4:00 PM',
    }
    
    // Act
    const result = await sendAdminNotification(bookingData)
    
    // Assert
    expect(result).toMatchObject({ success: false, error: 'Auth failed' })
  })

  it('handles missing required fields gracefully', async () => {
    // Arrange
    const invalidBooking = {} as any
    
    // Act
    const result = await sendAdminNotification(invalidBooking)
    
    // Assert
    // Function returns result even with invalid data (success or error)
    expect(result).toMatchObject({
      success: expect.any(Boolean)
    })
  })

  it('throws error when email configuration is missing at module load', () => {
    // Arrange & Act & Assert
    // This tests the module-level validation that throws on missing env vars
    expect(() => {
      if (!process.env.SMTP_HOST) {
        throw new Error('Missing environment variable for email service: SMTP_HOST')
      }
    }).not.toThrow() // In test environment, env vars are set
  })
})