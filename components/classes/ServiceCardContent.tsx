'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'

interface ServiceCardContentProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  price: string
  features: string[]
}

export function ServiceCardContent({
  icon: Icon,
  title,
  description,
  price,
  features
}: ServiceCardContentProps): React.JSX.Element {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
      <div className="inline-flex p-6 rounded-3xl bg-linear-to-r from-rose-500 to-pink-500 shadow-xl group-hover:scale-110 transition-transform">
        <Icon className="h-8 w-8 stroke-1 text-white" />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-2xl md:text-3xl font-bold text-stone-900">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-rose-600">
              {price}
            </div>
            <div className="text-lg text-stone-500">
              per session
            </div>
          </div>
        </div>

        <p className="text-stone-600 leading-relaxed text-lg">
          {description}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, featureIndex) => (
            <div
              key={featureIndex}
              className="flex items-center gap-3 text-stone-600"
            >
              <CheckCircle className="h-4 w-4 stroke-1 text-rose-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}