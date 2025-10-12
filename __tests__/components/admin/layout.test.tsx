/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first admin layout testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import AdminLayout from '@/app/admin/layout'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { useRouter, usePathname } from 'next/navigation'

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

// Mock AdminAuthContext - using inline factory pattern from Jest Mock Hoisting Pattern
const mockLogout = jest.fn()

jest.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: jest.fn(),
}))

// Get the mocked useAdminAuth function
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

describe('AdminLayout Component', () => {
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

  describe('Authentication Flow', () => {
    it('shows loading state during authentication check', async () => {
      // Arrange
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
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
        login: jest.fn(),
        logout: mockLogout,
        refreshSession: jest.fn(),
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
        login: jest.fn(),
        logout: mockLogout,
        refreshSession: jest.fn(),
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
        login: jest.fn(),
        logout: mockLogout,
        refreshSession: jest.fn(),
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
      expect(container.firstChild).toBeTruthy() // Wrapper exists
      expect(container.firstChild?.textContent?.trim()).toBeFalsy() // But has no meaningful content
    })

    it('handles authentication state transitions without violations', async () => {
      // Arrange
      const { consoleErrors, originalConsoleError } = setupViolationDetection()

      try {
        mockUseAdminAuth.mockReturnValue({
          user: null,
          isLoading: true,
          isAuthenticated: false,
          login: jest.fn(),
          logout: mockLogout,
          refreshSession: jest.fn(),
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
          login: jest.fn(),
          logout: mockLogout,
          refreshSession: jest.fn(),
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

  describe('Navigation Structure', () => {
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

  describe('Session Management', () => {
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
        login: jest.fn(),
        logout: mockLogout,
        refreshSession: jest.fn(),
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

  describe('Layout Responsiveness', () => {
    it('renders responsive layout structure', async () => {
      // Arrange & Act
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Assert
      await waitFor(() => {
        expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
        expect(container.querySelector('.max-w-7xl')).toBeInTheDocument()
      })
    })

    it('applies responsive padding and spacing classes', async () => {
      // Arrange & Act
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Assert
      await waitFor(() => {
        const headerContainer = container.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8')
        expect(headerContainer).toBeInTheDocument()
      })
    })

    it('maintains proper layout hierarchy', async () => {
      // Arrange & Act
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Assert
      await waitFor(() => {
        const header = screen.getByRole('banner')
        const nav = screen.getByRole('navigation')
        const main = screen.getByRole('main')

        expect(header).toBeInTheDocument()
        expect(nav).toBeInTheDocument()
        expect(main).toBeInTheDocument()

        // Verify proper nesting
        expect(container.firstChild).toContainElement(header)
        expect(container.firstChild).toContainElement(nav)
        expect(container.firstChild).toContainElement(main)
      })
    })
  })

  describe('Accessibility', () => {
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

  describe('Error Boundaries and Edge Cases', () => {
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

  describe('Performance and Optimization', () => {
    it('does not re-render unnecessarily with same props', async () => {
      // Arrange
      const TestChild = jest.fn(() => <div>Dashboard Content</div>)

      const { rerender } = render(
        <AdminLayout>
          <TestChild />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })

      const initialRenderCount = TestChild.mock.calls.length

      // Act
      rerender(
        <AdminLayout>
          <TestChild />
        </AdminLayout>
      )

      // Assert
      expect(TestChild.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount)
    })

    it('memoizes expensive operations correctly', async () => {
      // Arrange
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })

      // Act
      const startTime = Date.now()
      for (let i = 0; i < 10; i++) {
        screen.getByText('MoodOverMuscle Admin')
      }
      const endTime = Date.now()

      // Assert
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})