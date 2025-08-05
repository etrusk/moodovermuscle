'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface ServiceCardActionsProps {
  comingSoon?: boolean
  gradient: string
  onBookSessionClick: () => void
}

export function ServiceCardActions({ comingSoon, gradient, onBookSessionClick }: ServiceCardActionsProps): React.JSX.Element {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pt-6 border-t border-stone-100">
      <Button
        disabled={comingSoon}
        onClick={
          !comingSoon
            ? onBookSessionClick
            : undefined
        }
        className={`flex-1 lg:flex-none lg:px-8 bg-gradient-to-r ${gradient} hover:shadow-xl text-white rounded-full transition-all duration-300 py-6 text-lg font-medium group disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {comingSoon
          ? 'Coming Soon'
          : 'Start FREE Session'}
        {!comingSoon && (
          <ArrowRight className="ml-2 h-4 w-4 stroke-1 group-hover:translate-x-1 transition-transform" />
        )}
      </Button>

      {!comingSoon && (
        <div className="text-center lg:text-left text-sm text-stone-500 flex items-center justify-center lg:justify-start">
          💯 First session completely FREE • No commitment
          required
        </div>
      )}
    </div>
  )
}