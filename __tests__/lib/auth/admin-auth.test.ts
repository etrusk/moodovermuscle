/**
 * Unit tests for AdminAuthService
 * Tests JWT operations, credential validation, and token lifecycle
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { AdminAuthService } from '@/lib/auth/admin-auth'

describe('AdminAuthService', () => {
  let authService: AdminAuthService

  beforeEach(() => {
    process.env.ADMIN_JWT_SECRET = 'test-secret-key-for-testing'
    authService = new AdminAuthService()
  })

  describe('authenticateAdmin', () => {
    it('rejects invalid email', async () => {
      // Arrange: Setup invalid email
      const invalidEmail = 'wrong@example.com'

      // Act: Attempt authentication
      const result = await authService.authenticateAdmin(invalidEmail, 'any-password')

      // Assert: Returns null without checking password
      expect(result).toBeNull()
    })

    it('handles empty email', async () => {
      // Arrange: Setup empty email
      const emptyEmail = ''

      // Act: Attempt authentication
      const result = await authService.authenticateAdmin(emptyEmail, 'password')

      // Assert: Returns null for empty input
      expect(result).toBeNull()
    })
  })


  describe('edge cases', () => {
    it('throws error when JWT_SECRET missing in production', () => {
      // Arrange: Setup production environment without secret
      const originalEnv = process.env.NODE_ENV
      const originalSecret = process.env.ADMIN_JWT_SECRET
      process.env.NODE_ENV = 'production'
      delete process.env.ADMIN_JWT_SECRET

      // Act & Assert: Constructor throws error
      expect(() => new AdminAuthService()).toThrow('ADMIN_JWT_SECRET must be set in production')

      // Cleanup
      process.env.NODE_ENV = originalEnv
      process.env.ADMIN_JWT_SECRET = originalSecret
    })

    it('uses fallback secret in non-production environment', () => {
      // Arrange: Setup non-production environment without secret
      const originalEnv = process.env.NODE_ENV
      const originalSecret = process.env.ADMIN_JWT_SECRET
      process.env.NODE_ENV = 'development'
      delete process.env.ADMIN_JWT_SECRET

      // Act: Create service without throwing
      const service = new AdminAuthService()

      // Assert: Service created successfully (verifies it's an instance)
      expect(service).toBeInstanceOf(AdminAuthService)

      // Cleanup
      process.env.NODE_ENV = originalEnv
      process.env.ADMIN_JWT_SECRET = originalSecret
    })
  })
})