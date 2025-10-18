import { describe, it, expect } from 'vitest'
import { verifyAdminAuth } from '@/lib/utils/admin-auth-check'
import { NextRequest } from 'next/server'

describe('verifyAdminAuth', () => {
  describe('Successful authentication', () => {
    it('returns admin credentials when both headers are present', () => {
      // Arrange: Create request with valid authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
          'x-admin-email': 'admin@example.com',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns admin credentials with no error
      expect(result.error).toBeNull()
      expect(result.adminId).toBe('admin-123')
      expect(result.adminEmail).toBe('admin@example.com')
    })

    it('returns exact header values without modification', () => {
      // Arrange: Create request with specific header values
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-admin-id': 'special-admin-456',
          'x-admin-email': 'test.admin+tag@example.com',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns exact values without trimming or modification
      expect(result.error).toBeNull()
      expect(result.adminId).toBe('special-admin-456')
      expect(result.adminEmail).toBe('test.admin+tag@example.com')
    })
  })

  describe('Missing headers', () => {
    it('returns error when both headers are missing', async () => {
      // Arrange: Create request without authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('returns error when only x-admin-id is missing', async () => {
      // Arrange: Create request with only admin email header
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-email': 'admin@example.com',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('returns error when only x-admin-email is missing', async () => {
      // Arrange: Create request with only admin ID header
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })
  })

  describe('Edge cases', () => {
    it('returns error when x-admin-id is empty string', async () => {
      // Arrange: Create request with empty admin ID header
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': '',
          'x-admin-email': 'admin@example.com',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response (empty string is falsy)
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('returns error when x-admin-email is empty string', async () => {
      // Arrange: Create request with empty admin email header
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
          'x-admin-email': '',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response (empty string is falsy)
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('returns error when both headers are empty strings', async () => {
      // Arrange: Create request with both headers as empty strings
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': '',
          'x-admin-email': '',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns null credentials and error response
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()

      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })

    it('handles whitespace-only header values as invalid', async () => {
      // Arrange: Create request with whitespace-only headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': '   ',
          'x-admin-email': '  ',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns error (headers.get() appears to trim whitespace or return null)
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()
      
      // Assert: Error response has correct status and message
      const response = result.error!
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body).toEqual({ error: 'Admin authentication required' })
    })
  })

  describe('Response structure validation', () => {
    it('returns NextResponse object for error cases', async () => {
      // Arrange: Create request without authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Error is a NextResponse object with json method
      expect(result.error).not.toBeNull()
      expect(typeof result.error!.json).toBe('function')
      expect(result.error!.status).toBe(401)
    })

    it('returns consistent error message format', async () => {
      // Arrange: Create request without authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Error message has expected structure
      const response = result.error!
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(typeof body.error).toBe('string')
      expect(body.error).toBe('Admin authentication required')
    })
  })

  describe('Success response structure validation', () => {
    it('returns object with exact structure for success', () => {
      // Arrange: Create request with valid authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin-123',
          'x-admin-email': 'admin@example.com',
        },
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns object with exact three properties
      expect(Object.keys(result)).toEqual(['adminId', 'adminEmail', 'error'])
      expect(result).toEqual({
        adminId: 'admin-123',
        adminEmail: 'admin@example.com',
        error: null,
      })
    })

    it('returns error object with exact structure for failure', () => {
      // Arrange: Create request without authentication headers
      const request = new Request('http://localhost/api/test', {
        method: 'GET',
      }) as NextRequest

      // Act: Verify admin authentication
      const result = verifyAdminAuth(request)

      // Assert: Returns object with exact three properties
      expect(Object.keys(result)).toEqual(['adminId', 'adminEmail', 'error'])
      expect(result.adminId).toBeNull()
      expect(result.adminEmail).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })
})