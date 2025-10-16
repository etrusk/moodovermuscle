/**
 * Unit tests for AdminAuthContext
 * Tests React Context provider for admin authentication with session state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AdminAuthProvider, useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { useRouter } from 'next/navigation'
import React from 'react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Test component to access context
function TestComponent() {
  const { isAuthenticated, isLoading, logout } = useAdminAuth()

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'not-loading'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AdminAuthContext', () => {
  const mockPush = vi.fn()
  const mockReplace = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AdminAuthProvider initialization', () => {
    it('renders children with initial loading state', () => {
      // Arrange: Mock pending session check
      mockFetch.mockImplementation(() => new Promise(() => {}))

      // Act: Mount component
      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      // Assert: Shows initial loading state
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('handles invalid session on mount', async () => {
      // Arrange: Mock invalid session
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })

      // Act: Mount component with invalid session
      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      // Assert: Stays unauthenticated
      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('handles network error on mount', async () => {
      // Arrange: Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Act: Mount component
      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      // Assert: Handles error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })
  })

  describe('logout', () => {
    it('clears session even when logout API fails', async () => {
      // Arrange: Setup authenticated state with failing logout
      const user = userEvent.setup()
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          }),
        })
        .mockRejectedValueOnce(new Error('Network error'))

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Act: Logout with network error
      await user.click(screen.getByText('Logout'))

      // Assert: Still clears session locally
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
      expect(mockReplace).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('useAdminAuth hook', () => {
    it('throws error when used outside provider', () => {
      // Arrange: Create component without provider
      function ComponentWithoutProvider() {
        useAdminAuth()
        return <div>Test</div>
      }

      // Act & Assert: Throws error
      expect(() => render(<ComponentWithoutProvider />)).toThrow(
        'useAdminAuth must be used within AdminAuthProvider'
      )
    })
  })
})