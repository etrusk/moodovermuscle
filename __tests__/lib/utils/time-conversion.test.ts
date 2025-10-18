import { describe, it, expect } from 'vitest'
import { convertTo24HourFormat } from '@/lib/utils/time-conversion'

describe('convertTo24HourFormat', () => {
  describe('Already in 24-hour format', () => {
    it('returns time as-is when no AM/PM present', () => {
      // Arrange
      const time = '10:00'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('10:00')
    })

    it('returns afternoon time in 24-hour format unchanged', () => {
      // Arrange
      const time = '14:30'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('14:30')
    })

    it('returns midnight in 24-hour format unchanged', () => {
      // Arrange
      const time = '00:00'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('00:00')
    })
  })

  describe('Midnight edge case (12 AM)', () => {
    it('converts 12:00 AM to 00:00', () => {
      // Arrange
      const time = '12:00 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('00:00')
    })

    it('converts 12:30 AM to 00:30', () => {
      // Arrange
      const time = '12:30 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('00:30')
    })

    it('converts 12:59 AM to 00:59', () => {
      // Arrange
      const time = '12:59 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('00:59')
    })
  })

  describe('Noon edge case (12 PM)', () => {
    it('converts 12:00 PM to 12:00', () => {
      // Arrange
      const time = '12:00 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('12:00')
    })

    it('converts 12:45 PM to 12:45', () => {
      // Arrange
      const time = '12:45 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('12:45')
    })

    it('converts 12:59 PM to 12:59', () => {
      // Arrange
      const time = '12:59 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('12:59')
    })
  })

  describe('Morning times (AM, not 12)', () => {
    it('converts 1:00 AM to 01:00 with zero padding', () => {
      // Arrange
      const time = '1:00 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('01:00')
    })

    it('converts 9:30 AM to 09:30 with zero padding', () => {
      // Arrange
      const time = '9:30 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('09:30')
    })

    it('converts 10:00 AM to 10:00', () => {
      // Arrange
      const time = '10:00 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('10:00')
    })

    it('converts 11:59 AM to 11:59', () => {
      // Arrange
      const time = '11:59 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('11:59')
    })
  })

  describe('Afternoon times (PM, not 12)', () => {
    it('converts 1:00 PM to 13:00 by adding 12 hours', () => {
      // Arrange
      const time = '1:00 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('13:00')
    })

    it('converts 2:30 PM to 14:30 by adding 12 hours', () => {
      // Arrange
      const time = '2:30 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('14:30')
    })

    it('converts 5:45 PM to 17:45 by adding 12 hours', () => {
      // Arrange
      const time = '5:45 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('17:45')
    })

    it('converts 11:59 PM to 23:59 by adding 12 hours', () => {
      // Arrange
      const time = '11:59 PM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('23:59')
    })
  })

  describe('Edge cases and formatting', () => {
    it('pads single-digit hours with zero for morning times', () => {
      // Arrange
      const time = '9:00 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('09:00')
      expect(result).toHaveLength(5)
      expect(result[0]).toBe('0')
    })

    it('pads single-digit minutes with zero', () => {
      // Arrange
      const time = '10:05 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('10:05')
      expect(result).toHaveLength(5)
      expect(result.split(':')[1]).toBe('05')
    })

    it('pads both hours and minutes when single-digit', () => {
      // Arrange
      const time = '1:05 AM'
      
      // Act
      const result = convertTo24HourFormat(time)
      
      // Assert
      expect(result).toBe('01:05')
      expect(result).toHaveLength(5)
      expect(result.split(':')).toEqual(['01', '05'])
    })

    it('always returns HH:MM format with colon separator', () => {
      // Arrange
      const testTimes = ['1:00 AM', '12:00 PM', '5:30 PM', '11:59 PM']
      
      // Act & Assert
      testTimes.forEach(time => {
        const result = convertTo24HourFormat(time)
        expect(result).toMatch(/^\d{2}:\d{2}$/)
        expect(result).toHaveLength(5)
        expect(result[2]).toBe(':')
      })
    })
  })
})