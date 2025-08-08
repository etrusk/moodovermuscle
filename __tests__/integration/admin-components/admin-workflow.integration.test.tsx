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

// Test data constants
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

describe('Admin Components Integration Tests', () => {
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

    // Mock current date
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-08-10T12:00:00Z'))
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('Complete Admin Workflow Integration', () => {
    it('supports full workflow: Dashboard → Bookings → Calendar → Status Updates', async () => {
      // Setup API responses
      mockFetch
        .mockResolvedValueOnce(mockStatsResponse) // Dashboard stats
        .mockResolvedValueOnce(mockBookingsResponse) // Bookings fetch
        .mockResolvedValueOnce(mockBookingsResponse) // Calendar fetch
        .mockResolvedValueOnce(mockUpdateResponse) // Status update
        .mockResolvedValueOnce(mockBookingsResponse) // Refresh after update

      const { container } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      // 1. Dashboard loads successfully
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument() // Total bookings
      })

      // 2. Navigate to bookings via quick action
      const viewBookingsButton = screen.getByText('View All Bookings')
      await user.click(viewBookingsButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/bookings')

      // Simulate navigation to bookings page
      const { unmount } = render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )

      // 3. Bookings page loads with data
      await waitFor(() => {
        expect(screen.getByText('Booking Management')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
      })

      // 4. Update booking status
      const markConfirmedButton = screen.getByText('Mark as Confirmed')
      await user.click(markConfirmedButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/bookings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: 'booking-1',
            status: 'CONFIRMED',
          }),
        })
      })

      unmount()

      // 5. Navigate to calendar
      render(
        <AdminLayout>
          <AdminCalendarPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('handles cross-component data consistency', async () => {
      // Both dashboard and bookings should show consistent data
      mockFetch
        .mockResolvedValueOnce(mockStatsResponse) // Dashboard stats
        .mockResolvedValueOnce(mockBookingsResponse) // Bookings fetch

      // 1. Load dashboard
      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument() // Total bookings from stats
      })

      // 2. Switch to bookings - should show consistent count
      rerender(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('2 of 2 bookings')).toBeInTheDocument() // Actual bookings data
      })
    })

    it('maintains authentication state across components', async () => {
      mockFetch.mockResolvedValue(mockStatsResponse)

      const components = [AdminDashboardPage, BookingsPage, AdminCalendarPage]

      // Test each component maintains authentication
      for (const Component of components) {
        const { unmount } = render(
          <AdminLayout>
            <Component />
          </AdminLayout>
        )

        await waitFor(() => {
          expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
          expect(screen.getByText(/Welcome,/)).toBeInTheDocument()
          expect(screen.getByText('Emily')).toBeInTheDocument()
        })

        unmount()
      }
    })
  })

  describe('Error Handling Integration', () => {
    it('handles API failures gracefully across components', async () => {
      // Dashboard API failure
      mockFetch.mockRejectedValue(new Error('API Error'))

      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument()
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })

      // Error UI should still allow navigation
      expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('handles authentication failures across components', async () => {
      // Simulate authentication failure
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        logout: mockLogout,
      })

      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      // Should redirect to login
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/admin/login')
      })
    })

    it('handles network errors with retry functionality', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockStatsResponse)

      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      // Error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Retry should work
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    it('supports navigation between admin sections', async () => {
      mockFetch.mockResolvedValue(mockBookingsResponse)

      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })

      // Navigation links should be present and functional
      expect(screen.getByText('Bookings')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()

      // Links should have proper href attributes
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const bookingsLink = screen.getByText('Bookings').closest('a')
      const calendarLink = screen.getByText('Calendar').closest('a')

      expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard')
      expect(bookingsLink).toHaveAttribute('href', '/admin/bookings')
      expect(calendarLink).toHaveAttribute('href', '/admin/calendar')
    })

    it('handles logout across all components', async () => {
      mockFetch.mockResolvedValue(mockStatsResponse)

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

      expect(mockLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Flow Integration', () => {
    it('handles status updates that affect multiple components', async () => {
      // Setup mock responses for status update flow
      mockFetch
        .mockResolvedValueOnce(mockBookingsResponse) // Initial bookings fetch
        .mockResolvedValueOnce(mockUpdateResponse) // Status update
        .mockResolvedValueOnce(mockBookingsResponse) // Bookings refresh
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn(() => Promise.resolve({
            totalBookings: 25,
            pendingBookings: 2, // Decreased by 1 after confirmation
            todayBookings: 2,
            thisWeekBookings: 8
          })),
          clone: jest.fn().mockReturnThis()
        }) // Updated dashboard stats

      // 1. Start with bookings page
      const { rerender } = render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Pending')).toBeInTheDocument()
      })

      // 2. Update booking status
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/bookings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: 'booking-1',
            status: 'CONFIRMED',
          }),
        })
      })

      // 3. Navigate to dashboard - should show updated stats
      rerender(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // Updated pending count
      })
    })

    it('handles filtering and search across components', async () => {
      mockFetch.mockResolvedValue(mockBookingsResponse)

      render(
        <AdminLayout>
          <BookingsPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('2 of 2 bookings')).toBeInTheDocument()
      })

      // Apply status filter
      const statusSelect = screen.getByRole('combobox')
      await user.click(statusSelect)
      await user.click(screen.getByText('Pending'))

      await waitFor(() => {
        expect(screen.getByText('1 of 2 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
      })

      // Search functionality
      const clearButton = screen.getByText('Clear All Filters')
      await user.click(clearButton)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'Sarah')

      await waitFor(() => {
        expect(screen.getByText('1 of 2 bookings')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Integration', () => {
    it('handles rapid component switching without issues', async () => {
      mockFetch.mockResolvedValue(mockBookingsResponse)

      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      const components = [BookingsPage, AdminCalendarPage, AdminDashboardPage]

      // Rapidly switch between components
      for (let i = 0; i < 5; i++) {
        for (const Component of components) {
          rerender(
            <AdminLayout>
              <Component />
            </AdminLayout>
          )
          
          // Small delay to allow rendering
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      // Should still function correctly
      await waitFor(() => {
        expect(screen.getByText('MoodOverMuscle Admin')).toBeInTheDocument()
      })
    })

    it('handles concurrent API calls efficiently', async () => {
      // Setup responses for multiple concurrent calls
      mockFetch
        .mockResolvedValueOnce(mockStatsResponse)
        .mockResolvedValueOnce(mockBookingsResponse)
        .mockResolvedValueOnce(mockBookingsResponse)

      const startTime = Date.now()

      // Render multiple components that make API calls
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

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3)
      })

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(2000) // Should complete within reasonable time
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains accessibility standards across component transitions', async () => {
      mockFetch.mockResolvedValue(mockBookingsResponse)

      const components = [
        { Component: AdminDashboardPage, name: 'Dashboard' },
        { Component: BookingsPage, name: 'Bookings' },
        { Component: AdminCalendarPage, name: 'Calendar' }
      ]

      for (const { Component, name } of components) {
        const { container, unmount } = render(
          <AdminLayout>
            <Component />
          </AdminLayout>
        )

        await waitFor(() => {
          // Each component should maintain proper heading structure
          const mainHeading = screen.getByRole('heading', { level: 1 })
          expect(mainHeading).toBeInTheDocument()
        })

        // Test accessibility
        const results = await axe(container)
        expect(results).toHaveNoViolations()

        // Test keyboard navigation
        const firstInteractiveElement = container.querySelector('button, input, select, a') as HTMLElement
        if (firstInteractiveElement) {
          firstInteractiveElement.focus()
          expect(firstInteractiveElement).toHaveFocus()
        }

        unmount()
      }
    })

    it('maintains focus management during navigation', async () => {
      mockFetch.mockResolvedValue(mockBookingsResponse)

      render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })

      // Focus on navigation element
      const bookingsLink = screen.getByText('Bookings')
      bookingsLink.focus()
      expect(bookingsLink).toHaveFocus()

      // Focus should be maintainable
      await user.tab()
      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('Error Boundary Integration', () => {
    it('handles component-level errors without crashing the layout', async () => {
      // Mock console.error to prevent test noise
      const originalError = console.error
      console.error = jest.fn()

      try {
        // Force an error in the child component
        mockUseAdminAuth.mockImplementation(() => {
          throw new Error('Auth component error')
        })

        render(
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        )

        // Layout should still be functional
        expect(screen.queryByText('MoodOverMuscle Admin')).toBeInTheDocument()
      } finally {
        console.error = originalError
      }
    })

    it('recovers gracefully from temporary errors', async () => {
      // Start with error state
      mockFetch.mockRejectedValueOnce(new Error('Temporary error'))

      const { rerender } = render(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      await waitFor(() => {
        expect(screen.getByText('Temporary error')).toBeInTheDocument()
      })

      // Fix the error and rerender
      mockFetch.mockResolvedValue(mockStatsResponse)

      rerender(
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      )

      // Should recover
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
      })
    })
  })
})