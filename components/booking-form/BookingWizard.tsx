'use client'

import React, { useState, useEffect } from 'react'
import { BookingFormData } from './bookingFormLogic'
import { WizardHeader } from './WizardHeader'
import { WizardSteps } from './WizardSteps'
import { WizardNavigation } from './WizardNavigation'
import { useBookingForm } from './BookingFormProvider'

interface BookingWizardProps {
  onClose: () => void
}

const useWizardLogic = (onClose: () => void) => {
  const totalSteps = 3
  const [currentStep, setCurrentStep] = useState(1)
  const { validateStep, submitForm, form, loadingStates } = useBookingForm()
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const handleNext = async (): Promise<void> => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: BookingFormData): Promise<void> => {
    try {
      const result = await submitForm(data)
      if ('error' in result) {
        const conflict = result.error.includes('already booked') || result.error.includes('no longer available')
        setSubmissionError(result.error)
        setCurrentStep(conflict ? 3 : 1)
        form.setValue('time', '')
        return
      }
      setSubmissionSuccess(true)
      setSubmissionError(null)
    } catch (error) {
      console.error('Network error during submission:', error)
      setSubmissionError('Network Error')
      setCurrentStep(1)
    }
  }

  useEffect(() => {
    if (submissionSuccess) {
      const timer = setTimeout(() => onClose(), 0)
      return () => clearTimeout(timer)
    }
  }, [submissionSuccess, onClose])

  return {
    totalSteps,
    currentStep,
    loadingStates,
    submissionSuccess,
    submissionError,
    handleNext,
    handlePrevious,
    handleSubmit,
    form,
  }
}

const SuccessView = (): React.ReactElement => (
  <div className="p-8 text-center" data-testid="booking-confirmation">
    Booking Confirmed!
  </div>
)

const FormView = ({
  currentStep,
  totalSteps,
  loadingStates,
  submissionError,
  handleNext,
  handlePrevious,
}: {
  currentStep: number
  totalSteps: number
  loadingStates: any
  submissionError: string | null
  handleNext: () => Promise<void>
  handlePrevious: () => void
}): React.ReactElement => (
  <>
    {submissionError && (
      <div
        className="p-4 mb-4 text-center text-red-600"
        data-testid="booking-error"
      >
        {submissionError}
      </div>
    )}
    <WizardHeader
      currentStep={currentStep}
      totalSteps={totalSteps}
      isLoading={
        loadingStates.stepTransition || loadingStates.formSubmission
      }
    />
    <div className="p-8">
      <WizardSteps
        currentStep={currentStep}
        isLoading={
          loadingStates.stepTransition || loadingStates.formSubmission
        }
      />
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isNextLoading={loadingStates.stepTransition}
        isSubmitLoading={loadingStates.formSubmission}
        canProceed={
          !loadingStates.stepTransition && !loadingStates.formSubmission
        }
      />
    </div>
  </>
)

export function BookingWizard({ onClose }: BookingWizardProps): React.ReactElement {
  const {
    totalSteps,
    currentStep,
    loadingStates,
    submissionSuccess,
    submissionError,
    handleNext,
    handlePrevious,
    handleSubmit,
    form,
  } = useWizardLogic(onClose)

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {submissionSuccess ? (
        <SuccessView />
      ) : (
        <FormView
          currentStep={currentStep}
          totalSteps={totalSteps}
          loadingStates={loadingStates}
          submissionError={submissionError}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}
    </form>
  )
}
