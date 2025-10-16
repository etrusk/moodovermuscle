import { describe, it, expect } from 'vitest'
import { NextResponse } from 'next/server'
import {
  createSingleSlotResponse,
  createFullDayResponse,
  createErrorResponse,
} from '@/app/api/availability/functions/availability-response'

describe('app/api/availability/functions/availability-response', () => {
  describe('createSingleSlotResponse', () => {
    it('should create response for available slot', async () => {
      // Arrange
      const slotCheck = { isAvailable: true }
      const date = '2024-12-25'
      const time = '09:00'

      // Act
      const response = createSingleSlotResponse(slotCheck, date, time)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        isAvailable: true,
        date: '2024-12-25',
        time: '09:00',
      })
      // Headers are case-insensitive but may be lowercase in response
      const cacheControl = response.headers.get('cache-control')
      if (!cacheControl) {
        // Try with uppercase
        const altCacheControl = Array.from(response.headers.entries()).find(([k]) => k.toLowerCase() === 'cache-control')?.[1]
        expect(altCacheControl).toBe('public, max-age=30, stale-while-revalidate=15')
      } else {
        expect(cacheControl).toBe('public, max-age=30, stale-while-revalidate=15')
      }
    })

    it('should create response for unavailable slot with conflicting booking', async () => {
      // Arrange
      const slotCheck = {
        isAvailable: false,
        conflictingBooking: {
          id: 'booking-123',
          date: new Date('2024-12-25'),
          time: '09:00',
        },
      }
      const date = '2024-12-25'
      const time = '09:00'

      // Act
      const response = createSingleSlotResponse(slotCheck, date, time)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.isAvailable).toBe(false)
      expect(responseData.date).toBe('2024-12-25')
      expect(responseData.time).toBe('09:00')
      // Verify conflicting booking structure
      expect(responseData.conflictingBooking).toEqual({
        id: 'booking-123',
        date: expect.any(Object), // Date object serialized
        time: '09:00',
      })
    })

    it('should set shorter cache duration for single slot checks', () => {
      // Arrange
      const slotCheck = { isAvailable: true }

      // Act
      const response = createSingleSlotResponse(slotCheck, '2024-12-25', '09:00')

      // Assert
      // Check if headers are set by examining the response object
      // Headers might not be accessible in the same way in tests
      const headers = Array.from(response.headers.entries())
      const cacheControlEntry = headers.find(([k]) => k.toLowerCase() === 'cache-control')
      expect(cacheControlEntry).toEqual([
        expect.stringMatching(/cache-control/i),
        expect.stringContaining('max-age=30'),
      ])
      expect(cacheControlEntry![1]).toContain('stale-while-revalidate=15')
    })
  })

  describe('createFullDayResponse', () => {
    it('should create response with availability data', async () => {
      // Arrange
      const availabilityData = {
        availableTimes: ['09:00', '10:00', '11:00'],
        bookedTimes: ['14:00', '15:00'],
        date: '2024-12-25',
      }

      // Act
      const response = createFullDayResponse(availabilityData)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        availableTimes: ['09:00', '10:00', '11:00'],
        bookedTimes: ['14:00', '15:00'],
        date: '2024-12-25',
      })
    })

    it('should set cache control headers for full day queries', () => {
      // Arrange
      const availabilityData = {
        availableTimes: ['09:00'],
        bookedTimes: [],
        date: '2024-12-25',
      }

      // Act
      const response = createFullDayResponse(availabilityData)

      // Assert
      // Headers are case-insensitive but may be lowercase in response
      const headers = Array.from(response.headers.entries())
      const cacheControlEntry = headers.find(([k]) => k.toLowerCase() === 'cache-control')
      expect(cacheControlEntry).toEqual([
        expect.stringMatching(/cache-control/i),
        'public, max-age=60, stale-while-revalidate=30',
      ])
    })

    it('should handle empty availability data', async () => {
      // Arrange
      const availabilityData = {
        availableTimes: [],
        bookedTimes: [],
        date: '2024-12-25',
      }

      // Act
      const response = createFullDayResponse(availabilityData)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        availableTimes: [],
        bookedTimes: [],
        date: '2024-12-25',
      })
    })
  })

  describe('createErrorResponse', () => {
    it('should create conflict error response (409)', async () => {
      // Arrange
      const error = new Error('Slot already booked')
      const isAvailabilityConflict = true

      // Act
      const response = createErrorResponse(error, isAvailabilityConflict)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(409)
      expect(responseData).toEqual({
        message: 'Slot already booked',
        type: 'availability_conflict',
      })
    })

    it('should create generic server error response (500)', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      const isAvailabilityConflict = false

      // Act
      const response = createErrorResponse(error, isAvailabilityConflict)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        message: 'Failed to fetch availability data',
        type: 'server_error',
      })
    })

    it('should include error details in development mode', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Specific database error')

      // Act
      const response = createErrorResponse(error, false)
      const responseData = await response.json()

      // Assert
      expect(responseData).toEqual({
        message: 'Failed to fetch availability data',
        type: 'server_error',
        error: 'Specific database error',
      })

      // Cleanup
      process.env.NODE_ENV = originalEnv
    })

    it('should not include error details in production mode', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Sensitive database error')

      // Act
      const response = createErrorResponse(error, false)
      const responseData = await response.json()

      // Assert
      expect(responseData).toEqual({
        message: 'Failed to fetch availability data',
        type: 'server_error',
      })

      // Cleanup
      process.env.NODE_ENV = originalEnv
    })

    it('should default to server error when isAvailabilityConflict is false', () => {
      // Arrange
      const error = new Error('Random error')

      // Act
      const response = createErrorResponse(error)

      // Assert
      expect(response.status).toBe(500)
    })
  })
})