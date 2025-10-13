/* eslint-disable @typescript-eslint/no-var-requires */

describe('Email environment variable validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const requiredEnvVars = [
    'EMAIL_FROM',
    'ADMIN_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  requiredEnvVars.forEach((varName) => {
    it(`throws error when ${varName} is missing`, () => {
      // Arrange
      delete process.env[varName];
      const expectedErrorPattern = new RegExp(`Missing environment variable for email service: ${varName}`)
      
      // Act
      const testFn = () => require('@/lib/email');
      
      // Assert
      // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
      // Test uses variable name to verify error message - not user-controlled input
      expect(testFn).toThrow(expectedErrorPattern);
    });
  });
});