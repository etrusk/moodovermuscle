'use client'

import React from 'react'
import { PersonalDetailsStep } from './steps/PersonalDetailsStep'
import { ServiceSelectionStep } from './steps/ServiceSelectionStep'
import { SchedulingStep } from './steps/SchedulingStep'

interface WizardStepsProps {
  currentStep: number
}

export function WizardSteps({ currentStep }: WizardStepsProps) {
  switch (currentStep) {
    case 1:
      return <PersonalDetailsStep />
    case 2:
      return <ServiceSelectionStep />
    case 3:
      return <SchedulingStep />
    default:
      return null
  }
}
