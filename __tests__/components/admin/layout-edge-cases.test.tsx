/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Error boundaries, edge cases, and state transitions
 */
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLayout from '@/app/admin/layout'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'

// Mock Next.js navigation hooks
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname(),
}))

// Mock AdminAuthContext
const mockLogout = jest.fn()

jest.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: jest.fn(),
}))

const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>

// Test data constants
const mockUser = {
  id: '1',
  name: 'Emily',
  email: 'emily@moodovermuscle.com.au'
}

// Helper function to setup violation detection
const setupViolationDetection = () => {
  const consoleErrors: string[] = []
  const originalConsoleError = console.error

  console.error = jest.fn((...args: unknown[]) => {
    const message = args.join(' ')
    consoleErrors.push(message)

    if (
      message.includes('Cannot update a component') ||
      message.includes('setState') ||
      message.includes('while rendering')
    ) {
      throw new Error(`React setState-during-render violation: ${message}`)
    }

    originalConsoleError(...args)
  })

  return { consoleErrors, originalConsoleError }
}

describe('AdminLayout - Error Boundaries and Edge Cases', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()

    // Default authenticated state
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockLogout,
      refreshSession: jest.fn(),
    })

    // Default to dashboard path
    mockPathname.mockReturnValue('/admin/dashboard')
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('handles missing user gracefully when authenticated', async () => {
    // Arrange
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: true,  // Edge case: authenticated but no user
      login: jest.fn(),
      logout: mockLogout,
      refreshSession: jest.fn(),
    })

    // Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
    expect(container.querySelector('main')).toBeNull()
  })

  it('handles pathname edge cases correctly', () => {
    // Arrange
    const paths = ['/admin/login', '/admin/dashboard', '/admin/bookings', '/admin/calendar']
    
    paths.forEach(path => {
      mockPathname.mockReturnValue(path)
      
      if (path === '/admin/login') {
        mockUseAdminAuth.mockReturnValue({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          login: jest.fn(),
          logout: mockLogout,
          refreshSession: jest.fn(),
        })
      } else {
        mockUseAdminAuth.mockReturnValue({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          login: jest.fn(),
          logout: mockLogout,
          refreshSession: jest.fn(),
        })
      }

      // Act
      const { unmount } = render(
        <AdminLayout>
          <div>Content for {path}</div>
        </AdminLayout>
      )

      // Assert
      expect(() => unmount()).not.toThrow()
    })
  })

  it('handles component unmount gracefully', () => {
    // Arrange & Act
    const { unmount } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    expect(() => unmount()).not.toThrow()
  })

  it('handles rapid auth state changes without violations', async () => {
    // Arrange
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      const { rerender } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      const states = [
        { user: null, isLoading: true, isAuthenticated: false },
        { user: mockUser, isLoading: false, isAuthenticated: true },
        { user: null, isLoading: false, isAuthenticated: false },
        { user: mockUser, isLoading: false, isAuthenticated: true },
      ]

      // Act
      for (const state of states) {
        mockUseAdminAuth.mockReturnValue({
          ...state,
          login: jest.fn(),
          logout: mockLogout,
          refreshSession: jest.fn(),
        })

        rerender(
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        )

        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Assert
      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })
})