import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, DELETE } from '@/app/api/admin/session/route'
import * as handlers from '@/lib/auth/admin-auth-handlers'

// Mock the admin-auth-handlers module
vi.mock('@/lib/auth/admin-auth-handlers', () => ({
  handleSessionValidation: vi.fn(),
}))

describe('app/api/admin/session/route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET handler', () => {
    it('should return 200 with user data for valid session', async () => {
      // Arrange
      const mockValidationResult = {
        valid: true,
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emilia',
        },
      }
      vi.mocked(handlers.handleSessionValidation).mockResolvedValue(mockValidationResult)

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          Cookie: 'admin-token=valid-jwt-token',
        },
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emilia',
        },
        isAuthenticated: true,
      })
      expect(handlers.handleSessionValidation).toHaveBeenCalledWith('valid-jwt-token')
    })

    it('should return 401 for missing token', async () => {
      // Arrange
      const mockValidationResult = {
        valid: false,
        error: 'No admin session found',
      }
      vi.mocked(handlers.handleSessionValidation).mockResolvedValue(mockValidationResult)

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({
        error: 'No admin session found',
      })
      expect(handlers.handleSessionValidation).toHaveBeenCalledWith(undefined)
    })

    it('should return 401 for invalid token', async () => {
      // Arrange
      const mockValidationResult = {
        valid: false,
        error: 'Invalid or expired session',
      }
      vi.mocked(handlers.handleSessionValidation).mockResolvedValue(mockValidationResult)

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          Cookie: 'admin-token=invalid-token',
        },
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({
        error: 'Invalid or expired session',
      })
      expect(handlers.handleSessionValidation).toHaveBeenCalledWith('invalid-token')
    })

    it('should return 401 for expired token', async () => {
      // Arrange
      const mockValidationResult = {
        valid: false,
        error: 'Invalid or expired session',
      }
      vi.mocked(handlers.handleSessionValidation).mockResolvedValue(mockValidationResult)

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          Cookie: 'admin-token=expired-token',
        },
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({
        error: 'Invalid or expired session',
      })
    })

    it('should return 500 on server error', async () => {
      // Arrange
      vi.mocked(handlers.handleSessionValidation).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          Cookie: 'admin-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({
        error: 'Internal server error',
      })
    })
  })

  describe('DELETE handler', () => {
    it('should return 200 and clear cookie on successful logout', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        message: 'Logout successful',
      })

      // Verify cookie is cleared
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('admin-token=')
      expect(setCookieHeader).toContain('HttpOnly')
      expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax')
      // Cookie is cleared by setting empty value (Next.js may omit Max-Age=0)
      expect(setCookieHeader).toMatch(/admin-token=;/)
      expect(setCookieHeader).toContain('Path=/')
    })

    it('should set secure cookie flag in production environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(request)

      // Assert
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('Secure')

      // Cleanup
      process.env.NODE_ENV = originalEnv
    })

    it('should clear cookie regardless of current session state', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'DELETE',
        headers: {
          Cookie: 'admin-token=any-token-value',
        },
      })

      // Act
      const response = await DELETE(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        message: 'Logout successful',
      })
      
      const setCookieHeader = response.headers.get('set-cookie')
      // Cookie is cleared by setting empty value
      expect(setCookieHeader).toMatch(/admin-token=;/)
    })
  })
})