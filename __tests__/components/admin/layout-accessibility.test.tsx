/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Accessibility compliance and semantic structure
 */
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
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

describe('AdminLayout - Accessibility', () => {
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

  it('has no accessibility violations', async () => {
    // Arrange & Act
    const { container } = render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
    })

    // Assert
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('provides proper semantic structure with landmarks', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument()  // header
      expect(screen.getByRole('navigation')).toBeInTheDocument()  // nav
      expect(screen.getByRole('main')).toBeInTheDocument()  // main
    })
  })

  it('maintains proper heading hierarchy', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const headerTitle = screen.getByRole('heading', { level: 1 })
      expect(headerTitle).toHaveTextContent('MoodOverMuscle Admin')
    })
  })

  it('provides keyboard navigation support', async () => {
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
    logoutButton.focus()
    await user.keyboard('{Enter}')

    // Assert
    expect(logoutButton).toHaveFocus()
    expect(mockLogout).toHaveBeenCalled()
  })
})