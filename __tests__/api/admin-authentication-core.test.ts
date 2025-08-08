/**
 * API-level Admin Authentication Tests
 * 
 * Strategic Context: CORE functionality testing per Navigator's controlled technical debt approach.
 * Tests admin authentication at the API level without requiring complex component mocking,
 * providing reliable verification of authentication business logic.
 * 
 * Business Protection: Verifies authentication endpoints work correctly independent of UI complexity,
 * ensuring admin access control functions as expected for business protection.
 */

import { NextRequest, NextResponse } from 'next/server'
import { POST as loginHandler } from '@/app/api/admin/login/route'
import { GET as sessionHandler } from '@/app/api/admin/session/route'

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ email: 'emily@moodovermuscle.com.au', exp: Date.now() / 1000 + 3600 }))
}))

describe('Admin Authentication API Core Tests', () => {
  const validCredentials = {
    email: 'emily@moodovermuscle.com.au',
    password: 'TestPassword123!'
  }

  const invalidCredentials = {
    email: 'wrong@example.com',
    password: 'wrongpassword'
  }

  describe('POST /api/admin/login', () => {
    it('returns JWT token for valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(validCredentials)
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.token).toBe('mock-jwt-token')
      expect(data.user).toEqual({
        email: validCredentials.email,
        name: 'Emily'
      })
    })

    it('rejects invalid credentials with 401', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCredentials)
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid credentials')
      expect(data.token).toBeUndefined()
    })

    it('rejects malformed request body with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }) // Missing password
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })

    it('rejects empty request body with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{}'
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Email and password are required')
    })

    it('handles invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: 'invalid-json{'
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid request')
    })

    it('enforces rate limiting concepts (simulated)', async () => {
      // Simulate multiple rapid requests from same source
      const requests = Array.from({ length: 5 }, () =>
        new NextRequest('http://localhost:3000/api/admin/login', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '192.168.1.100'
          },
          body: JSON.stringify(invalidCredentials)
        })
      )

      const responses = await Promise.all(requests.map(req => loginHandler(req)))
      
      // All should fail due to invalid credentials
      responses.forEach(response => {
        expect(response.status).toBe(401)
      })

      // Note: Actual rate limiting would be implemented at middleware level
      // This test verifies the endpoint handles multiple requests gracefully
    })
  })

  describe('GET /api/admin/session', () => {
    it('validates JWT token and returns user session', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer mock-jwt-token',
          'cookie': 'admin-token=mock-jwt-token'
        }
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual({
        email: 'emily@moodovermuscle.com.au'
      })
    })

    it('rejects request without authentication token', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET'
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('No token provided')
    })

    it('rejects invalid JWT token', async () => {
      // Mock jwt.verify to throw error for invalid token
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer invalid-token'
        }
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid token')
    })

    it('rejects expired JWT token', async () => {
      // Mock jwt.verify to return expired token
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => ({
        email: 'emily@moodovermuscle.com.au',
        exp: Date.now() / 1000 - 3600 // Expired 1 hour ago
      }))

      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer expired-token'
        }
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Token expired')
    })

    it('handles malformed authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          'authorization': 'InvalidFormat token'
        }
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('No token provided')
    })
  })

  describe('Authentication Flow Integration', () => {
    it('complete login -> session validation flow', async () => {
      // Step 1: Login with valid credentials
      const loginRequest = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(validCredentials)
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.token).toBe('mock-jwt-token')

      // Step 2: Use token to validate session
      const sessionRequest = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${loginData.token}`
        }
      })

      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.user.email).toBe(validCredentials.email)
    })

    it('handles session validation after failed login', async () => {
      // Step 1: Failed login attempt
      const loginRequest = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCredentials)
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(401)
      expect(loginData.token).toBeUndefined()

      // Step 2: Attempt session validation without valid token
      const sessionRequest = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET'
      })

      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(401)
      expect(sessionData.user).toBeUndefined()
    })
  })

  describe('Security Edge Cases', () => {
    it('prevents SQL injection attempts in email field', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: "'; DROP TABLE users; --",
          password: 'password'
        })
      })

      const response = await loginHandler(request)
      
      expect(response.status).toBe(401) // Should be treated as invalid credentials
    })

    it('handles extremely long input gracefully', async () => {
      const longString = 'a'.repeat(10000)
      
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: longString,
          password: longString
        })
      })

      const response = await loginHandler(request)
      
      expect(response.status).toBeLessThan(500) // Should not crash the server
    })

    it('validates email format in login request', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password'
        })
      })

      const response = await loginHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})