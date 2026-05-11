/**
 * Unit tests for useAdminAuth hook
 * Tests custom React hook for admin authentication functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { useRouter } from 'next/navigation'
import { server } from '@/__tests__/setup/server'
import { http, HttpResponse } from 'msw'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('useAdminAuth', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any)
  })

  describe('hook initialization', () => {
    it('initializes with loading state', () => {
      // Arrange: Mock pending session check with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return new Promise(() => {}) // Never resolves
        })
      )

      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Returns initial loading state
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles invalid session on mount', async () => {
      // Arrange: Mock invalid session with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        })
      )

      // Act: Render hook with invalid session
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Stays unauthenticated
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles session check error on mount', async () => {
      // Arrange: Mock network error with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.error()
        })
      )

      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Handles error gracefully
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('successfully loads valid session on mount', async () => {
      // Arrange: MSW default handler returns valid session
      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Loads authenticated session
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isAuthenticated).toBe(true)
      })
      expect(result.current.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
      })
    })
  })

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      // Arrange: Setup initial unauthenticated state with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Perform login (MSW default handler validates credentials)
      let loginResult: { success: boolean; error?: string } = { success: false }
      await act(async () => {
        loginResult = await result.current.login('emily@moodovermuscle.com.au', 'Emily2025!')
      })

      // Assert: Login successful with user data
      expect(loginResult.success).toBe(true)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
      })
    })

    it('handles invalid credentials', async () => {
      // Arrange: Setup initial unauthenticated state
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Attempt login with invalid credentials (MSW validates and rejects)
      let loginResult: { success: boolean; error?: string } = { success: true }
      await act(async () => {
        loginResult = await result.current.login('emily@moodovermuscle.com.au', 'WrongPassword')
      })

      // Assert: Returns failure with specific error
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Invalid credentials')
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('handles network error during login', async () => {
      // Arrange: Setup network failure with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true }),
        http.post('/api/admin/login', () => {
          return HttpResponse.error()
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Attempt login with network failure
      let loginResult: { success: boolean; error?: string } = { success: true }
      await act(async () => {
        loginResult = await result.current.login('emily@moodovermuscle.com.au', 'password')
      })

      // Assert: Returns failure with generic error
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Network error. Please try again.')
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('handles login response without error property', async () => {
      // Arrange: Setup failed login without error message with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true }),
        http.post('/api/admin/login', () => {
          return HttpResponse.json({}, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Attempt login
      let loginResult: { success: boolean; error?: string } = { success: true }
      await act(async () => {
        loginResult = await result.current.login('emily@moodovermuscle.com.au', 'password')
      })

      // Assert: Returns default error message
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Login failed')
    })
  })

  describe('logout', () => {
    it('successfully logs out and navigates to login page', async () => {
      // Arrange: Setup authenticated state (MSW default returns valid session)
      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Act: Logout
      await act(async () => {
        await result.current.logout()
      })

      // Assert: Clears session and navigates (setTimeout(fn, 0) executes after current microtasks)
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      expect(result.current.user).toBeNull()
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login')
      })
    })

    it('handles logout when already logged out', async () => {
      // Arrange: Setup unauthenticated state with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Logout when not authenticated
      await act(async () => {
        await result.current.logout()
      })

      // Assert: No errors, navigates to login (setTimeout(fn, 0) executes after current microtasks)
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login')
      })
    })

    it('clears session even when logout API fails', async () => {
      // Arrange: Setup authenticated state with failing logout using MSW
      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      server.use(
        http.delete('/api/admin/session', () => {
          return HttpResponse.error()
        }, { once: true })
      )

      // Act: Logout with network error
      await act(async () => {
        await result.current.logout()
      })

      // Assert: Still clears session locally (setTimeout(fn, 0) executes after current microtasks)
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      expect(result.current.user).toBeNull()
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login')
      })
    })
  })

  describe('refreshSession', () => {
    it('successfully refreshes valid session', async () => {
      // Arrange: Setup initial unauthenticated state with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.isAuthenticated).toBe(false)

      // Reset to default handler that returns valid session
      server.resetHandlers()

      // Act: Refresh session
      await act(async () => {
        await result.current.refreshSession()
      })

      // Assert: Session updated to authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).not.toBeNull()
      })
      expect(result.current.user).toEqual({
        id: 'emily-admin-1',
        email: 'emily@moodovermuscle.com.au',
        name: 'Emilia',
      })
    })

    it('handles refresh session failure', async () => {
      // Arrange: Setup authenticated state (MSW default returns valid session)
      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Override for failing refresh
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Session expired' }, { status: 401 })
        }, { once: true })
      )

      // Act: Refresh session with expired token
      await act(async () => {
        await result.current.refreshSession()
      })

      // Assert: Session becomes unauthenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      expect(result.current.user).toBeNull()
    })

    it('handles refresh session network error', async () => {
      // Arrange: Setup authenticated state (MSW default returns valid session)
      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Override for network error on refresh
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.error()
        }, { once: true })
      )

      // Act: Refresh session with network failure
      await act(async () => {
        await result.current.refreshSession()
      })

      // Assert: Handles error gracefully, becomes unauthenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      expect(result.current.user).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('maintains correct loading state throughout operations', async () => {
      // Arrange: Mock initial check with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      const { result } = renderHook(() => useAdminAuth())

      // Assert: Initial loading state
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert: Loading complete after initial check
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('exposes all required functions and state', async () => {
      // Arrange: Mock session check with MSW
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }, { once: true })
      )

      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert: Hook exposes complete interface
      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isAuthenticated')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('logout')
      expect(result.current).toHaveProperty('refreshSession')
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.refreshSession).toBe('function')
    })
  })
})