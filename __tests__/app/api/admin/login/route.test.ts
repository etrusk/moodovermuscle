import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST } from '@/app/api/admin/login/route'
import * as handlers from '@/lib/auth/admin-auth-handlers'

// Mock the admin-auth-handlers module
vi.mock('@/lib/auth/admin-auth-handlers', () => ({
  handleLogin: vi.fn(),
}))

describe('app/api/admin/login/route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST handler', () => {
    it('should return 200 with user data and set cookie on successful login', async () => {
      // Arrange
      const mockLoginResult = {
        success: true,
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
        },
        token: 'mock-jwt-token',
      }
      vi.mocked(handlers.handleLogin).mockResolvedValue(mockLoginResult)

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'emily@moodovermuscle.com.au',
          password: 'Emily2025!',
        }),
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        message: 'Login successful',
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
        },
      })
      expect(handlers.handleLogin).toHaveBeenCalledWith({
        email: 'emily@moodovermuscle.com.au',
        password: 'Emily2025!',
      })

      // Verify cookie settings
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('admin-token=mock-jwt-token')
      expect(setCookieHeader).toContain('HttpOnly')
      expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax')
      expect(setCookieHeader).toContain('Max-Age=28800') // 8 hours
      expect(setCookieHeader).toContain('Path=/')
    })

    it('should return 400 with validation errors for invalid input', async () => {
      // Arrange
      const mockLoginResult = {
        success: false,
        error: 'Invalid input',
        validationErrors: [
          { path: ['email'], message: 'Please enter a valid email address.' },
          { path: ['password'], message: 'Password is required.' },
        ],
      }
      vi.mocked(handlers.handleLogin).mockResolvedValue(mockLoginResult)

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: '',
        }),
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(body).toEqual({
        error: 'Invalid input',
        details: [
          { path: ['email'], message: 'Please enter a valid email address.' },
          { path: ['password'], message: 'Password is required.' },
        ],
      })
      expect(handlers.handleLogin).toHaveBeenCalled()
    })

    it('should return 401 for authentication failure', async () => {
      // Arrange
      const mockLoginResult = {
        success: false,
        error: 'Invalid email or password',
      }
      vi.mocked(handlers.handleLogin).mockResolvedValue(mockLoginResult)

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'emily@moodovermuscle.com.au',
          password: 'WrongPassword',
        }),
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(body).toEqual({
        error: 'Invalid email or password',
      })
      expect(handlers.handleLogin).toHaveBeenCalled()
    })

    it('should return 500 on server error', async () => {
      // Arrange
      vi.mocked(handlers.handleLogin).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'emily@moodovermuscle.com.au',
          password: 'Emily2025!',
        }),
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({
        error: 'Internal server error',
      })
    })

    it('should handle malformed JSON body', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(body).toEqual({
        error: 'Internal server error',
      })
    })

    it('should set secure cookie flag in production environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const mockLoginResult = {
        success: true,
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
        },
        token: 'mock-jwt-token',
      }
      vi.mocked(handlers.handleLogin).mockResolvedValue(mockLoginResult)

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'emily@moodovermuscle.com.au',
          password: 'Emily2025!',
        }),
      })

      // Act
      const response = await POST(request)

      // Assert
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('Secure')

      // Cleanup
      process.env.NODE_ENV = originalEnv
    })

    it('should not set cookie if token is missing in success result', async () => {
      // Arrange
      const mockLoginResult = {
        success: true,
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
        },
        // No token field
      }
      vi.mocked(handlers.handleLogin).mockResolvedValue(mockLoginResult)

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'emily@moodovermuscle.com.au',
          password: 'Emily2025!',
        }),
      })

      // Act
      const response = await POST(request)
      const body = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(body).toEqual({
        message: 'Login successful',
        user: {
          id: 'admin-123',
          email: 'emily@moodovermuscle.com.au',
          name: 'Emily',
        },
      })
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toBeFalsy()
    })
  })
})