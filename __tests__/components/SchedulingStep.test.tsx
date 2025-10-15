/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for select/option testing
 * @last-refactored 2025-10-10
 */
import { vi, describe, it, expect, afterEach } from 'vitest'

import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { SchedulingStep } from '@/components/booking-form/steps/SchedulingStep'
import * as useAvailability from '@/components/booking-form/useAvailability'

// Mock the useAvailability hook
vi.mock('@/components/booking-form/useAvailability')
const mockedUseAvailability = useAvailability.useAvailability as vi.Mock

describe('SchedulingStep', () => {
  const mockFetchAvailability = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('disables controls when isLoading prop is true', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep isLoading={true} />
      </BookingFormProvider>
    )

    // Assert
    const datePicker = screen.getByLabelText(/select date/i)
    const timeSelect = screen.getByTestId('time-select')
    const messageTextarea = screen.getByTestId('message-textarea')

    expect(datePicker).toBeDisabled()
    expect(timeSelect).toMatchObject({
      disabled: true,
      tagName: 'SELECT'
    })
    expect(messageTextarea).toMatchObject({
      disabled: true,
      tagName: 'TEXTAREA'
    })
    
    expect(mockFetchAvailability).toHaveBeenCalledTimes(0)
  })

  it('shows loading state for time slots when availability is being fetched', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: true,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}} initialValues={{ date: new Date() }}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    // Assert
    const timeSelect = screen.getByTestId('time-select')
    const loadingOption = screen.getByRole('option', { name: /loading slots/i })
    
    expect(timeSelect).toMatchObject({
      disabled: true,
      tagName: 'SELECT'
    })
    expect(loadingOption).toMatchObject({
      textContent: expect.stringMatching(/loading slots/i)
    })
  })

  it('displays available and booked time slots correctly', async () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: ['09:00', '11:00'],
      bookedTimes: ['10:00'],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}} initialValues={{ date: new Date() }}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    // Assert
    const timeSelect = screen.getByTestId('time-select')
    expect(timeSelect).toMatchObject({
      disabled: false,
      tagName: 'SELECT'
    })

    // Use findByRole to wait for options to appear
    const availableOption = await screen.findByRole('option', { name: '9:00 AM' })
    const bookedOption = await screen.findByRole('option', {
      name: '10:00 AM (Booked)',
    })
    const anotherAvailableOption = await screen.findByRole('option', {
      name: '11:00 AM',
    })

    expect(availableOption).toMatchObject({
      textContent: '9:00 AM',
      disabled: false
    })
    expect(bookedOption).toMatchObject({
      textContent: expect.stringMatching(/10:00 AM.*Booked/),
      disabled: true
    })
    expect(anotherAvailableOption).toMatchObject({
      textContent: '11:00 AM',
      disabled: false
    })
  })

  it('shows "Select a date first" when no date is selected', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    // Assert
    const timeSelect = screen.getByTestId('time-select')
    const dateOption = screen.getByRole('option', { name: /select a date first/i })
    
    expect(timeSelect).toMatchObject({
      disabled: true,
      tagName: 'SELECT'
    })
    expect(dateOption).toMatchObject({
      textContent: expect.stringMatching(/select a date first/i)
    })
  })

  it('handles empty arrays from useAvailability hook gracefully', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    // Assert
    const timeSelect = screen.getByTestId('time-select')
    expect(timeSelect).toMatchObject({
      disabled: true,
      tagName: 'SELECT'
    })
    expect(mockFetchAvailability).toHaveBeenCalledTimes(0)
  })

  it('throws error when rendering without provider context', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act & Assert
    expect(() => {
      render(<SchedulingStep />)
    }).toThrow()
  })

  it('verifies fetchAvailability is not called on initial render without date', () => {
    // Arrange
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: mockFetchAvailability,
    })

    // Act
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    // Assert
    expect(mockFetchAvailability).toHaveBeenCalledTimes(0)
    expect(mockFetchAvailability).not.toHaveBeenCalled()
  })

})
