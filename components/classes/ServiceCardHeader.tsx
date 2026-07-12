'use client'

import React from 'react'

interface ServiceCardHeaderProps {
  popular?: boolean
  comingSoon?: boolean
}

export function ServiceCardHeader({ popular, comingSoon }: ServiceCardHeaderProps): React.JSX.Element {
  return (
    <>
      {popular && (
        <div className="absolute -top-1 left-6 bg-linear-to-r from-amber-400 to-orange-400 text-amber-900 px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
          Most Popular ⭐
        </div>
      )}
      {comingSoon && (
        <div className="absolute -top-1 right-6 bg-linear-to-r from-blue-400 to-cyan-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
          Coming Soon 🚀
        </div>
      )}
    </>
  )
}