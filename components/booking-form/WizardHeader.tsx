'use client'

import React from 'react'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  isLoading?: boolean
}

export function WizardHeader({
  currentStep,
  totalSteps,
  isLoading,
}: WizardHeaderProps): React.ReactElement {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <DialogHeader className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white">
      <div className="relative p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles className="h-3 w-3 stroke-1" />
          100% FREE Session
        </div>
        <div className="relative z-10 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-6 w-6 stroke-1" />
            </div>
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-bold">
                Book Your FREE Session
              </DialogTitle>
              <DialogDescription className="text-green-100 text-sm">
                No payment required • No commitment • Just come and try!
              </DialogDescription>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-green-100 mb-2">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={cn(
                  'bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500 ease-out',
                  isLoading && 'animate-pulse'
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </DialogHeader>
  )
}
