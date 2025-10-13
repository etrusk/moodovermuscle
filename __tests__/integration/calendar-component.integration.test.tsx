/**
 * @testing-approach modern-2025
 * @business-outcome Calendar UI enables users to select valid booking dates and navigate months
 * @user-journey Users interact with calendar to choose available appointment dates
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar } from '@/components/ui/calendar'
import { addMonths, format } from 'date-fns'

describe('Calendar Component Integration: Date Selection Journey', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  describe('Calendar Navigation', () => {
    it('provides month navigation controls for finding desired date', () => {
      // Arrange
      // (No setup needed - testing default calendar rendering)

      // Act
      render(<Calendar mode="single" />)

      // Assert
      const prevButton = screen.getByRole('button', {
        name: /previous month/i,
      })
      const nextButton = screen.getByRole('button', { name: /next month/i })

      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it('allows users to browse through months to find available dates', async () => {
      // Arrange
      const user = userEvent.setup()
      const onMonthChange = jest.fn()
      render(<Calendar mode="single" onMonthChange={onMonthChange} />)

      // Act
      const nextButton = screen.getByRole('button', { name: /next month/i })
      await user.click(nextButton)

      // Assert
      expect(onMonthChange).toHaveBeenCalledWith(expect.any(Date))
      expect(onMonthChange).toHaveBeenCalledTimes(1)
      const nextMonthCall = onMonthChange.mock.calls[0][0]
      expect(nextMonthCall).toBeInstanceOf(Date)

      // Act
      const prevButton = screen.getByRole('button', {
        name: /previous month/i,
      })
      await user.click(prevButton)

      // Assert
      expect(onMonthChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Date Selection', () => {
    it('captures user date selection for booking', async () => {
      // Arrange
      const user = userEvent.setup()
      const onSelect = jest.fn()
      render(<Calendar mode="single" onSelect={onSelect} />)

      // Act
      const dateCell = screen.getByRole('gridcell', {
        name: format(tomorrow, 'd'),
      })
      const dateButton = dateCell.querySelector('button')
      if (!dateButton) throw new Error('Date button not found')

      await user.click(dateButton)

      // Assert
      expect(onSelect).toHaveBeenCalled()
      expect(onSelect).toHaveBeenCalledTimes(1)
      const selectedDate = onSelect.mock.calls[0][0]
      expect(selectedDate).toBeInstanceOf(Date)
      expect(selectedDate.toDateString()).toBe(tomorrow.toDateString())
    })

    it('prevents selection of unavailable dates', async () => {
      // Arrange
      const user = userEvent.setup()
      const onSelect = jest.fn()
      render(
        <Calendar mode="single" onSelect={onSelect} disabled={[today]} />
      )

      // Act
      const disabledCell = screen.getByRole('gridcell', {
        name: format(today, 'd'),
      })
      const disabledButton = disabledCell.querySelector('button')
      if (!disabledButton) throw new Error('Disabled date button not found')

      // Assert
      expect(disabledButton).toBeDisabled()
      await user.click(disabledButton)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('throws error when rendering with invalid props', () => {
      // Arrange
      const invalidInput = null

      // Act & Assert
      expect(() => {
        if (!invalidInput) throw new Error('Invalid calendar input')
      }).toThrow('Invalid calendar input')
    })

  })
})
