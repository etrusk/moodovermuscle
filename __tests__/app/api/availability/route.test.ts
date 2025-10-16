import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/availability/route'
import * as validation from '@/app/api/availability/functions/availability-validation'
import * as checking from '@/app/api/availability/functions/availability-checking'
import * as response from '@/app/api/availability/functions/availability-response'

// Mock availability modules
vi.mock('@/app/api/availability/functions/availability-validation', () => ({
  validateAvailabilityRequest: vi.fn(),
}))

vi.mock('@/app/api/availability/functions/availability-checking', () => ({
  getAvailableTimesForDate: vi.fn(),
  checkSingleSlotAvailability: vi.fn(),
  AvailabilityConflictError: class AvailabilityConflictError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AvailabilityConflictError'
    }
  },
}))

vi.mock('@/app/api/availability/functions/availability-response', () => ({
  createSingleSlotResponse: vi.fn(),
  createFullDayResponse: vi.fn(),
  createErrorResponse: vi.fn(),
}))

describe('app/api/availability/route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET handler', () => {
    it('should return validation error for invalid request', async () => {
      // Arrange
      const mockErrorResponse = { status: 400 } as any
      vi.mocked(validation.validateAvailabilityRequest).mockResolvedValue({
        success: false,
        data: null,
        error: mockErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/availability?date=invalid', {
        method: 'GET',
      })

      // Act
      const result = await GET(request)

      // Assert
      expect(result).toBe(mockErrorResponse)
      expect(validation.validateAvailabilityRequest).toHaveBeenCalled()
    })

    it('should check single slot availability when time parameter is provided', async () => {
      // Arrange
      vi.mocked(validation.validateAvailabilityRequest).mockResolvedValue({
        success: true,
        data: { date: '2024-12-25', time: '09:00' },
        error: null,
      })

      const mockSlotCheck = { isAvailable: true }
      vi.mocked(checking.checkSingleSlotAvailability).mockResolvedValue(mockSlotCheck)

      const mockResponse = { status: 200 } as any
      vi.mocked(response.createSingleSlotResponse).mockReturnValue(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/availability?date=2024-12-25&time=09:00', {
        method: 'GET',
      })

      // Act
      const result = await GET(request)

      // Assert
      expect(result).toBe(mockResponse)
      expect(checking.checkSingleSlotAvailability).toHaveBeenCalledWith(
        expect.any(Date),
        '09:00'
      )
      expect(response.createSingleSlotResponse).toHaveBeenCalledWith(
        mockSlotCheck,
        '2024-12-25',
        '09:00'
      )
    })

    it('should get full day availability when time parameter is not provided', async () => {
      // Arrange
      vi.mocked(validation.validateAvailabilityRequest).mockResolvedValue({
        success: true,
        data: { date: '2024-12-25', time: null },
        error: null,
      })

      const mockAvailabilityData = {
        availableTimes: ['09:00', '10:00'],
        bookedTimes: ['11:00'],
        date: '2024-12-25',
      }
      vi.mocked(checking.getAvailableTimesForDate).mockResolvedValue(mockAvailabilityData)

      const mockResponse = { status: 200 } as any
      vi.mocked(response.createFullDayResponse).mockReturnValue(mockResponse)

      const request = new NextRequest('http://localhost:3000/api/availability?date=2024-12-25', {
        method: 'GET',
      })

      // Act
      const result = await GET(request)

      // Assert
      expect(result).toBe(mockResponse)
      expect(checking.getAvailableTimesForDate).toHaveBeenCalledWith(expect.any(Date))
      expect(response.createFullDayResponse).toHaveBeenCalledWith(mockAvailabilityData)
    })

    it('should handle availability conflict error', async () => {
      // Arrange
      vi.mocked(validation.validateAvailabilityRequest).mockResolvedValue({
        success: true,
        data: { date: '2024-12-25', time: '09:00' },
        error: null,
      })

      const conflictError = new checking.AvailabilityConflictError('Slot not available')
      vi.mocked(checking.checkSingleSlotAvailability).mockRejectedValue(conflictError)

      const mockErrorResponse = { status: 409 } as any
      vi.mocked(response.createErrorResponse).mockReturnValue(mockErrorResponse)

      const request = new NextRequest('http://localhost:3000/api/availability?date=2024-12-25&time=09:00', {
        method: 'GET',
      })

      // Act
      const result = await GET(request)

      // Assert
      expect(result).toBe(mockErrorResponse)
      expect(response.createErrorResponse).toHaveBeenCalledWith(conflictError, true)
    })

    it('should handle generic server error', async () => {
      // Arrange
      vi.mocked(validation.validateAvailabilityRequest).mockResolvedValue({
        success: true,
        data: { date: '2024-12-25', time: null },
        error: null,
      })

      const genericError = new Error('Database error')
      vi.mocked(checking.getAvailableTimesForDate).mockRejectedValue(genericError)

      const mockErrorResponse = { status: 500 } as any
      vi.mocked(response.createErrorResponse).mockReturnValue(mockErrorResponse)

      const request = new NextRequest('http://localhost:3000/api/availability?date=2024-12-25', {
        method: 'GET',
      })

      // Act
      const result = await GET(request)

      // Assert
      expect(result).toBe(mockErrorResponse)
      expect(response.createErrorResponse).toHaveBeenCalledWith(genericError, false)
    })
  })
})