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

export function BookingWizard({ onClose }: BookingWizardProps) {
  const totalSteps = 3
  const [currentStep, setCurrentStep] = useState(1)
  const [isStepLoading, setIsStepLoading] = useState(false)
  const { validateStep, submitForm, isSubmitting } = useBookingForm()

  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const handleNext = async () => {
    setIsStepLoading(true)
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prevStep => prevStep + 1)
    }
    setIsStepLoading(false)
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const { form } = useBookingForm()
  const handleSubmit = async (data: BookingFormData) => {
    try {
      const result = await submitForm(data)
      if (result.error) {
        setSubmissionError('Booking failed. Please try again.')
        setCurrentStep(1)
      } else {
        setSubmissionSuccess(true)
        setSubmissionError(null)
      }
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

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {!submissionSuccess && (
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
            isLoading={isStepLoading || isSubmitting}
          />
          <div className="p-8">
            <WizardSteps currentStep={currentStep} isLoading={isStepLoading || isSubmitting} />
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isNextLoading={isStepLoading}
              isSubmitLoading={isSubmitting}
              canProceed={!isStepLoading && !isSubmitting}
            />
          </div>
        </>
      )}
      {submissionSuccess && (
        <div className="p-8 text-center" data-testid="booking-confirmation">
          Booking Confirmed!
        </div>
      )}
    </form>
  )
}
