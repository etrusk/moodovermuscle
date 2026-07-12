'use client'

import { Button } from '@/components/ui/button'
import { Dumbbell, Heart, Move } from 'lucide-react'

interface WorksContentProps {
  onBookSessionClick: () => void
}

interface ServiceData {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  points: string[]
}

const services: ServiceData[] = [
  {
    icon: <Dumbbell className="h-8 w-8 stroke-1 text-rose-500" />,
    title: 'General Fitness',
    subtitle: 'Personal Training',
    description:
      "Strength and conditioning built around how you actually move. No fads, no flogging — just training that adds up.",
    points: [
      'Technique-first programming',
      'Gradual, sustainable progression',
      'Strength and conditioning that lasts',
      'Flexible location (home, park, studio)',
    ],
  },
  {
    icon: <Move className="h-8 w-8 stroke-1 text-rose-500" />,
    title: 'Movement on Mat',
    subtitle: 'Better Movement',
    description:
      'Mat-based movement principles that improve everything else — control, mobility, and how you carry load.',
    points: [
      'Core control',
      'Spinal mobility',
      'Shoulder stability',
      'Breath mechanics',
    ],
  },
  {
    icon: <Heart className="h-8 w-8 stroke-1 text-rose-500" />,
    title: 'Specialty Programs',
    subtitle: 'Postnatal & Senior Training',
    description:
      'Dedicated programming for mums returning to exercise and older adults staying strong and independent.',
    points: [
      'Postnatal pelvic floor & core restoration',
      'Senior strength & stability',
      'Balance and fall prevention',
      'Safe, gradual return to full training',
    ],
  },
]

export function WorksContent({
  onBookSessionClick,
}: WorksContentProps): React.ReactElement {
  return (
    <>
      <WorksDescription />
      <ServiceCards />
      <WorksCTA onBookSessionClick={onBookSessionClick} />
    </>
  )
}

function WorksDescription(): React.ReactElement {
  return (
    <div className="text-center mb-12">
      <p className="text-lg md:text-xl text-stone-700 max-w-3xl mx-auto">
        Whether you&apos;re starting fresh, coming back after a break, or
        training around a specific life stage — there&apos;s a place for you
        here.
      </p>
    </div>
  )
}

function ServiceCards(): React.ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      {services.map((service, index) => (
        <ServiceCard key={index} service={service} />
      ))}
    </div>
  )
}

interface ServiceCardProps {
  service: ServiceData
}

function ServiceCard({ service }: ServiceCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-r from-rose-100 to-pink-100 flex items-center justify-center shadow-lg">
          {service.icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-1 text-center">
        {service.title}
      </h3>
      <p className="text-sm font-medium text-rose-600 mb-4 text-center">
        {service.subtitle}
      </p>
      <p className="text-stone-600 leading-relaxed mb-4">
        {service.description}
      </p>
      <ul className="space-y-2">
        {service.points.map((point, index) => (
          <li
            key={index}
            className="text-stone-600 text-sm flex items-start gap-2"
          >
            <span className="text-rose-400 mt-1">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface WorksCTAProps {
  onBookSessionClick: () => void
}

function WorksCTA({ onBookSessionClick }: WorksCTAProps): React.ReactElement {
  return (
    <div className="text-center mt-16">
      <Button
        onClick={onBookSessionClick}
        className="bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        Book a Free Session
      </Button>
    </div>
  )
}
