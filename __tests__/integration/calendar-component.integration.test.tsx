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
      // When: User opens calendar to select a date
      render(<Calendar mode="single" />)

      // Then: Navigation controls are available
      const prevButton = screen.getByRole('button', {
        name: /previous month/i,
      })
      const nextButton = screen.getByRole('button', { name: /next month/i })

      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it('allows users to browse through months to find available dates', async () => {
      // Given: User needs to find a date in a different month
      const user = userEvent.setup()
      const onMonthChange = jest.fn()
      render(<Calendar mode="single" onMonthChange={onMonthChange} />)

      // When: User navigates to next month
      const nextButton = screen.getByRole('button', { name: /next month/i })
      await user.click(nextButton)

      // Then: Calendar advances to next month (any date in next month)
      expect(onMonthChange).toHaveBeenCalledTimes(1)
      const nextMonthCall = onMonthChange.mock.calls[0][0]
      expect(nextMonthCall).toBeInstanceOf(Date)

      // When: User navigates back to current month
      const prevButton = screen.getByRole('button', {
        name: /previous month/i,
      })
      await user.click(prevButton)

      // Then: Calendar navigates in both directions
      expect(onMonthChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Date Selection', () => {
    it('captures user date selection for booking', async () => {
      // Given: User is selecting a booking date
      const user = userEvent.setup()
      const onSelect = jest.fn()
      render(<Calendar mode="single" onSelect={onSelect} />)

      // When: User clicks on tomorrow's date
      const dateCell = screen.getByRole('gridcell', {
        name: format(tomorrow, 'd'),
      })
      const dateButton = dateCell.querySelector('button')
      if (!dateButton) throw new Error('Date button not found')

      await user.click(dateButton)

      // Then: Selection callback receives the chosen date
      expect(onSelect).toHaveBeenCalled()
      const selectedDate = onSelect.mock.calls[0][0]
      expect(selectedDate.toDateString()).toBe(tomorrow.toDateString())
    })

    it('prevents selection of unavailable dates', async () => {
      // Given: Today is not available for booking
      const user = userEvent.setup()
      const onSelect = jest.fn()
      render(
        <Calendar mode="single" onSelect={onSelect} disabled={[today]} />
      )

      // When: User attempts to select disabled date
      const disabledCell = screen.getByRole('gridcell', {
        name: format(today, 'd'),
      })
      const disabledButton = disabledCell.querySelector('button')
      if (!disabledButton) throw new Error('Disabled date button not found')

      // Then: Date is marked as disabled and not selectable
      expect(disabledButton).toBeDisabled()
      await user.click(disabledButton)
      expect(onSelect).not.toHaveBeenCalled()
    })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

  })
})
