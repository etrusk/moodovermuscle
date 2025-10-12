/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for button state testing
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BookingWizard } from '@/components/booking-form/BookingWizard'
import {
  BookingFormProvider,
  useBookingForm,
} from '@/components/booking-form/BookingFormProvider'
import { Dialog, DialogContent } from '@/components/ui/dialog'

jest.mock('@/components/booking-form/BookingFormProvider', () => ({
  ...jest.requireActual('@/components/booking-form/BookingFormProvider'),
  useBookingForm: jest.fn(),
}))

const useBookingFormMock = useBookingForm as jest.Mock

describe('BookingWizard', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderInDialog = (
    logic: Partial<ReturnType<typeof useBookingForm>>
  ) => {
    useBookingFormMock.mockReturnValue({
      form: {
        handleSubmit:
          (fn: () => Promise<void>) => (e?: React.BaseSyntheticEvent) => {
            if (e) e.preventDefault()
            fn()
          },
      },
      ...logic,
    })

    return render(
      <BookingFormProvider onClose={jest.fn()}>
        <Dialog open={true}>
          <DialogContent>
            <BookingWizard onClose={jest.fn()} />
          </DialogContent>
        </Dialog>
      </BookingFormProvider>
    )
  }

  it('should show step transition loading state and disable button', () => {
    // Arrange
    const mockLoadingStates = {
      stepTransition: true,
      formSubmission: false,
      fieldValidation: {},
      calendarLoading: false,
    }

    // Act
    renderInDialog({
      loadingStates: mockLoadingStates,
    })

    // Assert
    const continueButton = screen.getByRole('button', { name: /validating/i })
    expect(continueButton).toMatchObject({
      disabled: true,
      textContent: expect.stringMatching(/validating/i)
    })
    const validatingText = screen.getByText(/validating/i)
    expect(validatingText).toMatchObject({
      textContent: expect.stringMatching(/validating/i)
    })
  })

  it('should show submission loading state and disable button', () => {
    // Arrange
    const mockLoadingStates = {
      stepTransition: false,
      formSubmission: true,
      fieldValidation: {},
      calendarLoading: false,
    }
    // We need to be on the last step for the submit button to be visible
    // but for this unit test, we can just check the continue button

    // Act
    renderInDialog({
      loadingStates: mockLoadingStates,
    })

    // Assert
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toMatchObject({
      disabled: true
    })
  })

  it('throws error when onClose is not provided', () => {
    // Arrange
    useBookingFormMock.mockReturnValue({
      form: {
        handleSubmit:
          (fn: () => Promise<void>) => (e?: React.BaseSyntheticEvent) => {
            if (e) e.preventDefault()
            fn()
          },
      },
    })

    // Act & Assert
    expect(() => {
      render(
        <BookingFormProvider onClose={jest.fn()}>
          <Dialog open={true}>
            <DialogContent>
              <BookingWizard onClose={undefined as any} />
            </DialogContent>
          </Dialog>
        </BookingFormProvider>
      )
    }).toThrow()
  })

  it('verifies onClose is not called on initial render', () => {
    // Arrange
    const mockOnClose = jest.fn()
    const mockLoadingStates = {
      stepTransition: false,
      formSubmission: false,
      fieldValidation: {},
      calendarLoading: false,
    }

    useBookingFormMock.mockReturnValue({
      form: {
        handleSubmit:
          (fn: () => Promise<void>) => (e?: React.BaseSyntheticEvent) => {
            if (e) e.preventDefault()
            fn()
          },
      },
      loadingStates: mockLoadingStates,
    })

    // Act
    render(
      <BookingFormProvider onClose={mockOnClose}>
        <Dialog open={true}>
          <DialogContent>
            <BookingWizard onClose={mockOnClose} />
          </DialogContent>
        </Dialog>
      </BookingFormProvider>
    )

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(0)
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
