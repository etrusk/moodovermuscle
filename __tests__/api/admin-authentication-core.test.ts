/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 *
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

  // Helper to create login requests
  const createLoginRequest = (credentials: Record<string, unknown>) =>
    new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials)
    })

  // Helper to create session requests
  const createSessionRequest = (token?: string, includeHeader = true) => {
    const headers: Record<string, string> = {}
    if (token && includeHeader) {
      headers['authorization'] = `Bearer ${token}`
    }
    if (token) {
      headers['cookie'] = `admin-token=${token}`
    }
    return new NextRequest('http://localhost:3000/api/admin/session', {
      method: 'GET',
      headers
    })
  }

  describe('POST /api/admin/login', () => {
    it('authenticates admin with valid credentials', async () => {
      // Arrange
      const request = createLoginRequest(validCredentials)

      // Act
      const response = await loginHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        token: expect.any(String),
        user: {
          email: validCredentials.email,
          name: 'Emily'
        }
      })
    })

    it('prevents authentication with invalid credentials', async () => {
      // Arrange
      const request = createLoginRequest(invalidCredentials)

      // Act
      const response = await loginHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      })
      expect(data.token).toBeUndefined()
    })

    it('validates required authentication fields', async () => {
      // Arrange
      const request = createLoginRequest({ email: 'test@example.com' }) // Missing password

      // Act
      const response = await loginHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/required/i)
      })
    })

    it('requires both email and password', async () => {
      // Arrange
      const request = createLoginRequest({})

      // Act
      const response = await loginHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/email and password are required/i)
      })
    })

    it('handles malformed request data', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid-json{'
      })

      // Act
      const response = await loginHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/invalid request/i)
      })
    })

    it('handles concurrent authentication attempts', async () => {
      // Arrange
      const requests = Array.from({ length: 5 }, () => createLoginRequest(invalidCredentials))

      // Act
      const responses = await Promise.all(requests.map(req => loginHandler(req)))
      
      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(401)
      })
      // Note: Rate limiting implemented at middleware level
    })
  })

  describe('GET /api/admin/session', () => {
    it('validates session with valid token', async () => {
      // Arrange
      const request = createSessionRequest('mock-jwt-token')

      // Act
      const response = await sessionHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        user: {
          email: 'emily@moodovermuscle.com.au'
        }
      })
    })

    it('prevents access without authentication', async () => {
      // Arrange
      const request = createSessionRequest()

      // Act
      const response = await sessionHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'No token provided'
      })
    })

    it('prevents access with invalid token', async () => {
      // Arrange
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })
      const request = createSessionRequest('invalid-token')

      // Act
      const response = await sessionHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Invalid token'
      })
    })

    it('prevents access with expired token', async () => {
      // Arrange
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => ({
        email: 'emily@moodovermuscle.com.au',
        exp: Date.now() / 1000 - 3600 // Expired 1 hour ago
      }))
      const request = createSessionRequest('expired-token')

      // Act
      const response = await sessionHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Token expired'
      })
    })

    it('handles malformed authorization header', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: { 'authorization': 'InvalidFormat token' }
      })

      // Act
      const response = await sessionHandler(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'No token provided'
      })
    })
  })

  describe('Authentication Flow Integration', () => {
    it('allows session access after successful login', async () => {
      // Arrange
      const loginRequest = createLoginRequest(validCredentials)

      // Act - Step 1: Authenticate
      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      // Assert - Step 1
      expect(loginResponse.status).toBe(200)
      expect(loginData.token).toBeDefined()

      // Act - Step 2: Validate session with token
      const sessionRequest = createSessionRequest(loginData.token, true)
      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      // Assert - Step 2
      expect(sessionResponse.status).toBe(200)
      expect(sessionData.user.email).toBe(validCredentials.email)
    })

    it('prevents session access after failed login', async () => {
      // Arrange
      const loginRequest = createLoginRequest(invalidCredentials)

      // Act - Step 1: Failed authentication
      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      // Assert - Step 1
      expect(loginResponse.status).toBe(401)
      expect(loginData.token).toBeUndefined()

      // Act - Step 2: Session validation without token
      const sessionRequest = createSessionRequest()
      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      // Assert - Step 2
      expect(sessionResponse.status).toBe(401)
      expect(sessionData.user).toBeUndefined()
    })
  })

  describe('Security Edge Cases', () => {
    it('prevents SQL injection attempts', async () => {
      // Arrange
      const request = createLoginRequest({
        email: "'; DROP TABLE users; --",
        password: 'password'
      })

      // Act
      const response = await loginHandler(request)
      
      // Assert
      expect(response.status).toBe(401) // Treated as invalid credentials
    })

    it('handles excessive input length gracefully', async () => {
      // Arrange
      const longString = 'a'.repeat(10000)
      const request = createLoginRequest({
        email: longString,
        password: longString
      })

      // Act
      const response = await loginHandler(request)
      
      // Assert
      expect(response.status).toBeLessThan(500) // No server crash
    })

    it('validates email format', async () => {
      // Arrange
      const request = createLoginRequest({
        email: 'not-an-email',
        password: 'password'
      })

      // Act
      const response = await loginHandler(request)
      const data = await response.json()
      
      // Assert
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})