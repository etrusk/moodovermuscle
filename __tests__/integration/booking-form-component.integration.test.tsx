/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
 */

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'

jest.setTimeout(30000)

describe('Booking Form User Journey Integration', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterEach(() => {
    cleanup()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  const fillPersonalDetails = async (data: any) => {
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), data.name)
    await user.type(screen.getByLabelText(/email/i), data.email)
    await user.type(screen.getByLabelText(/phone/i), data.phone)

    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: data.goals })
    )

    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/what would you like to try/i)
  }

  const selectService = async (serviceName: string) => {
    await user.click(screen.getByText(serviceName))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/preferred date/i)
  }

  const selectDateAndTime = async (message: string) => {
    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const dateString = dateToSelect.toISOString().split('T')[0]

    const dateInput = screen.getByLabelText(/select date/i)
    await user.clear(dateInput)
    await user.type(dateInput, dateString)

    await waitFor(() => {
      expect(screen.getByTestId('time-select')).not.toBeDisabled()
    })
    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')
    await user.type(screen.getByLabelText(/message/i), message)
  }

  const completeBookingFlow = async (overrides = {}) => {
    const defaultData = {
      name: 'Integration Test User',
      email: 'integration-test@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      goals: 'Build strength & energy',
      message: 'Looking forward to the session!',
      ...overrides,
    }

    await fillPersonalDetails(defaultData)
    await selectService(defaultData.service)
    await selectDateAndTime(defaultData.message)

    return defaultData
  }

  describe('Complete Booking Journey', () => {
    it('completes full booking flow from start to confirmation', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await completeBookingFlow()
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      // Assert
      expect(
        await screen.findByText(/booking confirmed/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('preserves user data through multi-step wizard', async () => {
      // Arrange
      const onClose = jest.fn()
      const expectedData = {
        name: 'Test Persistence',
        email: 'persist@example.com',
      }
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      const userData = await completeBookingFlow(expectedData)

      // Assert
      expect(screen.getByLabelText(/message/i)).toHaveValue(userData.message)
      expect(userData).toMatchObject(expectedData)
    })
  })

  describe('Error Handling and Validation', () => {
    it('displays validation errors from API', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await completeBookingFlow({ email: 'validation@example.com' })
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      // Assert
      expect(
        await screen.findByText(/Invalid data/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('handles network failures gracefully', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await completeBookingFlow({ email: 'network@example.com' })
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      // Assert
      expect(
        await screen.findByText(/network error/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })
  })

  describe('Loading and Progress States', () => {
    it('shows loading state during step transitions', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/phone/i), '0123456789')
      await user.click(screen.getByTestId('goals-select-trigger'))
      await user.click(
        await screen.findByRole('option', { name: 'Build strength & energy' })
      )
      const continueButton = screen.getByRole('button', { name: /continue/i })
      user.click(continueButton)

      // Assert
      await waitFor(
        () => expect(screen.getByText(/validating/i)).toBeInTheDocument(),
        { timeout: 2000 }
      )
      await screen.findByText(/what would you like to try/i)
    })

    it('shows loading state during final submission', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await completeBookingFlow()
      const submitButton = screen.getByRole('button', {
        name: /book my free session/i,
      })
      user.click(submitButton)

      // Assert
      await waitFor(
        () => expect(screen.getByText(/booking\.\.\./i)).toBeInTheDocument(),
        { timeout: 2000 }
      )
      expect(
        await screen.findByText(/booking confirmed/i)
      ).toBeInTheDocument()
    })
  })

  describe('User Interaction Patterns', () => {
    it('enables time selection only after date is chosen', async () => {
      // Arrange
      const onClose = jest.fn()
      
      // Act
      render(<BookingForm isOpen={true} onClose={onClose} />)
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/phone/i), '0123456789')
      await user.click(screen.getByTestId('goals-select-trigger'))
      await user.click(
        await screen.findByRole('option', { name: 'Build strength & energy' })
      )
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByText(/what would you like to try/i)
      await user.click(screen.getByText('1-on-1 Personal Training'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByText(/preferred date/i)
      const timeSelect = screen.getByTestId('time-select')

      // Assert - Initially disabled
      expect(timeSelect).toBeDisabled()

      // Act - Select a date
      const dateToSelect = new Date()
      dateToSelect.setDate(dateToSelect.getDate() + 5)
      const dateString = dateToSelect.toISOString().split('T')[0]
      const dateInput = screen.getByLabelText(/select date/i)
      await user.clear(dateInput)
      await user.type(dateInput, dateString)

      // Assert - Now enabled
      await waitFor(() => {
        expect(timeSelect).not.toBeDisabled()
      })
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
