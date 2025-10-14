/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Authentication flow and state transitions
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import AdminLayout from '@/app/admin/layout'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'

// Mock Next.js navigation hooks
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname(),
}))

// Mock AdminAuthContext
const mockLogout = vi.fn()

vi.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: vi.fn(),
}))

const mockUseAdminAuth = useAdminAuth as vi.MockedFunction<typeof useAdminAuth>

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

  console.error = vi.fn((...args: unknown[]) => {
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

describe('AdminLayout - Authentication Flow', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()

    // Default authenticated state
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })

    // Default to dashboard path
    mockPathname.mockReturnValue('/admin/dashboard')
  })

  afterEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

  it('shows loading state during authentication check', async () => {
    // Arrange
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })

    // Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    expect(screen.getByText(/loading admin dashboard/i)).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('redirects to login when not authenticated and not on login page', async () => {
    // Arrange
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })
    mockPathname.mockReturnValue('/admin/dashboard')

    // Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('allows login page to render without authentication', () => {
    // Arrange
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })
    mockPathname.mockReturnValue('/admin/login')

    // Act
    const { container } = render(
      <AdminLayout>
        <div>Login Form</div>
      </AdminLayout>
    )

    // Assert
    expect(screen.getByText('Login Form')).toBeInTheDocument()
    expect(container.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()
  })

  it('does not render content when not authenticated and not loading', async () => {
    // Arrange
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })
    mockPathname.mockReturnValue('/admin/dashboard')

    // Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/login')
    })

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
    expect(container.firstChild).toBeInstanceOf(HTMLElement)
    expect(container.firstChild?.textContent?.trim()).toBe('')
  })

  it('handles authentication state transitions without violations', async () => {
    // Arrange
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: vi.fn(),
        logout: mockLogout,
        refreshSession: vi.fn(),
      })

      const { rerender } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument()

      // Act
      mockUseAdminAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        logout: mockLogout,
        refreshSession: vi.fn(),
      })

      rerender(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })

      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })
})