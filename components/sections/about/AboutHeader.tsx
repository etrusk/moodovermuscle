'use client'

import { Sparkles } from 'lucide-react'

export function AboutHeader(): React.ReactElement {
  return (
    <div className="space-y-4 md:space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-lg hover:scale-105 transition-transform">
        <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
        Meet Your Trainer
      </div>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent leading-tight pb-2">
        Hi, I&apos;m Emilia
      </h2>
    </div>
  )
}
