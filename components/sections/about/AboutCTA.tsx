'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface AboutCTAProps {
  onBookSessionClick: () => void
}

export function AboutCTA({
  onBookSessionClick,
}: AboutCTAProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
      <Button
        onClick={onBookSessionClick}
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full group"
      >
        Start Your FREE Session
        <ChevronRight className="ml-2 h-3 md:h-4 w-3 md:w-4 stroke-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
