'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Loader2, ArrowRight } from 'lucide-react'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isNextLoading?: boolean
  isSubmitLoading?: boolean
  canProceed: boolean
}

const BackButton = ({
  onPrevious,
  isNextLoading,
  isSubmitLoading,
}: {
  onPrevious: () => void
  isNextLoading: boolean
  isSubmitLoading: boolean
}): React.ReactElement => (
  <Button
    type="button"
    variant="outline"
    onClick={onPrevious}
    className="flex-1"
    disabled={isNextLoading || isSubmitLoading}
    data-testid="booking-form-back-button"
  >
    Back
  </Button>
)

const NextButton = ({
  onNext,
  canProceed,
  isNextLoading,
}: {
  onNext: () => void
  canProceed: boolean
  isNextLoading: boolean
}): React.ReactElement => (
  <Button
    type="button"
    onClick={onNext}
    className="flex-1"
    disabled={!canProceed || isNextLoading}
    aria-busy={isNextLoading}
    data-testid="booking-form-continue-button"
  >
    {isNextLoading ? (
      <>
        <Loader2 className="animate-spin mr-2 h-4 w-4" />
        Validating...
      </>
    ) : (
      <>
        Continue <ArrowRight className="ml-2 h-5 w-5 stroke-1" />
      </>
    )}
  </Button>
)

const SubmitButton = ({
  canProceed,
  isSubmitLoading,
}: {
  canProceed: boolean
  isSubmitLoading: boolean
}): React.ReactElement => (
  <Button
    type="submit"
    className="flex-1"
    disabled={!canProceed || isSubmitLoading}
    aria-busy={isSubmitLoading}
    data-testid="booking-form-submit-button"
  >
    {isSubmitLoading ? (
      <>
        <Loader2 className="animate-spin mr-2 h-4 w-4" />
        Booking...
      </>
    ) : (
      'Book My FREE Session! 🎉'
    )}
  </Button>
)

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextLoading = false,
  isSubmitLoading = false,
  canProceed,
}: WizardNavigationProps): React.ReactElement {
  return (
    <DialogFooter className="flex gap-4 pt-6">
      {currentStep > 1 && (
        <BackButton
          onPrevious={onPrevious}
          isNextLoading={isNextLoading}
          isSubmitLoading={isSubmitLoading}
        />
      )}
      {currentStep < totalSteps ? (
        <NextButton
          onNext={onNext}
          canProceed={canProceed}
          isNextLoading={isNextLoading}
        />
      ) : (
        <SubmitButton
          canProceed={canProceed}
          isSubmitLoading={isSubmitLoading}
        />
      )}
    </DialogFooter>
  )
}
