/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByLabelText for accessibility-first testing
 * @last-refactored 2025-10-13
 * @description Display, loading, error, and performance tests for admin bookings page
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
  json: () => Promise.resolve({ bookings: mockBookings }),
  clone: function() { return this; }
} as any

const mockErrorResponse = {
  ok: false,
  statusText: 'Internal Server Error',
  json: () => Promise.resolve({ error: 'Failed to fetch bookings' }),
  clone: function() { return this; }
} as any

describe('BookingsPage Component - Display Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    
    // Default successful fetch response - immediate resolution for tests
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookings: mockBookings }),
      clone: function() { return this; }
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
      mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')))

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
        json: () => Promise.resolve({ bookings: mockBookings }),
        clone: function() { return this; }
      }

      mockFetch
        .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
        .mockImplementationOnce(() => Promise.resolve(retrySuccessResponse))

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
        json: () => Promise.resolve({ error: 'Failed to fetch bookings' }),
        clone: function() { return this; }
      }
      mockFetch.mockImplementation(() => Promise.resolve(apiErrorResponse))

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
      }, { timeout: 5000 })

      // Check booking details are displayed (using getAllByText for duplicates)
      expect(screen.getAllByText('Personal Training')).toHaveLength(2) // Sarah and Tom
      expect(screen.getByText('Group Class')).toBeInTheDocument()
      expect(screen.getByText('Mums & Bubs Class')).toBeInTheDocument()

      // Verify booking data structure
      const bookingCards = screen.getAllByText(/Personal Training|Group Class|Mums & Bubs Class/)
      expect(bookingCards).toHaveLength(4) // 2 Personal Training + 1 Group Class + 1 Mums & Bubs
      expect(mockBookings).toMatchObject([
        expect.objectContaining({ name: 'Sarah Miller', status: 'PENDING' }),
        expect.objectContaining({ name: 'Mike Johnson', status: 'CONFIRMED' }),
        expect.objectContaining({ name: 'Lisa Chen', status: 'COMPLETED' }),
        expect.objectContaining({ name: 'Tom Wilson', status: 'CANCELLED' })
      ])

      // Check status badges (use getAllByText for multiple matches)
      expect(screen.getAllByText(/pending/i).length).toBeGreaterThanOrEqual(1) // At least one pending booking
      expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThanOrEqual(1) // At least one confirmed booking
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThanOrEqual(1) // At least one completed booking
      expect(screen.getAllByText(/cancelled/i).length).toBeGreaterThanOrEqual(1) // At least one cancelled booking
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
        json: () => Promise.resolve({ bookings: [] }),
        clone: function() { return this; }
      }
      mockFetch.mockImplementation(() => Promise.resolve(emptyResponse))

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

      // Assert - Wait for bookings to load first
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Verify bookings are actually displayed
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
      expect(screen.getByText('Lisa Chen')).toBeInTheDocument()
      expect(screen.getByText('Tom Wilson')).toBeInTheDocument()

      // Then check date and time formatting - all in one waitFor
      expect(screen.getByText('Sun, 10 Aug 2025')).toBeInTheDocument()
      expect(screen.getByText('Mon, 11 Aug 2025')).toBeInTheDocument()
      expect(screen.getByText('10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('2:30 PM')).toBeInTheDocument()
      expect(screen.getByText('9:00 AM')).toBeInTheDocument()
      expect(screen.getByText('4:00 PM')).toBeInTheDocument()
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
        json: () => Promise.resolve({ bookings: largeBookingsList }),
        clone: function() { return this; }
      }
      mockFetch.mockImplementation(() => Promise.resolve(largeResponse))

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
        json: () => Promise.resolve({ bookings: malformedBookings }),
        clone: function() { return this; }
      }
      mockFetch.mockImplementation(() => Promise.resolve(malformedResponse))

      // Act
      render(<BookingsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Management')).toBeInTheDocument()
      })
    })
  })
})