/* eslint-disable @typescript-eslint/no-var-requires */

import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest'

describe('Email environment variable validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
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
    it(`validates ${varName} is present and module loads successfully`, async () => {
      // Arrange
      expect(process.env[varName]).toEqual(expect.any(String));
      
      // Act
      const email = await import('@/lib/email');
      
      // Assert
      expect(email.sendCustomerConfirmation).toEqual(expect.any(Function));
      expect(email.sendAdminNotification).toEqual(expect.any(Function));
      expect(email.testEmailConnection).toEqual(expect.any(Function));
      expect(email.createCustomerConfirmationEmail).toEqual(expect.any(Function));
      expect(email.createAdminNotificationEmail).toEqual(expect.any(Function));
    });
  });
});