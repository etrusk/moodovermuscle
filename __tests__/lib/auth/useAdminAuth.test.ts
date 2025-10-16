/**
 * Unit tests for useAdminAuth hook
 * Tests custom React hook for admin authentication functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { useRouter } from 'next/navigation'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useAdminAuth', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockFetch.mockReset()
  })

  describe('hook initialization', () => {
    it('initializes with loading state', () => {
      // Arrange: Mock pending session check
      mockFetch.mockImplementation(() => new Promise(() => {}))

      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Returns initial loading state
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles invalid session on mount', async () => {
      // Arrange: Mock invalid session
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })

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
      // Arrange: Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Act: Render hook
      const { result } = renderHook(() => useAdminAuth())

      // Assert: Handles error gracefully
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('successfully loads valid session on mount', async () => {
      // Arrange: Mock valid session
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
        }),
      })

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
        name: 'Emily',
      })
    })
  })

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      // Arrange: Setup initial unauthenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Perform login
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
        name: 'Emily',
      })
    })

    it('handles invalid credentials', async () => {
      // Arrange: Setup failed login
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Invalid credentials' }),
        })

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act: Attempt login with invalid credentials
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
      // Arrange: Setup network failure
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockRejectedValueOnce(new Error('Network error'))

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
      // Arrange: Setup failed login without error message
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })

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
      // Arrange: Setup authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })

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
      // Arrange: Setup unauthenticated state
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
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
      // Arrange: Setup authenticated state with failing logout
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })
        .mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

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
      // Arrange: Setup initial unauthenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.isAuthenticated).toBe(false)

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
        name: 'Emily',
      })
    })

    it('handles refresh session failure', async () => {
      // Arrange: Setup authenticated state with failing refresh
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Session expired' }),
        })

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

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
      // Arrange: Setup authenticated state with network error on refresh
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })
        .mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAdminAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

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
      // Arrange: Mock initial check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

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
      // Arrange: Mock session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

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