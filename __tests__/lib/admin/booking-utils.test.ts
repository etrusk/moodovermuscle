import { describe, it, expect } from 'vitest'
import {
  getNextStatus,
  formatDate,
  formatTime,
  filterBookings,
  type Booking,
  type FilterOptions,
} from '@/lib/admin/booking-utils'

describe('getNextStatus', () => {
  it('returns CONFIRMED for PENDING status', () => {
    // Arrange
    const status = 'PENDING'

    // Act
    const result = getNextStatus(status)

    // Assert
    expect(result).toBe('CONFIRMED')
  })

  it('returns COMPLETED for CONFIRMED status', () => {
    // Arrange
    const status = 'CONFIRMED'

    // Act
    const result = getNextStatus(status)

    // Assert
    expect(result).toBe('COMPLETED')
  })

  it('returns null for CANCELLED status', () => {
    // Arrange
    const status = 'CANCELLED'

    // Act
    const result = getNextStatus(status)

    // Assert
    expect(result).toBeNull()
  })

  it('returns null for COMPLETED status', () => {
    // Arrange
    const status = 'COMPLETED'

    // Act
    const result = getNextStatus(status)

    // Assert
    expect(result).toBeNull()
  })

  it('returns null for invalid/unknown status', () => {
    // Arrange
    const status = 'INVALID_STATUS'

    // Act
    const result = getNextStatus(status)

    // Assert
    expect(result).toBeNull()
  })
})

describe('formatDate', () => {
  it('formats valid ISO date string to en-AU locale with weekday abbreviation', () => {
    // Arrange
    const dateString = '2025-01-15'

    // Act
    const result = formatDate(dateString)

    // Assert
    expect(result).toBe('Wed, 15 Jan 2025')
  })

  it('handles leap year date correctly', () => {
    // Arrange
    const leapYearDate = '2024-02-29'

    // Act
    const result = formatDate(leapYearDate)

    // Assert
    expect(result).toBe('Thu, 29 Feb 2024')
  })

  it('handles month boundary correctly', () => {
    // Arrange
    const monthBoundary = '2025-12-31'

    // Act
    const result = formatDate(monthBoundary)

    // Assert
    expect(result).toBe('Wed, 31 Dec 2025')
  })
})

describe('formatTime', () => {
  it('formats midnight (00:00) to 12:00 AM', () => {
    // Arrange
    const timeString = '00:00'

    // Act
    const result = formatTime(timeString)

    // Assert
    expect(result).toBe('12:00 AM')
  })

  it('formats noon (12:00) to 12:00 PM', () => {
    // Arrange
    const timeString = '12:00'

    // Act
    const result = formatTime(timeString)

    // Assert
    expect(result).toBe('12:00 PM')
  })

  it('formats morning time (09:30) to 9:30 AM', () => {
    // Arrange
    const timeString = '09:30'

    // Act
    const result = formatTime(timeString)

    // Assert
    expect(result).toBe('9:30 AM')
  })

  it('formats afternoon time (14:30) to 2:30 PM', () => {
    // Arrange
    const timeString = '14:30'

    // Act
    const result = formatTime(timeString)

    // Assert
    expect(result).toBe('2:30 PM')
  })

  it('formats evening time (23:45) to 11:45 PM', () => {
    // Arrange
    const timeString = '23:45'

    // Act
    const result = formatTime(timeString)

    // Assert
    expect(result).toBe('11:45 PM')
  })
})

describe('filterBookings', () => {
  // Arrange: Create test bookings fixture
  const mockBookings: Booking[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0400000001',
      service: 'Personal Training',
      date: '2025-01-15',
      time: '09:00',
      duration: 60,
      status: 'PENDING',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0400000002',
      service: 'Group Class',
      date: '2025-01-20',
      time: '10:00',
      duration: 45,
      status: 'CONFIRMED',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '0400000003',
      service: 'Yoga Session',
      date: '2025-01-25',
      time: '14:00',
      duration: 90,
      status: 'CANCELLED',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '0400000004',
      service: 'Personal Training',
      date: '2025-02-01',
      time: '11:00',
      duration: 60,
      status: 'COMPLETED',
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z',
    },
  ]

  it('filters by PENDING status', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'PENDING',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].status).toBe('PENDING')
  })

  it('filters by CONFIRMED status', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'CONFIRMED',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
    expect(result[0].status).toBe('CONFIRMED')
  })

  it('returns all bookings when status filter is ALL', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(4)
    expect(result).toEqual(mockBookings)
  })

  it('filters by search query matching name (case insensitive)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: 'john',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('John Doe')
  })

  it('filters by search query matching email (case insensitive)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: 'JANE@EXAMPLE',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('jane@example.com')
  })

  it('filters by search query matching service (case insensitive)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: 'personal',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0].service).toBe('Personal Training')
    expect(result[1].service).toBe('Personal Training')
  })

  it('filters by date range', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: '',
      dateFrom: '2025-01-18',
      dateTo: '2025-01-28',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2025-01-20')
    expect(result[1].date).toBe('2025-01-25')
  })

  it('combines status, search, and date range filters', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'CONFIRMED',
      searchQuery: 'jane',
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
    expect(result[0].status).toBe('CONFIRMED')
    expect(result[0].name).toBe('Jane Smith')
    expect(result[0].date).toBe('2025-01-20')
  })

  it('returns empty array when no bookings match filters', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'PENDING',
      searchQuery: 'nonexistent',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  it('handles empty search query (returns all matching status/date)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(4)
    expect(result).toEqual(mockBookings)
  })

  it('handles missing date range (no date filtering)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'CONFIRMED',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('CONFIRMED')
  })

  it('filters by dateFrom only (no dateTo)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: '',
      dateFrom: '2025-01-25',
      dateTo: '',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2025-01-25')
    expect(result[1].date).toBe('2025-02-01')
  })

  it('filters by dateTo only (no dateFrom)', () => {
    // Arrange
    const filters: FilterOptions = {
      statusFilter: 'ALL',
      searchQuery: '',
      dateFrom: '',
      dateTo: '2025-01-20',
    }

    // Act
    const result = filterBookings(mockBookings, filters)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2025-01-15')
    expect(result[1].date).toBe('2025-01-20')
  })
})