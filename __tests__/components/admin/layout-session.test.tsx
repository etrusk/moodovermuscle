/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Session management and logout functionality
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('AdminLayout - Session Management', () => {
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

  it('renders logout button with proper accessibility', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      expect(logoutButton).toBeInTheDocument()
      expect(logoutButton).toHaveAccessibleName()
    })
  })

  it('calls logout function when logout button is clicked', async () => {
    // Arrange
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      expect(logoutButton).toBeInTheDocument()
    })

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('handles logout process without state violations', async () => {
    // Arrange
    const { consoleErrors, originalConsoleError } = setupViolationDetection()

    try {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
      })

      // Act
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      // Assert
      expect(mockLogout).toHaveBeenCalled()
      expect(consoleErrors).toHaveLength(0)
    } finally {
      console.error = originalConsoleError
    }
  })

  it('displays user information correctly', async () => {
    // Arrange
    const customUser = {
      id: '2',
      name: 'Test Admin',
      email: 'admin@test.com'
    }

    mockUseAdminAuth.mockReturnValue({
      user: customUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      refreshSession: vi.fn(),
    })

    // Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
      expect(screen.getByText('Test Admin')).toBeInTheDocument()
    })
  })
})