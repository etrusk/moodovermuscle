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
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/setup/server'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Test component to access context
function TestComponent() {
  const { isAuthenticated, isLoading, logout, user } = useAdminAuth()

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user-data">{user ? user.email : 'no-user'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

// Test component with login functionality
function TestComponentWithLogin() {
  const { isAuthenticated, isLoading, login, user } = useAdminAuth()
  const [error, setError] = React.useState<string | undefined>()

  const handleLogin = async () => {
    const result = await login('emily@moodovermuscle.com.au', 'Emily2025!')
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user-data">{user ? user.email : 'no-user'}</div>
      {error && <div data-testid="error-message">{error}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

// Test component with refresh functionality
function TestComponentWithRefresh() {
  const { isAuthenticated, refreshSession } = useAdminAuth()

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <button onClick={refreshSession}>Refresh</button>
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
    
    // Reset MSW handlers
    server.resetHandlers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AdminAuthProvider initialization', () => {
    it('renders children with initial loading state', () => {
      // Arrange: Setup MSW to delay indefinitely
      server.use(
        http.get('/api/admin/session', () => {
          return new Promise(() => {})
        })
      )

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
      // Arrange: Setup MSW for unauthorized response
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        })
      )

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
      // Arrange: Setup MSW for network error
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.error()
        })
      )

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

    it('successfully loads valid session on mount', async () => {
      // Arrange: Setup MSW for valid session
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          })
        })
      )

      // Act: Mount component
      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      // Assert: Loads authenticated session
      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user-data')).toHaveTextContent('emily@moodovermuscle.com.au')
    })
  })

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      // Arrange: Setup MSW for initial unauthenticated state and successful login
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => HttpResponse.json({}, { status: 401 }), { once: true }),
        http.post('/api/admin/login', () => {
          return HttpResponse.json({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          })
        })
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithLogin />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })

      // Act: Perform login
      await user.click(screen.getByText('Login'))

      // Assert: Session updated with authenticated user
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })
      expect(screen.getByTestId('user-data')).toHaveTextContent('emily@moodovermuscle.com.au')
    })

    it('handles invalid credentials', async () => {
      // Arrange: Setup MSW for failed login response
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => HttpResponse.json({}, { status: 401 }), { once: true }),
        http.post('/api/admin/login', () => {
          return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        })
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithLogin />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })

      // Act: Attempt login with invalid credentials
      await user.click(screen.getByText('Login'))

      // Assert: Stays unauthenticated with error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials')
      })
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('handles network error during login', async () => {
      // Arrange: Setup MSW for network error during login
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => HttpResponse.json({}, { status: 401 }), { once: true }),
        http.post('/api/admin/login', () => HttpResponse.error())
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithLogin />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })

      // Act: Attempt login with network failure
      await user.click(screen.getByText('Login'))

      // Assert: Shows network error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network error. Please try again.')
      })
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('handles login response without error property', async () => {
      // Arrange: Setup MSW for failed login without error message
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => HttpResponse.json({}, { status: 401 }), { once: true }),
        http.post('/api/admin/login', () => HttpResponse.json({}, { status: 401 }))
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithLogin />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading')
      })

      // Act: Attempt login
      await user.click(screen.getByText('Login'))

      // Assert: Shows default error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Login failed')
      })
    })
  })

  describe('logout', () => {
    it('successfully logs out and navigates to login page', async () => {
      // Arrange: Setup MSW for authenticated state with successful logout
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          })
        }, { once: true }),
        http.delete('/api/admin/session', () => HttpResponse.json({}))
      )

      render(
        <AdminAuthProvider>
          <TestComponent />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Act: Logout
      await user.click(screen.getByText('Logout'))

      // Assert: Clears session and navigates
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
      expect(screen.getByTestId('user-data')).toHaveTextContent('no-user')
      expect(mockReplace).toHaveBeenCalledWith('/admin/login')
    })

    it('clears session even when logout API fails', async () => {
      // Arrange: Setup MSW for authenticated state with failing logout
      const user = userEvent.setup()
      server.use(
        http.get('/api/admin/session', () => {
          return HttpResponse.json({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          })
        }, { once: true }),
        http.delete('/api/admin/session', () => HttpResponse.error())
      )

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

  describe('refreshSession', () => {
    it('successfully refreshes valid session', async () => {
      // Arrange: Setup MSW for initial unauthenticated state then successful refresh
      const user = userEvent.setup()
      let callCount = 0
      server.use(
        http.get('/api/admin/session', () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json({}, { status: 401 })
          }
          return HttpResponse.json({
            user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
          })
        })
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithRefresh />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })

      // Act: Refresh session
      await user.click(screen.getByText('Refresh'))

      // Assert: Session updated to authenticated
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })
    })

    it('handles refresh session failure', async () => {
      // Arrange: Setup MSW for authenticated state with failing refresh
      const user = userEvent.setup()
      let callCount = 0
      server.use(
        http.get('/api/admin/session', () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json({
              user: { id: 'emily-admin-1', email: 'emily@moodovermuscle.com.au', name: 'Emily' },
            })
          }
          return HttpResponse.json({ error: 'Session expired' }, { status: 401 })
        })
      )

      render(
        <AdminAuthProvider>
          <TestComponentWithRefresh />
        </AdminAuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Act: Refresh session with expired token
      await user.click(screen.getByText('Refresh'))

      // Assert: Session becomes unauthenticated
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
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