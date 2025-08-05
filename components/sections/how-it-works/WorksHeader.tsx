'use client'

import { Calendar } from 'lucide-react'

export function WorksHeader(): React.ReactElement {
  return (
    <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
      <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-white/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-xl hover:scale-105 transition-transform">
        <Calendar className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
        How It Works
      </div>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
        Your Journey to Transformation
      </h2>
    </div>
  )
}
