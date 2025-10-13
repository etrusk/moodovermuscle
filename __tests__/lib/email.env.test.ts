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

  it('throws error when EMAIL_FROM is missing', () => {
    // Arrange
    delete process.env[requiredEnvVars[0]]
    const expectedError = `Missing environment variable for email service: ${requiredEnvVars[0]}`
    
    // Act & Assert
    expect(() => require('@/lib/email')).toThrow(expectedError)
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