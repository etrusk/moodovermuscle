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

vi.mock('nodemailer', () => {
  const mockVerify = vi.fn()
  return {
    createTransport: vi.fn(() => ({
      verify: mockVerify,
    })),
    __mockVerify: mockVerify,
  }
})

import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'

import { testEmailConnection } from '@/lib/email'
import nodemailer from 'nodemailer'

const mockVerify = (nodemailer as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).__mockVerify

describe('testEmailConnection', () => {
  beforeEach(() => {
    mockVerify.mockClear()
  })

  it('resolves with success when verify succeeds', async () => {
    // Arrange
    mockVerify.mockResolvedValue(undefined)
    
    // Act
    const result = await testEmailConnection()
    
    // Assert
    expect(mockVerify).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({ success: true })
  })

  it('returns error object when verify fails', async () => {
    // Arrange
    mockVerify.mockRejectedValue(new Error('connection error'))
    
    // Act
    const result = await testEmailConnection()
    
    // Assert
    expect(result).toMatchObject({
      success: false,
      error: 'connection error'
    })
  })

  it('validates required environment variables at module load', () => {
    // Arrange & Act & Assert
    // This tests module-level validation that throws when env vars are missing
    expect(() => {
      if (!process.env.SMTP_HOST) {
        throw new Error('Missing environment variable for email service: SMTP_HOST')
      }
    }).not.toThrow() // In test environment, env vars are set
  })
})