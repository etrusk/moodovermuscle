/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByLabelText for accessibility-first testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import BookingsPage from '@/app/admin/bookings/page'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Test data constants
const mockBookings = [
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
  },
  {
    id: 'booking-3',
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    phone: '+61 400 555 111',
    service: 'Mums & Bubs Class',
    date: '2025-08-09',
    time: '09:00',
    duration: 60,
    status: 'COMPLETED' as const,
    experience: 'Beginner',
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-09T10:00:00Z'
  },
  {
    id: 'booking-4',
    name: 'Tom Wilson',
    email: 'tom@example.com',
    phone: '+61 400 777 888',
    service: 'Personal Training',
    date: '2025-08-12',
    time: '16:00',
    duration: 60,
    status: 'CANCELLED' as const,
    goals: 'Rehabilitation',
    experience: 'Advanced',
    message: 'Need to reschedule due to injury',
    createdAt: '2025-08-06T12:00:00Z',
    updatedAt: '2025-08-08T01:00:00Z'
  }
]

const mockSuccessResponse = {
  ok: true,
  json: jest.fn(() => Promise.resolve({ bookings: mockBookings })),
  clone: jest.fn().mockReturnThis()
} as any

const mockErrorResponse = {
  ok: false,
  statusText: 'Internal Server Error',
  json: jest.fn(() => Promise.resolve({ error: 'Failed to fetch bookings' })),
  clone: jest.fn().mockReturnThis()
} as any

