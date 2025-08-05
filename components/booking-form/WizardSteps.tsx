'use client'

import React from 'react'
import { PersonalDetailsStep } from './steps/PersonalDetailsStep'
import { ServiceSelectionStep } from './steps/ServiceSelectionStep'
import { SchedulingStep } from './steps/SchedulingStep'

interface WizardStepsProps {
  currentStep: number
  isLoading?: boolean
}

export function WizardSteps({ currentStep, isLoading = false }: WizardStepsProps): React.ReactElement | null {
  switch (currentStep) {
    case 1:
      return <PersonalDetailsStep isLoading={isLoading} />
    case 2:
      return <ServiceSelectionStep isLoading={isLoading} />
    case 3:
      return <SchedulingStep isLoading={isLoading} />
    default:
      return null
  }
}
