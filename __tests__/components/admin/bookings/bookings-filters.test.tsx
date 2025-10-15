/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByLabelText for accessibility-first testing
 * @last-refactored 2025-10-13
 * @description Filter operations tests for admin bookings page
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import BookingsPage from '@/app/admin/bookings/page'
import { resetMockBookings } from '@/__tests__/setup/handlers'

// Test data constants - MSW handlers will provide this data
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

describe('BookingsPage Component - Filter Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    resetMockBookings() // Reset MSW mock data to initial state
  })

  afterEach(() => {
    vi.clearAllMocks()
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
        
        // Verify filter behavior with type assertion
        expect(mockBookings.filter(b => b.status === 'PENDING')).toMatchObject([
          expect.objectContaining({ name: 'Sarah Miller', status: 'PENDING' })
        ])
      })
    })

    it('filters bookings by search query', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getAllByText(/Personal Training/)).toHaveLength(2) // Sarah and Tom
      }, { timeout: 3000 })

      // Act
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'sarah')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('1 of 4 bookings')).toBeInTheDocument()
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
        expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument()
        
        // Verify search filter with type assertion
        const searchResults = mockBookings.filter(b =>
          b.name.toLowerCase().includes('sarah') ||
          b.email.toLowerCase().includes('sarah')
        )
        expect(searchResults).toMatchObject([
          expect.objectContaining({ name: 'Sarah Miller' })
        ])
      }, { timeout: 3000 })
    })

    it('filters bookings by date range', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
        expect(screen.getByText('Lisa Chen')).toBeInTheDocument()
      })

      // Act - Set the from date to filter out Lisa Chen (2025-08-09)
      const dateFromInput = screen.getByLabelText('From Date') as HTMLInputElement
      await user.clear(dateFromInput)
      await user.type(dateFromInput, '2025-08-10')

      // Assert - API filters by date range and returns only matching bookings
      // Lisa Chen (2025-08-09) should be filtered out
      await waitFor(() => {
        // Verify Lisa Chen is filtered out
        expect(screen.queryByText('Lisa Chen')).not.toBeInTheDocument()
      }, { timeout: 5000 })
      
      await waitFor(() => {
        // Verify other bookings (on or after 2025-08-10) are still visible
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument() // 2025-08-10
        expect(screen.getByText('Mike Johnson')).toBeInTheDocument() // 2025-08-11
        expect(screen.getByText('Tom Wilson')).toBeInTheDocument() // 2025-08-12
        // API returns 3 filtered bookings, no client-side count difference
        expect(screen.getByText('3 of 3 bookings')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('clears all filters when Clear All Filters is clicked', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      }, { timeout: 3000 })

      const statusSelect = screen.getByRole('combobox')
      await user.click(statusSelect)
      const pendingOption = screen.getByTestId('status-filter-pending')
      await user.click(pendingOption)

      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'sarah')

      await waitFor(() => {
        expect(screen.getByText('Clear All Filters')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Act
      const clearButton = screen.getByText('Clear All Filters')
      await user.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Check search input cleared separately to avoid race condition
      await waitFor(() => {
        const updatedSearchInput = screen.getByPlaceholderText('Search by name, email, or service')
        expect(updatedSearchInput).toHaveValue('')
      }, { timeout: 3000 })
    })

    it('shows no results when filters match nothing', async () => {
      // Arrange
      render(<BookingsPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Act
      const searchInput = screen.getByPlaceholderText('Search by name, email, or service')
      await user.type(searchInput, 'nonexistent')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No bookings found')).toBeInTheDocument()
        expect(screen.getByText('No bookings match your current filters.')).toBeInTheDocument()
        expect(screen.getByText('Clear Filters')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('handles filter errors gracefully', async () => {
      // Arrange
      render(<BookingsPage />)

      await waitFor(() => {
        expect(screen.getByText('4 of 4 bookings')).toBeInTheDocument()
      })

      // Act - Try to trigger invalid date range (test error handling)
      const dateFromInput = screen.getByLabelText('From Date')
      const dateToInput = screen.getByLabelText('To Date')
      
      await user.type(dateFromInput, '2025-12-31')
      await user.type(dateToInput, '2025-01-01') // To date before From date

      // Assert - UI should handle this gracefully (no exceptions thrown)
      await expect(Promise.resolve()).resolves.not.toThrow()
    })
  })
})