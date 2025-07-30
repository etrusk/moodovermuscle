/* eslint-disable @typescript-eslint/no-var-requires */

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
    jest.resetModules()
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws an error if a required env var is missing', () => {
    // Remove the first required variable to trigger the error
    delete process.env[requiredEnvVars[0]]
    expect(() => require('@/lib/email')).toThrow(
      `Missing environment variable for email service: ${requiredEnvVars[0]}`
    )
  })
})