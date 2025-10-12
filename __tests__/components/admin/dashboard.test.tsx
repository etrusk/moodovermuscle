/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByText for accessibility-first dashboard testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import AdminDashboardPage from '@/app/admin/dashboard/page'
import { useAdminAuth } from '@/lib/auth/AdminAuthContext'
import { useRouter } from 'next/navigation'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock AdminAuthContext
const mockUseAdminAuth = jest.fn()
jest.mock('@/lib/auth/AdminAuthContext', () => ({
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

const mockStatsResponse = {
  ok: true,
  json: () => Promise.resolve(mockStatsData),
  clone: jest.fn().mockReturnThis(),
  status: 200,
  statusText: 'OK'
} as unknown as Response

const mockErrorResponse = {
  ok: false,
  statusText: 'Internal Server Error',
  json: () => Promise.resolve({ error: 'Failed to fetch stats' }),
  clone: jest.fn().mockReturnThis(),
  status: 500
} as unknown as Response

describe('AdminDashboardPage Component', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    
    // Default successful auth mock
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      logout: jest.fn(),
    })

    // Default successful fetch mock
    mockFetch.mockResolvedValue(mockStatsResponse)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Authentication Integration', () => {
    it('shows loading state when authentication is loading', async () => {
      // Arrange
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      // Act
      const { container } = render(<AdminDashboardPage />)
      
      // Assert
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('returns null when not authenticated', () => {
      // Arrange
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      // Act
      const { container } = render(<AdminDashboardPage />)
      
      // Assert
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Stats Loading and Display', () => {
    it('renders dashboard with user welcome message', async () => {
      // Arrange & Act
      const { container } = render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Emily!/)).toBeInTheDocument()
        expect(screen.getByText(/Here's what's happening with your fitness coaching business today/)).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('displays loading state for stats initially', async () => {
      // Arrange
      mockFetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockStatsResponse), 100))
      )

      // Act
      render(<AdminDashboardPage />)

      // Assert
      expect(screen.getAllByText('...')).toHaveLength(4)
      
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()
      })
    })

    it('fetches and displays dashboard statistics correctly', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()  // Total bookings
        expect(screen.getByText('3')).toBeInTheDocument()   // Pending bookings
        expect(screen.getByText('2')).toBeInTheDocument()   // Today bookings
        expect(screen.getByText('8')).toBeInTheDocument()   // This week bookings
      }, { timeout: 3000 })

      expect(mockFetch).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      
      const fetchCall = mockFetch.mock.calls[0]
      const requestArg = fetchCall[0]
      
      if (typeof requestArg === 'string') {
        expect(requestArg).toBe('/api/admin/stats')
      } else {
        expect(requestArg.url).toBe('http://localhost/api/admin/stats')
        expect(requestArg.method).toBe('GET')
        expect(requestArg.credentials).toBe('include')
      }

      expect(screen.getByText('Total Bookings')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('This Week')).toBeInTheDocument()
    })

    it('only fetches stats when user is available', async () => {
      // Arrange
      mockUseAdminAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      // Act
      render(<AdminDashboardPage />)

      // Assert
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling with Retry', () => {
    it('displays error message when stats fetch fails', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Act
      const { container } = render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument()
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('displays error with proper styling and retry button', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Server error'))

      // Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        const errorCard = screen.getByText('Error loading dashboard data').closest('.border-red-200')
        expect(errorCard).toBeInTheDocument()
        
        const retryButton = screen.getByRole('button', { name: /retry/i })
        expect(retryButton).toBeInTheDocument()
      })
    })

    it('retries stats fetch when retry button is clicked', async () => {
      // Arrange
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockStatsResponse)

      render(<AdminDashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Act
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()
      }, { timeout: 5000 })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('handles API error responses correctly', async () => {
      // Arrange
      mockFetch.mockResolvedValue(mockErrorResponse)

      // Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch dashboard statistics')).toBeInTheDocument()
      })
    })
  })

  describe('Quick Action Navigation', () => {
    it('renders all quick action buttons', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('View All Bookings')).toBeInTheDocument()
        expect(screen.getByText('Review Pending Bookings')).toBeInTheDocument()
        expect(screen.getByText("Check Today's Schedule")).toBeInTheDocument()
      })
    })

    it('navigates to bookings page when View All Bookings is clicked', async () => {
      // Arrange
      render(<AdminDashboardPage />)

      await waitFor(() => {
        const viewAllButton = screen.getByText('View All Bookings')
        expect(viewAllButton).toBeInTheDocument()
      })

      // Act
      const viewAllButton = screen.getByText('View All Bookings')
      await user.click(viewAllButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/admin/bookings')
    })

    it('navigates to pending bookings with filter when Review Pending is clicked', async () => {
      // Arrange
      render(<AdminDashboardPage />)

      await waitFor(() => {
        const pendingButton = screen.getByText('Review Pending Bookings')
        expect(pendingButton).toBeInTheDocument()
      })

      // Act
      const pendingButton = screen.getByText('Review Pending Bookings')
      await user.click(pendingButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/admin/bookings?filter=pending')
    })

    it('navigates to calendar page when Check Today\'s Schedule is clicked', async () => {
      // Arrange
      render(<AdminDashboardPage />)

      await waitFor(() => {
        const calendarButton = screen.getByText("Check Today's Schedule")
        expect(calendarButton).toBeInTheDocument()
      })

      // Act
      const calendarButton = screen.getByText("Check Today's Schedule")
      await user.click(calendarButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/admin/calendar')
    })
  })

  describe('Recent Activity Display', () => {
    it('renders recent activity section with mock data', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
        expect(screen.getByText('Latest booking updates and activities')).toBeInTheDocument()
        
        expect(screen.getByText('New booking confirmed')).toBeInTheDocument()
        expect(screen.getByText('Sarah M. - Personal Training')).toBeInTheDocument()
        expect(screen.getByText('Session completed')).toBeInTheDocument()
        expect(screen.getByText('Lisa J. - Mums & Bubs Class')).toBeInTheDocument()
        expect(screen.getByText('Booking pending')).toBeInTheDocument()
        expect(screen.getByText('Mike R. - Personal Training')).toBeInTheDocument()
      })
    })

    it('displays activity timestamps', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('2h ago')).toBeInTheDocument()
        expect(screen.getByText('4h ago')).toBeInTheDocument()
        expect(screen.getByText('6h ago')).toBeInTheDocument()
      })
    })
  })

  describe('Component Lifecycle and Effects', () => {
    it('refetches stats when user changes', async () => {
      // Arrange
      const { rerender } = render(<AdminDashboardPage />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Act
      const newUser = { ...mockUser, id: '2', name: 'Updated Emily' }
      mockUseAdminAuth.mockReturnValue({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
      })

      rerender(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })

    it('handles component unmount gracefully', () => {
      // Arrange & Act
      const { unmount } = render(<AdminDashboardPage />)
      
      // Assert
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      // Arrange & Act
      const { container } = render(<AdminDashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Emily!')).toBeInTheDocument()
      })

      // Assert
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper heading structure', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 2, name: /welcome back, emily/i })
        expect(mainHeading).toBeInTheDocument()
        
        expect(screen.getByText('Quick Actions')).toBeInTheDocument()
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      })
    })

    it('provides proper button labels for screen readers', async () => {
      // Arrange & Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toHaveAccessibleName()
        })
      })
    })
  })

  describe('Loading States and Performance', () => {
    it('shows individual stat loading placeholders', async () => {
      // Arrange
      mockFetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockStatsResponse), 50))
      )

      // Act
      render(<AdminDashboardPage />)

      // Assert
      const loadingIndicators = screen.getAllByText('...')
      expect(loadingIndicators).toHaveLength(4)

      await waitFor(() => {
        expect(screen.queryByText('...')).not.toBeInTheDocument()
      })
    })

    it('cleans up loading states properly after error', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Act
      render(<AdminDashboardPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.queryByText('...')).not.toBeInTheDocument()
      })
    })
  })
})