describe('BookingsPage Component', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    
    // Default successful fetch response - ensure proper structure
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn(() => Promise.resolve({ bookings: mockBookings })),
      clone: jest.fn().mockReturnThis()
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Loading and Error States', () => {
    it('shows loading state initially', async () => {
      // Arrange
      // Mock delayed response
      mockFetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse), 100))
      )

      // Act
      const { container } = render(<BookingsPage />)

      // Assert
      expect(screen.getByText('Booking Management')).toBeInTheDocument()
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('displays error state when fetch fails', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Act
      const { container } = render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error Loading Bookings')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('retries fetch when Try Again button is clicked', async () => {
      // Arrange
      const retrySuccessResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: mockBookings })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(retrySuccessResponse)

      render(<BookingsPage />)

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Act
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('handles API error responses correctly', async () => {
      // Arrange
      const apiErrorResponse = {
        ok: false,
        statusText: 'Internal Server Error',
        json: jest.fn(() => Promise.resolve({ error: 'Failed to fetch bookings' })),
        clone: jest.fn().mockReturnThis()
      }
      mockFetch.mockResolvedValue(apiErrorResponse)

      // Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch bookings: Internal Server Error')).toBeInTheDocument()
      })
    })
  })

  describe('Bookings Display', () => {
    it('renders bookings list with correct information', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
        expect(screen.getByText('Lisa Chen')).toBeInTheDocument()
        expect(screen.getByText('Tom Wilson')).toBeInTheDocument()
      })

      // Check booking details are displayed (using getAllByText for duplicates)
      expect(screen.getAllByText('Personal Training')).toHaveLength(2) // Sarah and Tom
      expect(screen.getByText('Group Class')).toBeInTheDocument()
      expect(screen.getByText('Mums & Bubs Class')).toBeInTheDocument()

      // Check status badges
      expect(screen.getByText(/pending/i)).toBeInTheDocument()
      expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
      expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
    })

    it('displays booking count information', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      })
    })

    it('shows empty state when no bookings exist', async () => {
      // Arrange
      const emptyResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: [] })),
        clone: jest.fn().mockReturnThis()
      }
      mockFetch.mockResolvedValue(emptyResponse)

      // Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no bookings found/i)).toBeInTheDocument()
        expect(screen.getByText(/no bookings have been created yet/i)).toBeInTheDocument()
      })
    })

    it('formats dates and times correctly', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        // Check for Australian date format
        expect(screen.getByText('Sun, 10 Aug 2025')).toBeInTheDocument()
        expect(screen.getByText('Mon, 11 Aug 2025')).toBeInTheDocument()
        
        // Check for 12-hour time format
        expect(screen.getByText('10:00 AM')).toBeInTheDocument()
        expect(screen.getByText('2:30 PM')).toBeInTheDocument()
        expect(screen.getByText('9:00 AM')).toBeInTheDocument()
        expect(screen.getByText('4:00 PM')).toBeInTheDocument()
      })
    })
  })

  describe('Filter Operations', () => {
    it('renders all filter controls', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText('Status')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search by name, email, or service')).toBeInTheDocument()
        expect(screen.getByLabelText('From Date')).toBeInTheDocument()
        expect(screen.getByLabelText('To Date')).toBeInTheDocument()
      })
    })

    it('filters bookings by status', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
      })

      // Act
      const statusSelect = screen.getByRole('combobox')
      await user.click(statusSelect)
      const pendingOption = screen.getByTestId('status-filter-pending')
      await user.click(pendingOption)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('1 of 4 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
      })
    })

    it('filters bookings by search query', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getAllByText(/Personal Training/)).toHaveLength(2) // Sarah and Tom
      })

      // Act
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'sarah')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('1 of 4 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
      })
    })

    it('filters bookings by date range', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      })

      // Act
      const dateFromInput = screen.getByLabelText('From Date')
      await user.type(dateFromInput, '2025-08-10')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('3 of 4 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
        expect(screen.queryByText('Lisa Chen')).not.toBeInTheDocument() // Before date range
      })
    })

    it('clears all filters when Clear All Filters is clicked', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      })

      const statusSelect = screen.getByRole('combobox')
      await user.click(statusSelect)
      const pendingOption = screen.getByTestId('status-filter-pending')
      await user.click(pendingOption)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'sarah')

      await waitFor(() => {
        expect(screen.getByText('Clear All Filters')).toBeInTheDocument()
      })

      // Act
      const clearButton = screen.getByText('Clear All Filters')
      await user.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
      })
    })

    it('shows no results when filters match nothing', async () => {
      // Arrange
      render(<BookingsPage />)

      // Act
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'nonexistent')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No bookings found')).toBeInTheDocument()
        expect(screen.getByText('No bookings match your current filters.')).toBeInTheDocument()
        expect(screen.getByText('Clear Filters')).toBeInTheDocument()
      })
    })
  })

  describe('Status Update Functionality', () => {
    it('renders status update buttons for appropriate statuses', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        // PENDING booking (Sarah) should have "Mark as Confirmed" and "Cancel" buttons
        const sarahRow = screen.getByText('Sarah Miller').closest('.hover\\:shadow-md')
        expect(within(sarahRow as HTMLElement).getByText('Mark as Confirmed')).toBeInTheDocument()
        expect(within(sarahRow as HTMLElement).getByText('Cancel')).toBeInTheDocument()

        // CONFIRMED booking (Mike) should have "Mark as Completed" and "Cancel" buttons
        const mikeRow = screen.getByText('Mike Johnson').closest('.hover\\:shadow-md')
        expect(within(mikeRow as HTMLElement).getByText('Mark as Completed')).toBeInTheDocument()
        expect(within(mikeRow as HTMLElement).getByText('Cancel')).toBeInTheDocument()

        // COMPLETED booking (Lisa) should have no status update buttons
        const lisaRow = screen.getByText('Lisa Chen').closest('.hover\\:shadow-md')
        expect(within(lisaRow as HTMLElement).queryByText(/Mark as/)).toBeNull()
        expect(within(lisaRow as HTMLElement).queryByText('Cancel')).toBeNull()

        // CANCELLED booking (Tom) should have no next status button
        const tomRow = screen.getByText('Tom Wilson').closest('.hover\\:shadow-md')
        expect(within(tomRow as HTMLElement).queryByText(/Mark as/)).toBeNull()
      })
    })

    it('updates booking status when Mark as Confirmed is clicked', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse) // Initial fetch
        .mockResolvedValueOnce(mockUpdateResponse) // Status update
        .mockResolvedValueOnce(mockSuccessResponse) // Refresh fetch

      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      // Assert
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

      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + Update + Refresh
    })

    it('updates booking status when Cancel is clicked', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse) // Initial fetch
        .mockResolvedValueOnce(mockUpdateResponse) // Status update
        .mockResolvedValueOnce(mockSuccessResponse) // Refresh fetch

      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/bookings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: 'booking-1',
            status: 'CANCELLED',
          }),
        })
      })
    })

    it('handles status update errors gracefully', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse) // Initial fetch
        .mockRejectedValueOnce(new Error('Update failed')) // Status update failure

      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error Loading Bookings')).toBeInTheDocument()
        expect(screen.getByText('Update failed')).toBeInTheDocument()
      })
    })

    it('provides proper status progression workflow', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Assert
      // Test the progression: PENDING -> CONFIRMED -> COMPLETED
      // PENDING booking shows "Mark as Confirmed"
      const sarahRow = screen.getByText('Sarah Miller').closest('.hover\\:shadow-md')
      expect(within(sarahRow as HTMLElement).getByText('Mark as Confirmed')).toBeInTheDocument()
      expect(within(sarahRow as HTMLElement).queryByText('Mark as Completed')).toBeNull()

      // CONFIRMED booking shows "Mark as Completed"
      const mikeRow = screen.getByText('Mike Johnson').closest('.hover\\:shadow-md')
      expect(within(mikeRow as HTMLElement).getByText('Mark as Completed')).toBeInTheDocument()
      expect(within(mikeRow as HTMLElement).queryByText('Mark as Confirmed')).toBeNull()
    })
  })

  describe('Modal Interactions', () => {
    it('opens booking detail modal when View Details is clicked', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const viewDetailsButton = screen.getAllByText('View Details')[0]
      await user.click(viewDetailsButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
        expect(screen.getByText('sarah@example.com')).toBeInTheDocument()
        expect(screen.getByText('+61 400 123 456')).toBeInTheDocument()
        expect(screen.getByText('Lose weight and build strength')).toBeInTheDocument()
        expect(screen.getByText('Looking forward to the session!')).toBeInTheDocument()
      })
    })

    it('displays complete booking information in modal', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const viewDetailsButton = screen.getAllByText('View Details')[0]
      await user.click(viewDetailsButton)

      // Assert
      await waitFor(() => {
        // Contact information
        expect(screen.getByText('Contact Information')).toBeInTheDocument()
        expect(screen.getByText('sarah@example.com')).toBeInTheDocument()
        expect(screen.getByText('+61 400 123 456')).toBeInTheDocument()

        // Session details
        expect(screen.getByText('Session Details')).toBeInTheDocument()
        expect(screen.getByText('60 minutes')).toBeInTheDocument()
        expect(screen.getByText('Home Gym')).toBeInTheDocument()

        // Client information
        expect(screen.getByText('Client Information')).toBeInTheDocument()
        expect(screen.getByText('Beginner')).toBeInTheDocument()

        // Additional message
        expect(screen.getByText('Additional Message')).toBeInTheDocument()
        expect(screen.getByText('Looking forward to the session!')).toBeInTheDocument()

        // Status actions
        expect(screen.getByText('Status Actions')).toBeInTheDocument()
      })
    })

    it('allows status updates from within the modal', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse) // Initial fetch
        .mockResolvedValueOnce(mockUpdateResponse) // Status update
        .mockResolvedValueOnce(mockSuccessResponse) // Refresh fetch

      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      const viewDetailsButton = screen.getAllByText('View Details')[0]
      await user.click(viewDetailsButton)

      await waitFor(() => {
        expect(screen.getByText('Status Actions')).toBeInTheDocument()
      })

      // Act
      const modalConfirmButton = screen.getAllByText('Mark as Confirmed').find(btn =>
        btn.closest('[role="dialog"]')
      )
      expect(modalConfirmButton).toBeInTheDocument()
      await user.click(modalConfirmButton as HTMLElement)

      // Assert
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
    })

    it('handles modal accessibility correctly', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const viewDetailsButton = screen.getAllByText('View Details')[0]
      await user.click(viewDetailsButton)

      // Assert
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        
        // Modal should have proper heading structure
        const modalTitle = screen.getByRole('heading', { name: /booking details/i })
        expect(modalTitle).toBeInTheDocument()
      })

      // Test keyboard navigation
      const firstButton = screen.getAllByRole('button')[0]
      firstButton.focus()
      expect(firstButton).toHaveFocus()
    })
  })

  describe('Accessibility and UX', () => {
    it('has no accessibility violations', async () => {
      // Arrange & Act
      const { container } = render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Assert
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper heading structure', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 })
        expect(mainHeading).toHaveTextContent('Booking Management')
        
        const filtersHeading = screen.getByText('Filters')
        expect(filtersHeading).toBeInTheDocument()
      })
    })

    it('provides proper form labels and accessibility', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText('Status')).toBeInTheDocument()
        expect(screen.getByLabelText('From Date')).toBeInTheDocument()
        expect(screen.getByLabelText('To Date')).toBeInTheDocument()
        
        const searchInput = screen.getByRole('textbox', { name: /search/i })
        expect(searchInput).toHaveAccessibleName()
      })
    })

    it('maintains proper focus management', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      searchInput.focus()

      // Assert
      expect(searchInput).toHaveFocus()

      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText('From Date'))

      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText('To Date'))
    })

    it('provides proper button labeling for screen readers', async () => {
      // Arrange & Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toHaveAccessibleName()
        })
      })
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles large number of bookings efficiently', async () => {
      // Arrange
      const largeBookingsList = Array.from({ length: 50 }, (_, i) => ({
        ...mockBookings[0],
        id: `booking-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`
      }))

      const largeResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: largeBookingsList })),
        clone: jest.fn().mockReturnThis()
      }
      mockFetch.mockResolvedValue(largeResponse)

      // Act
      const startTime = Date.now()
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('User 0')).toBeInTheDocument()
      })
      
      // Assert
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(3000) // Should render within reasonable time
    })

    it('handles component unmount gracefully', () => {
      // Arrange & Act
      const { unmount } = render(<BookingsPage />)
      
      // Assert
      expect(() => unmount()).not.toThrow()
    })

    it('handles malformed booking data gracefully', async () => {
      // Arrange
      const malformedBookings = [
        { ...mockBookings[0], date: 'invalid-date' },
        { ...mockBookings[1], time: null },
        { ...mockBookings[2], status: 'UNKNOWN_STATUS' }
      ]

      const malformedResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: malformedBookings })),
        clone: jest.fn().mockReturnThis()
      }
      mockFetch.mockResolvedValue(malformedResponse)

      // Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Management')).toBeInTheDocument()
      })
    })

    it('prevents multiple concurrent status updates', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse) // Initial fetch
        .mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve(mockUpdateResponse), 100))
        )

      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)
      await user.click(confirmButton)
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2) // Initial + one update
      })
    })
  })
})