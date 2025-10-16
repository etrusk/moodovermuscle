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
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
  })

  describe('login', () => {
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
  })

  describe('logout', () => {
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

      // Assert: No errors, navigates to login
      expect(result.current.isAuthenticated).toBe(false)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login')
      })
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
  })
})