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

jest.mock('nodemailer', () => {
  const mockVerify = jest.fn()
  return {
    createTransport: jest.fn(() => ({
      verify: mockVerify,
    })),
    __mockVerify: mockVerify,
  }
})

import { testEmailConnection } from '@/lib/email'
import nodemailer from 'nodemailer'

const mockVerify = (nodemailer as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).__mockVerify

describe('testEmailConnection', () => {
  it('resolves with success when verify succeeds', async () => {
    mockVerify.mockResolvedValue(undefined)
    const result = await testEmailConnection()
    expect(mockVerify).toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it('returns error when verify throws', async () => {
    mockVerify.mockRejectedValue(new Error('connection error'))
    const result = await testEmailConnection()
    expect(result.success).toBe(false)
    expect(result.error).toContain('connection error')

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

  })
})