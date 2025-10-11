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
    it(`throws an error if ${varName} is missing`, () => {
      delete process.env[varName];
      // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
      // Test uses variable name to verify error message - not user-controlled input
      expect(() => require('@/lib/email')).toThrow(
        new RegExp(`Missing environment variable for email service: ${varName}`)
      );
    });
  });
});