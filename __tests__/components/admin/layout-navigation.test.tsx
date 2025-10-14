/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-14
 * @test-focus Navigation structure and active state management
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

describe('AdminLayout - Navigation Structure', () => {
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

  it('renders admin header with correct title and user info', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/moodovermuscle admin/i)).toBeInTheDocument()
      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
      expect(screen.getByText(/emily/i)).toBeInTheDocument()
    })
  })

  it('displays navigation links for all admin sections', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Bookings')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
    })
  })

  it('applies active state styling to current page', async () => {
    // Arrange
    mockPathname.mockReturnValue('/admin/dashboard')

    // Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('border-blue-500', 'text-blue-600')
    })
  })

  it('renders navigation links with proper href attributes', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div>Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const bookingsLink = screen.getByText('Bookings').closest('a')
      const calendarLink = screen.getByText('Calendar').closest('a')

      expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard')
      expect(bookingsLink).toHaveAttribute('href', '/admin/bookings')
      expect(calendarLink).toHaveAttribute('href', '/admin/calendar')
    })
  })

  it('renders main content area with proper structure', async () => {
    // Arrange & Act
    render(
      <AdminLayout>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </AdminLayout>
    )

    // Assert
    await waitFor(() => {
      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
      expect(mainElement).toHaveClass('max-w-7xl', 'mx-auto', 'py-6')
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })
  })
})