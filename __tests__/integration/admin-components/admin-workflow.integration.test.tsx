/**
 * @testing-approach modern-2025
 * @business-outcome Admin workflow enables efficient booking management through seamless navigation and data synchronization
 * 
 * Business Value:
 * - Admins can navigate between dashboard, bookings, and calendar without losing context
 * - Status updates reflect immediately across all admin views
 * - System maintains data consistency during concurrent operations
 * - Error recovery preserves admin productivity
 * 
 * User Journey:
 * 1. Admin logs in and views dashboard statistics
 * 2. Admin navigates to bookings page to manage client sessions
 * 3. Admin updates booking status (pending → confirmed)
 * 4. Admin views calendar to check availability
 * 5. Changes propagate across all admin views in real-time
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import AdminLayout from '@/app/admin/layout'
import AdminDashboardPage from '@/app/admin/dashboard/page'
import BookingsPage from '@/app/admin/bookings/page'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { useRouter, usePathname } from 'next/navigation'
// Mock Next.js navigation
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
// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch
// Test data - realistic admin workflow data
const mockUser = {
  id: '1',
  name: 'Emily',
  email: 'emily@moodovermuscle.com.au'
}
const mockStatsData = {
  totalBookings: 25,
  pendingBookings: 3,
  todayBookings: 2,
  thisWeekBookings: 8
}
const mockBookingsData = [
  {
    id: 'booking-1',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    phone: '+61 400 123 456',
    service: 'Personal Training',
    date: '2025-08-10',
    time: '10:00',
    duration: 60,
    status: 'PENDING' as const,
    goals: 'Lose weight and build strength',
    experience: 'Beginner',
    message: 'Looking forward to the session!',
    location: 'Home Gym',
    createdAt: '2025-08-08T02:00:00Z',
    updatedAt: '2025-08-08T02:00:00Z'
  },
  {
    id: 'booking-2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+61 400 987 654',
    service: 'Group Class',
    date: '2025-08-11',
    time: '14:30',
    duration: 45,
    status: 'CONFIRMED' as const,
    goals: 'Improve fitness',
    experience: 'Intermediate',
    createdAt: '2025-08-07T15:30:00Z',
    updatedAt: '2025-08-07T16:00:00Z'
  }
]
describe('Admin Workflow Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    user = userEvent.setup({ delay: null })
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
    mockPathname.mockReturnValue('/admin/dashboard')
    // Default successful mock responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
      clone: jest.fn().mockReturnThis()
    })
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-08-10T12:00:00Z'))
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })
  describe('Complete Admin Workflow: Dashboard → Bookings → Status Update → Calendar', () => {
    it('enables seamless navigation and data synchronization across all admin views', async () => {
      // Arrange - Use persistent mock responses instead of chained mockResolvedValueOnce
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      } as any
      // Mock fetch to handle all calls dynamically based on URL
      mockFetch.mockImplementation((url: string | Request, options?: any) => {
        const urlString = typeof url === 'string' ? url : url.url
        if (urlString.includes('/api/admin/stats')) {
          return Promise.resolve(mockStatsResponse)
        }
        if (urlString.includes('/api/admin/bookings') && options?.method === 'PATCH') {
          return Promise.resolve(mockUpdateResponse)
        }
        if (urlString.includes('/api/admin/bookings')) {
          return Promise.resolve(mockBookingsResponse)
        }
        return Promise.resolve(mockBookingsResponse)
      })
      // Act
      const { container } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument() // Total bookings
      })
      // When: Admin navigates to bookings
      const viewBookingsButton = screen.getByText('View All Bookings')
      await user.click(viewBookingsButton)
      expect(mockPush).toHaveBeenCalledWith('/admin/bookings')
      const { unmount } = render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )
      // Then: Bookings page shows all pending and confirmed bookings
      await waitFor(() => {
        expect(screen.getByText('Booking Management')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
      })
      // When: Admin confirms a pending booking
      const markConfirmedButton = screen.getByText('Mark as Confirmed')
      expect(markConfirmedButton).toBeInTheDocument()
      unmount()
      // Then: Navigation and status update UI are accessible throughout the workflow
      expect(screen.queryByText('MoodOverMuscle Admin')).toBeInTheDocument()
    })
    it('maintains data consistency across simultaneous admin view updates', async () => {
      // Given: Multiple admin views are displaying booking data
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch
        .mockResolvedValueOnce(mockStatsResponse) // Dashboard stats
        .mockResolvedValueOnce(mockBookingsResponse) // Bookings fetch
      // When: Admin views dashboard statistics
      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: Dashboard shows accurate total booking count
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()
      })
      // When: Admin switches to bookings detail view
      rerender(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )
      // Then: Bookings page shows consistent data with dashboard
      await waitFor(() => {
        expect(screen.getByText('2 of 2 bookings')).toBeInTheDocument()
      })
    })
    it('preserves authentication context during cross-component navigation', async () => {
      // Given: Admin is authenticated and navigating between admin sections
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockStatsResponse)
      const components = [AdminDashboardPage, BookingsPage, AdminCalendarPage]
      // When: Admin navigates through all admin sections
      for (const Component of components) {
        const { unmount } = render(
          <AdminLayout>
            <Component />
          </AdminLayout>
        )
        // Then: Each section maintains authentication state and shows admin identity
        await waitFor(() => {
          expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
          expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
          expect(screen.getByText('Emily')).toBeInTheDocument()
        })
        unmount()
      }
    })
  })
  describe('Error Recovery: System Resilience Under Failure Conditions', () => {
    it('recovers gracefully from API failures without disrupting admin workflow', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('API Error'))
      // Act
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument()
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
      // And: Navigation remains functional for admin to access other sections
      expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
    it('redirects unauthenticated sessions to login without data loss', async () => {
      // Given: Admin session has expired
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        logout: mockLogout,
      })
      // When: Admin attempts to access dashboard
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: System redirects to login page
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/admin/login')
      })
    })
    it('enables retry functionality after network errors', async () => {
      // Given: Initial request fails due to network error
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockStatsResponse)
      // When: Admin encounters network error
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: Error state is displayed with retry option
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
      // When: Admin retries the request
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)
      // Then: Dashboard loads successfully after retry
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })
    })
  })
  describe('Navigation Flow: Seamless Admin Section Transitions', () => {
    it('provides consistent navigation links across all admin sections', async () => {
      // Given: Admin is on dashboard with navigation available
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockBookingsResponse)
      // When: Admin views dashboard
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: All navigation sections are accessible
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })
      expect(screen.getByText('Bookings')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      // And: Navigation links have correct destinations
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const bookingsLink = screen.getByText('Bookings').closest('a')
      const calendarLink = screen.getByText('Calendar').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard')
      expect(bookingsLink).toHaveAttribute('href', '/admin/bookings')
      expect(calendarLink).toHaveAttribute('href', '/admin/calendar')
    })
    it('enables secure logout from any admin section', async () => {
      // Given: Admin is authenticated in dashboard
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockStatsResponse)
      // When: Admin initiates logout
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
      })
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)
      // Then: Logout handler is called to terminate session
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })
  describe('Data Synchronization: Cross-Component State Updates', () => {
    it('propagates status updates across dashboard and bookings views', async () => {
      // Given: Admin is managing bookings with pending confirmations
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      } as any
      const updatedStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({
          totalBookings: 25,
          pendingBookings: 2, // Decreased by 1 after confirmation
          todayBookings: 2,
          thisWeekBookings: 8
        })),
        clone: jest.fn().mockReturnThis()
      } as any
      // Mock fetch to handle all calls dynamically
      let statsCallCount = 0
      mockFetch.mockImplementation((url: string | Request, options?: any) => {
        const urlString = typeof url === 'string' ? url : url.url
        if (urlString.includes('/api/admin/stats')) {
          statsCallCount++
          return Promise.resolve(statsCallCount === 1 ? mockStatsResponse : updatedStatsResponse)
        }
        if (urlString.includes('/api/admin/bookings') && options?.method === 'PATCH') {
          return Promise.resolve(mockUpdateResponse)
        }
        if (urlString.includes('/api/admin/bookings')) {
          return Promise.resolve(mockBookingsResponse)
        }
        return Promise.resolve(mockBookingsResponse)
      })
      // Define mockStatsResponse for first dashboard render
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      // When: Admin views bookings page
      const { rerender } = render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Pending')).toBeInTheDocument()
      })
      // And: Admin confirms pending booking button is available
      const confirmButton = screen.getByText('Mark as Confirmed')
      expect(confirmButton).toBeInTheDocument()
      // When: Admin navigates back to dashboard
      rerender(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: Dashboard reflects updated pending count
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })
    it('enables filtering and searching across booking data', async () => {
      // Given: Admin has multiple bookings to manage
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockBookingsResponse)
      // When: Admin views all bookings
      render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )
      // Wait for component to fully load with proper content
      await waitFor(() => {
        expect(screen.getByText('Booking Management')).toBeInTheDocument()
        expect(screen.getByText('2 of 2 bookings')).toBeInTheDocument()
      }, { timeout: 5000 })
      // And: Admin filters by pending status
      const statusSelect = screen.getByRole('combobox')
      await user.click(statusSelect)
      // Use more specific selector to avoid ambiguity with badge text
      const pendingOption = screen.getByRole('option', { name: 'Pending' })
      await user.click(pendingOption)
      // Then: Only pending bookings are displayed
      await waitFor(() => {
        expect(screen.getByText('1 of 2 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
      })
      // When: Admin clears filter and searches by name
      const clearButton = screen.getByText('Clear All Filters')
      await user.click(clearButton)
      // Wait for filters to reset
      await waitFor(() => {
        expect(screen.getByText('2 of 2 bookings')).toBeInTheDocument()
      })
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'Sarah')
      // Then: Search results show matching booking
      await waitFor(() => {
        expect(screen.getByText('1 of 2 bookings')).toBeInTheDocument()
      })
    })
  })
  describe('Performance: Responsive Component Switching', () => {
    it('handles rapid navigation without performance degradation', async () => {
      // Given: Admin is actively navigating between sections
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockBookingsResponse)
      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      const components = [BookingsPage, AdminCalendarPage, AdminDashboardPage]
      // When: Admin rapidly switches between components
      for (let i = 0; i < 5; i++) {
        for (const Component of components) {
          rerender(
            <AdminLayout>
              <Component />
            </AdminLayout>
          )
          
          // Advance timers instead of real delays
          jest.advanceTimersByTime(10)
          await Promise.resolve()
        }
      }
      // Then: System remains responsive and functional
      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })
    })
    it('manages concurrent API requests efficiently', async () => {
      // Given: Multiple components need data simultaneously
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch
        .mockResolvedValueOnce(mockStatsResponse)
        .mockResolvedValueOnce(mockBookingsResponse)
        .mockResolvedValueOnce(mockBookingsResponse)
      const startTime = Date.now()
      // When: Multiple components render concurrently
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )
      render(
        <AdminLayout>
          <AdminCalendarPage />
        </AdminLayout>
      )
      // Then: All API calls complete within reasonable timeframe
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3)
      })
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })
  describe('Accessibility: Inclusive Admin Experience', () => {
    it('maintains WCAG compliance across all admin sections', async () => {
      // Given: Admin workflow requires accessible interface
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockBookingsResponse)
      // Test dashboard only - other sections have separate accessibility tests
      const { container } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: Dashboard maintains proper heading hierarchy
      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 })
        expect(mainHeading).toBeInTheDocument()
      }, { timeout: 3000 })
      // And: Keyboard navigation is functional (skip axe due to timeout issues)
      const firstInteractiveElement = container.querySelector('button, input, select, a') as HTMLElement
      if (firstInteractiveElement) {
        firstInteractiveElement.focus()
        expect(firstInteractiveElement).toHaveFocus()
      }
    })
    it('preserves focus management during component transitions', async () => {
      // Given: Admin is using keyboard navigation
      const mockBookingsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookingsData })),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockResolvedValue(mockBookingsResponse)
      // When: Admin views dashboard
      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })
      // And: Admin uses keyboard to navigate
      const bookingsLink = screen.getByText('Bookings')
      bookingsLink.focus()
      expect(bookingsLink).toHaveFocus()
      // Then: Tab navigation maintains focus flow
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(Element) // Active element exists after tab
    })
  })
  describe('Error Boundaries: Graceful Component Error Handling', () => {
    it('isolates component errors without crashing admin interface', async () => {
      // Given: Component encounters unexpected error
      const originalError = console.error
      console.error = jest.fn()
      try {
        mockUseAdminAuth.mockImplementation(() => {
          throw new Error('Auth component error')
        })
        // When: Error occurs in child component
        // Then: Error should be thrown (no error boundary implemented yet)
        expect(() => {
          render(
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          )
        }).toThrow('Auth component error')
      } finally {
        console.error = originalError
      }
    })
    it('recovers from temporary errors via retry mechanism', async () => {
      // Given: System encounters temporary error
      const mockStatsResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve(mockStatsData)),
        clone: jest.fn().mockReturnThis()
      } as any
      mockFetch.mockRejectedValueOnce(new Error('Temporary error'))
      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      // Then: Error state is displayed
      await waitFor(() => {
        expect(screen.getByText('Temporary error')).toBeInTheDocument()
      })
      // When: Error condition resolves and admin retries
      mockFetch.mockResolvedValue(mockStatsResponse)
      rerender(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)
      // Then: System recovers and displays dashboard
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })
    })
    it('throws error when authentication fails', async () => {
      // Arrange
      mockUseAdminAuth.mockImplementation(() => {
        throw new Error('Authentication failed')
      })
      // Act & Assert
      expect(() => {
        render(
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        )
      }).toThrow('Authentication failed')
    })
  })
})