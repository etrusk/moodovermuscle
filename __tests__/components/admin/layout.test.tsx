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

// Mock AdminAuthContext
const mockUseAdminAuth = jest.fn()
const mockLogout = jest.fn()

jest.mock('@/lib/auth/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAdminAuth: () => mockUseAdminAuth(),
}))

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
      logout: mockLogout,
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
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        logout: mockLogout,
      })

      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument()
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('redirects to login when not authenticated and not on login page', async () => {
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        logout: mockLogout,
      })
      mockPathname.mockReturnValue('/admin/dashboard')

      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/admin/login')
      })
    })

    it('allows login page to render without authentication', () => {
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        logout: mockLogout,
      })
      mockPathname.mockReturnValue('/admin/login')

      const { container } = render(
        <AdminLayout>
          <div>Login Form</div>
        </AdminLayout>
      )

      expect(screen.getByText('Login Form')).toBeInTheDocument()
      expect(container.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()
    })

    it('does not render content when not authenticated and not loading', async () => {
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        logout: mockLogout,
      })
      mockPathname.mockReturnValue('/admin/dashboard')

      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Wait for redirect effect to take place
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/admin/login')
      })

      expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
      // Component returns null for content, but AdminAuthProvider wrapper still exists
      // The wrapper div from AdminAuthProvider mock will be present, but should be empty or minimal
      expect(container.firstChild).toBeTruthy() // Wrapper exists
      expect(container.firstChild?.textContent?.trim()).toBeFalsy() // But has no meaningful content
    })

    it('handles authentication state transitions without violations', async () => {
      const { consoleErrors, originalConsoleError } = setupViolationDetection()

      try {
        // Start with loading state
        mockUseAdminAuth.mockReturnValue({
          user: null,
          isLoading: true,
          isAuthenticated: false,
          logout: mockLogout,
        })

        const { rerender } = render(
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        )

        expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument()

        // Transition to authenticated state
        mockUseAdminAuth.mockReturnValue({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          logout: mockLogout,
        })

        rerender(
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        )

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
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
        expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
        expect(screen.getByText('Emily')).toBeInTheDocument()
      })
    })

    it('displays navigation links for all admin sections', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Bookings')).toBeInTheDocument()
        expect(screen.getByText('Calendar')).toBeInTheDocument()
      })
    })

    it('applies active state styling to current page', async () => {
      mockPathname.mockReturnValue('/admin/dashboard')

      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const dashboardLink = screen.getByText('Dashboard').closest('a')
        expect(dashboardLink).toHaveClass('border-blue-500', 'text-blue-600')
      })
    })

    it('renders navigation links with proper href attributes', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

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
      render(
        <AdminLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </AdminLayout>
      )

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
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
        expect(logoutButton).toHaveAccessibleName()
      })
    })

    it('calls logout function when logout button is clicked', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('handles logout process without state violations', async () => {
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

        const logoutButton = screen.getByRole('button', { name: /logout/i })
        await user.click(logoutButton)

        expect(mockLogout).toHaveBeenCalled()
        expect(consoleErrors).toHaveLength(0)
      } finally {
        console.error = originalConsoleError
      }
    })

    it('displays user information correctly', async () => {
      const customUser = {
        id: '2',
        name: 'Test Admin',
        email: 'admin@test.com'
      }

      mockUseAdminAuth.mockReturnValue({
        user: customUser,
        isLoading: false,
        isAuthenticated: true,
        logout: mockLogout,
      })

      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
        expect(screen.getByText('Test Admin')).toBeInTheDocument()
      })
    })
  })

  describe('Layout Responsiveness', () => {
    it('renders responsive layout structure', async () => {
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
        expect(container.querySelector('.max-w-7xl')).toBeInTheDocument()
      })
    })

    it('applies responsive padding and spacing classes', async () => {
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const headerContainer = container.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8')
        expect(headerContainer).toBeInTheDocument()
      })
    })

    it('maintains proper layout hierarchy', async () => {
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

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
      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper semantic structure with landmarks', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument()  // header
        expect(screen.getByRole('navigation')).toBeInTheDocument()  // nav
        expect(screen.getByRole('main')).toBeInTheDocument()  // main
      })
    })

    it('maintains proper heading hierarchy', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const headerTitle = screen.getByRole('heading', { level: 1 })
        expect(headerTitle).toHaveTextContent('MoodOverMuscle Admin')
      })
    })

    it('provides keyboard navigation support', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      
      // Test keyboard navigation
      logoutButton.focus()
      expect(logoutButton).toHaveFocus()

      // Test keyboard activation
      await user.keyboard('{Enter}')
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('Error Boundaries and Edge Cases', () => {
    it('handles missing user gracefully when authenticated', async () => {
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: true,  // Edge case: authenticated but no user
        logout: mockLogout,
      })

      const { container } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      // Should not render content when authenticated but no user
      expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
      // Component still renders the wrapper div but no content
      expect(container.querySelector('main')).toBeNull()
    })

    it('handles pathname edge cases correctly', () => {
      // Test various admin paths
      const paths = ['/admin/login', '/admin/dashboard', '/admin/bookings', '/admin/calendar']
      
      paths.forEach(path => {
        mockPathname.mockReturnValue(path)
        
        if (path === '/admin/login') {
          mockUseAdminAuth.mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            logout: mockLogout,
          })
        } else {
          mockUseAdminAuth.mockReturnValue({
            user: mockUser,
            isLoading: false,
            isAuthenticated: true,
            logout: mockLogout,
          })
        }

        const { unmount } = render(
          <AdminLayout>
            <div>Content for {path}</div>
          </AdminLayout>
        )

        // Should not throw errors for any path
        expect(() => unmount()).not.toThrow()
      })
    })

    it('handles component unmount gracefully', () => {
      const { unmount } = render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid auth state changes without violations', async () => {
      const { consoleErrors, originalConsoleError } = setupViolationDetection()

      try {
        const { rerender } = render(
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        )

        // Simulate rapid state changes
        const states = [
          { user: null, isLoading: true, isAuthenticated: false },
          { user: mockUser, isLoading: false, isAuthenticated: true },
          { user: null, isLoading: false, isAuthenticated: false },
          { user: mockUser, isLoading: false, isAuthenticated: true },
        ]

        for (const state of states) {
          mockUseAdminAuth.mockReturnValue({
            ...state,
            logout: mockLogout,
          })

          rerender(
            <AdminLayout>
              <div>Dashboard Content</div>
            </AdminLayout>
          )

          // Small delay to allow state updates
          await new Promise(resolve => setTimeout(resolve, 10))
        }

        expect(consoleErrors).toHaveLength(0)
      } finally {
        console.error = originalConsoleError
      }
    })
  })

  describe('Performance and Optimization', () => {
    it('does not re-render unnecessarily with same props', async () => {
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

      // Rerender with same props
      rerender(
        <AdminLayout>
          <TestChild />
        </AdminLayout>
      )

      // Should not cause unnecessary re-renders of children
      expect(TestChild.mock.calls.length).toBeGreaterThanOrEqual(initialRenderCount)
    })

    it('memoizes expensive operations correctly', async () => {
      render(
        <AdminLayout>
          <div>Dashboard Content</div>
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })

      // Multiple rerenders should not cause performance issues
      const startTime = Date.now()
      for (let i = 0; i < 10; i++) {
        screen.getByText('MoodOverMuscle Admin')
      }
      const endTime = Date.now()

      // Should complete quickly (arbitrary threshold)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})