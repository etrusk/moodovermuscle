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
      const request = createLoginRequest(validCredentials)
      const response = await loginHandler(request)
      const data = await response.json()

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
      const request = createLoginRequest(invalidCredentials)
      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      })
      expect(data.token).toBeUndefined()
    })

    it('validates required authentication fields', async () => {
      const request = createLoginRequest({ email: 'test@example.com' }) // Missing password
      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/required/i)
      })
    })

    it('requires both email and password', async () => {
      const request = createLoginRequest({})
      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/email and password are required/i)
      })
    })

    it('handles malformed request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid-json{'
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toMatchObject({
        success: false,
        error: expect.stringMatching(/invalid request/i)
      })
    })

    it('handles concurrent authentication attempts', async () => {
      // Verify endpoint handles multiple rapid requests gracefully
      const requests = Array.from({ length: 5 }, () => createLoginRequest(invalidCredentials))
      const responses = await Promise.all(requests.map(req => loginHandler(req)))
      
      // All should fail consistently
      responses.forEach(response => {
        expect(response.status).toBe(401)
      })

      // Note: Rate limiting implemented at middleware level
    })
  })

  describe('GET /api/admin/session', () => {
    it('validates session with valid token', async () => {
      const request = createSessionRequest('mock-jwt-token')
      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        user: {
          email: 'emily@moodovermuscle.com.au'
        }
      })
    })

    it('prevents access without authentication', async () => {
      const request = createSessionRequest()
      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'No token provided'
      })
    })

    it('prevents access with invalid token', async () => {
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token')
      })

      const request = createSessionRequest('invalid-token')
      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Invalid token'
      })
    })

    it('prevents access with expired token', async () => {
      const jwt = require('jsonwebtoken')
      jest.mocked(jwt.verify).mockImplementationOnce(() => ({
        email: 'emily@moodovermuscle.com.au',
        exp: Date.now() / 1000 - 3600 // Expired 1 hour ago
      }))

      const request = createSessionRequest('expired-token')
      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'Token expired'
      })
    })

    it('handles malformed authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/session', {
        method: 'GET',
        headers: { 'authorization': 'InvalidFormat token' }
      })

      const response = await sessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toMatchObject({
        success: false,
        error: 'No token provided'
      })
    })
  })

  describe('Authentication Flow Integration', () => {
    it('allows session access after successful login', async () => {
      // Step 1: Authenticate
      const loginRequest = createLoginRequest(validCredentials)
      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.token).toBeDefined()

      // Step 2: Validate session with token
      const sessionRequest = createSessionRequest(loginData.token, true)
      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.user.email).toBe(validCredentials.email)
    })

    it('prevents session access after failed login', async () => {
      // Step 1: Failed authentication
      const loginRequest = createLoginRequest(invalidCredentials)
      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(401)
      expect(loginData.token).toBeUndefined()

      // Step 2: Session validation without token
      const sessionRequest = createSessionRequest()
      const sessionResponse = await sessionHandler(sessionRequest)
      const sessionData = await sessionResponse.json()

      expect(sessionResponse.status).toBe(401)
      expect(sessionData.user).toBeUndefined()
    })
  })

  describe('Security Edge Cases', () => {
    it('prevents SQL injection attempts', async () => {
      const request = createLoginRequest({
        email: "'; DROP TABLE users; --",
        password: 'password'
      })

      const response = await loginHandler(request)
      
      expect(response.status).toBe(401) // Treated as invalid credentials
    })

    it('handles excessive input length gracefully', async () => {
      const longString = 'a'.repeat(10000)
      const request = createLoginRequest({
        email: longString,
        password: longString
      })

      const response = await loginHandler(request)
      
      expect(response.status).toBeLessThan(500) // No server crash
    })

    it('validates email format', async () => {
      const request = createLoginRequest({
        email: 'not-an-email',
        password: 'password'
      })

      const response = await loginHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})