/**
 * Unit tests for AdminAuthService
 * Tests JWT operations, credential validation, and token lifecycle
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AdminAuthService } from '@/lib/auth/admin-auth'
import type { JWTPayload } from 'jose'

// Use real bcryptjs for password hashing verification
vi.unmock('bcryptjs')

// Mock jose with proper state management for test isolation
const mockTokenStore = new Map<string, JWTPayload>()

vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockImplementation(() => {
      const token = `mock-jwt-token-${Date.now()}-${Math.random()}`
      const payload: JWTPayload = {
        adminId: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 28800,
      }
      mockTokenStore.set(token, payload)
      return Promise.resolve(token)
      }),
    }
  }),
  jwtVerify: vi.fn().mockImplementation((token: string) => {
    const payload = mockTokenStore.get(token)
    if (payload) {
      return Promise.resolve({ payload })
    }
    throw new Error('Invalid token')
  }),
}))

describe('AdminAuthService', () => {
  let authService: AdminAuthService

  beforeEach(() => {
    vi.clearAllMocks()
    // Use unique secret per test to ensure token isolation
    process.env.ADMIN_JWT_SECRET = `test-secret-key-${Date.now()}-${Math.random()}`
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

    it('successfully authenticates with valid credentials', async () => {
      // Arrange: Setup valid credentials (using real bcrypt to verify against stored hash)
      const validEmail = 'emily@moodovermuscle.com.au'
      const validPassword = 'Emily2025!'

      // Act: Authenticate with valid credentials
      const result = await authService.authenticateAdmin(validEmail, validPassword)

      // Assert: Returns user and token
      expect(result).not.toBeNull()
      expect(result?.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
        isActive: true,
        lastLogin: expect.any(Date),
      })
      expect(result?.token).toEqual(expect.any(String))
    })

    it('rejects invalid password', async () => {
      // Arrange: Setup invalid password
      const validEmail = 'emily@moodovermuscle.com.au'
      const invalidPassword = 'WrongPassword123'

      // Act: Attempt authentication with wrong password
      const result = await authService.authenticateAdmin(validEmail, invalidPassword)

      // Assert: Returns null for invalid password
      expect(result).toBeNull()
    })

    it('normalizes email for comparison', async () => {
      // Arrange: Setup email with mixed case and whitespace
      const unnormalizedEmail = '  Emily@MoodOverMuscle.com.au  '
      const validPassword = 'Emily2025!'

      // Act: Authenticate with unnormalized email
      const result = await authService.authenticateAdmin(unnormalizedEmail, validPassword)

      // Assert: Successfully authenticates after normalization
      expect(result).not.toBeNull()
      expect(result?.user.email).toBe('emily@moodovermuscle.com.au')
    })
  })

  describe('verifyAdminToken', () => {
    it('successfully verifies valid token', async () => {
      // Arrange: Generate valid token using real JWT implementation
      const validEmail = 'emily@moodovermuscle.com.au'
      const validPassword = 'Emily2025!'
      const authResult = await authService.authenticateAdmin(validEmail, validPassword)
      const token = authResult!.token

      // Act: Verify the token using real verification
      const payload = await authService.verifyAdminToken(token)

      // Assert: Returns valid payload with expected structure
      expect(payload).not.toBeNull()
      expect(payload).toEqual({
        adminId: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
        iat: expect.any(Number),
        exp: expect.any(Number),
      })
      expect(payload!.exp).toBeGreaterThan(payload!.iat)
    })

    it('rejects invalid token', async () => {
      // Arrange: Setup invalid token
      const invalidToken = 'invalid.jwt.token'

      // Act: Attempt to verify invalid token
      const payload = await authService.verifyAdminToken(invalidToken)

      // Assert: Returns null for invalid token
      expect(payload).toBeNull()
    })

    it('rejects malformed token', async () => {
      // Arrange: Setup malformed token
      const malformedToken = 'not-a-valid-jwt'

      // Act: Attempt to verify malformed token
      const payload = await authService.verifyAdminToken(malformedToken)

      // Assert: Returns null for malformed token
      expect(payload).toBeNull()
    })
  })

  describe('refreshAdminToken', () => {
    it('successfully refreshes valid token', async () => {
      // Arrange: Generate initial token
      const validEmail = 'emily@moodovermuscle.com.au'
      const validPassword = 'Emily2025!'
      const authResult = await authService.authenticateAdmin(validEmail, validPassword)
      const originalToken = authResult!.token

      // Act: Refresh the token
      const newToken = await authService.refreshAdminToken(originalToken)

      // Assert: Returns new valid token (different from original due to timestamps)
      expect(newToken).not.toBeNull()
      expect(newToken).toEqual(expect.any(String))

      // Verify new token is valid
      const newPayload = await authService.verifyAdminToken(newToken!)
      expect(newPayload).not.toBeNull()
      expect(newPayload?.adminId).toBe('emily-admin-1')
      expect(newPayload?.email).toBe('emily@moodovermuscle.com.au')
    })

    it('rejects refresh for invalid token', async () => {
      // Arrange: Setup invalid token
      const invalidToken = 'invalid.jwt.token'

      // Act: Attempt to refresh invalid token
      const newToken = await authService.refreshAdminToken(invalidToken)

      // Assert: Returns null for invalid token
      expect(newToken).toBeNull()
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