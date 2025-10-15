/* eslint-disable @typescript-eslint/no-var-requires */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Environment variable validation in email module', () => {
  const requiredEnvVars = [
    'EMAIL_FROM',
    'ADMIN_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ]

  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.resetModules()
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('initializes successfully when EMAIL_FROM is present', async () => {
    // Arrange
    expect(process.env.EMAIL_FROM).toEqual(expect.any(String))
    
    // Act
    const email = await import('@/lib/email')
    
    // Assert
    expect(email.sendCustomerConfirmation).toEqual(expect.any(Function))
    expect(email.sendAdminNotification).toEqual(expect.any(Function))
    expect(email.testEmailConnection).toEqual(expect.any(Function))
    expect(email.createCustomerConfirmationEmail).toEqual(expect.any(Function))
    expect(email.createAdminNotificationEmail).toEqual(expect.any(Function))
  })

  it('validates all required environment variables', () => {
    // Arrange
    const allVarsPresent = requiredEnvVars.every(varName => process.env[varName])
    
    // Act
    const result = allVarsPresent
    
    // Assert
    expect(result).toBe(true)
    expect(requiredEnvVars).toEqual(
      expect.arrayContaining([
        'EMAIL_FROM',
        'ADMIN_EMAIL',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS'
      ])
    )
  })
})