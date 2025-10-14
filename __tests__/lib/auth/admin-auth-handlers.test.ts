import {
  handleLogin,
  handleSessionValidation,
  LoginRequest,
  LoginResult,
  SessionValidationResult,
} from '@/lib/auth/admin-auth-handlers'
import { adminAuth } from '@/lib/auth/admin-auth'

// Mock the adminAuth module
jest.mock('@/lib/auth/admin-auth', () => ({
  adminAuth: {
    authenticateAdmin: jest.fn(),
    verifyAdminToken: jest.fn(),
  },
}))

describe('admin-auth-handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleLogin', () => {
    const validRequest: LoginRequest = {
      email: 'emily@moodovermuscle.com.au',
      password: 'Emily2025!',
    }

    it('should return success with user data and token for valid credentials', async () => {
      // Arrange
      const mockAuthResult = {
        user: {
          id: 'emily-admin-1',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
          isActive: true,
          lastLogin: new Date(),
        },
        token: 'mock-jwt-token',
      }

      ;(adminAuth.authenticateAdmin as jest.Mock).mockResolvedValue(mockAuthResult)

      // Act
      const result: LoginResult = await handleLogin(validRequest)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emily',
      })
      expect(result.token).toBe('mock-jwt-token')
      expect(result.error).toBeUndefined()
      expect(adminAuth.authenticateAdmin).toHaveBeenCalledWith(
        validRequest.email,
        validRequest.password
      )
    })

    it('should return error for invalid email format', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: 'not-an-email',
        password: 'Password123!',
      }

      // Act
      const result: LoginResult = await handleLogin(invalidRequest)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid input')
      expect(result.validationErrors).toEqual(expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('valid email') })
      ]))
      expect(result.validationErrors).toHaveLength(1)
      expect(result.validationErrors![0].message).toContain('valid email')
      expect(adminAuth.authenticateAdmin).not.toHaveBeenCalled()
    })

    it('should return error for missing password', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: 'emily@moodovermuscle.com.au',
        password: '',
      }

      // Act
      const result: LoginResult = await handleLogin(invalidRequest)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid input')
      expect(result.validationErrors).toEqual(expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('required') })
      ]))
      expect(result.validationErrors![0].message).toContain('required')
      expect(adminAuth.authenticateAdmin).not.toHaveBeenCalled()
    })

    it('should return error for invalid credentials', async () => {
      // Arrange
      ;(adminAuth.authenticateAdmin as jest.Mock).mockResolvedValue(null)

      // Act
      const result: LoginResult = await handleLogin(validRequest)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
      expect(result.user).toBeUndefined()
      expect(result.token).toBeUndefined()
      expect(adminAuth.authenticateAdmin).toHaveBeenCalledWith(
        validRequest.email,
        validRequest.password
      )
    })

    it('should handle multiple validation errors', async () => {
      // Arrange
      const invalidRequest: LoginRequest = {
        email: '',
        password: '',
      }

      // Act
      const result: LoginResult = await handleLogin(invalidRequest)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid input')
      expect(result.validationErrors).toEqual(expect.arrayContaining([
        expect.objectContaining({ message: expect.any(String) })
      ]))
      expect(result.validationErrors!).toHaveLength(2) // Email and password both required
      expect(adminAuth.authenticateAdmin).not.toHaveBeenCalled()
    })
  })

  describe('handleSessionValidation', () => {
    const validToken = 'valid-jwt-token'

    it('should return valid session for valid token', async () => {
      // Arrange
      const mockPayload = {
        adminId: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emily',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      ;(adminAuth.verifyAdminToken as jest.Mock).mockResolvedValue(mockPayload)

      // Act
      const result: SessionValidationResult = await handleSessionValidation(validToken)

      // Assert
      expect(result.valid).toBe(true)
      expect(result.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emily',
      })
      expect(result.error).toBeUndefined()
      expect(adminAuth.verifyAdminToken).toHaveBeenCalledWith(validToken)
    })

    it('should return error for invalid token', async () => {
      // Arrange
      ;(adminAuth.verifyAdminToken as jest.Mock).mockResolvedValue(null)

      // Act
      const result: SessionValidationResult = await handleSessionValidation('invalid-token')

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid or expired session')
      expect(result.user).toBeUndefined()
      expect(adminAuth.verifyAdminToken).toHaveBeenCalledWith('invalid-token')
    })

    it('should return error for expired token', async () => {
      // Arrange
      ;(adminAuth.verifyAdminToken as jest.Mock).mockResolvedValue(null)

      // Act
      const result: SessionValidationResult = await handleSessionValidation('expired-token')

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid or expired session')
      expect(result.user).toBeUndefined()
    })

    it('should return error for missing token (undefined)', async () => {
      // Act
      const result: SessionValidationResult = await handleSessionValidation(undefined)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No admin session found')
      expect(result.user).toBeUndefined()
      expect(adminAuth.verifyAdminToken).not.toHaveBeenCalled()
    })

    it('should return error for empty token string', async () => {
      // Act
      const result: SessionValidationResult = await handleSessionValidation('')

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No admin session found')
      expect(result.user).toBeUndefined()
      expect(adminAuth.verifyAdminToken).not.toHaveBeenCalled()
    })
  })
})