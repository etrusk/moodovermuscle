/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for select/option testing
 * @last-refactored 2025-10-10
 */
import React from 'react';
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { SchedulingStep } from '@/components/booking-form/steps/SchedulingStep'
import * as useAvailability from '@/components/booking-form/useAvailability'

// Mock the useAvailability hook
jest.mock('@/components/booking-form/useAvailability')
const mockedUseAvailability = useAvailability.useAvailability as jest.Mock

describe('SchedulingStep', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('disables controls when isLoading prop is true', () => {
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: jest.fn(),
      availabilityCache: {},
    })

    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep isLoading={true} />
      </BookingFormProvider>
    )

    expect(screen.getByTestId('date-picker-trigger')).toBeDisabled()
    expect(screen.getByTestId('time-select')).toBeDisabled()
    expect(screen.getByTestId('message-textarea')).toBeDisabled()
  })

  it('shows loading state for time slots when availability is being fetched', () => {
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: true,
      fetchAvailability: jest.fn(),
      availabilityCache: {},
    })

    render(
      <BookingFormProvider onClose={() => {}} initialValues={{ date: new Date() }}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    expect(screen.getByTestId('time-select')).toBeDisabled()
    expect(screen.getByRole('option', { name: /loading slots/i })).toBeInTheDocument()
  })

  it('displays available and booked time slots correctly', async () => {
    mockedUseAvailability.mockReturnValue({
      availableTimes: ['09:00', '11:00'],
      bookedTimes: ['10:00'],
      loadingAvailability: false,
      fetchAvailability: jest.fn(),
      availabilityCache: {},
    })

    render(
      <BookingFormProvider onClose={() => {}} initialValues={{ date: new Date() }}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    const timeSelect = screen.getByTestId('time-select')
    expect(timeSelect).toBeEnabled()

    // Use findByRole to wait for options to appear
    const availableOption = await screen.findByRole('option', { name: '9:00 AM' })
    const bookedOption = await screen.findByRole('option', {
      name: '10:00 AM (Booked)',
    })
    const anotherAvailableOption = await screen.findByRole('option', {
      name: '11:00 AM',
    })

    expect(availableOption).toBeInTheDocument()
    expect(availableOption).not.toBeDisabled()

    expect(bookedOption).toBeInTheDocument()
    expect(bookedOption).toBeDisabled()

    expect(anotherAvailableOption).toBeInTheDocument()
    expect(anotherAvailableOption).not.toBeDisabled()
  })

  it('shows "Select a date first" when no date is selected', () => {
    mockedUseAvailability.mockReturnValue({
      availableTimes: [],
      bookedTimes: [],
      loadingAvailability: false,
      fetchAvailability: jest.fn(),
      availabilityCache: {},
    })

    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep />
      </BookingFormProvider>
    )

    expect(screen.getByTestId('time-select')).toBeDisabled()
    expect(screen.getByRole('option', { name: /select a date first/i })).toBeInTheDocument()
  })
})
