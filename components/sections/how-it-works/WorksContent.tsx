'use client'

import { Button } from '@/components/ui/button'

interface WorksContentProps {
  onBookSessionClick: () => void
}

interface StepData {
  step: string
  title: string
  description: string
}

const steps: StepData[] = [
  {
    step: '1',
    title: 'FREE Discovery Session',
    description:
      'We chat about your goals, challenges, and what you want to achieve. No pressure, just understanding.',
  },
  {
    step: '2',
    title: 'Personalized Plan',
    description:
      'I create a program specifically for you - your fitness level, schedule, and life circumstances.',
  },
  {
    step: '3',
    title: 'Start Your Journey',
    description:
      "Begin with supportive guidance, whether 1-on-1, in small groups, or online. You're never alone!",
  },
  {
    step: '4',
    title: 'Transform & Thrive',
    description:
      'Watch as you become stronger, more confident, and connected with an amazing community of mums.',
  },
]

export function WorksContent({
  onBookSessionClick,
}: WorksContentProps): React.ReactElement {
  return (
    <>
      <WorksDescription />
      <WorksSteps />
      <WorksCTA onBookSessionClick={onBookSessionClick} />
    </>
  )
}

function WorksDescription(): React.ReactElement {
  return (
    <div className="text-center mb-12">
      <p className="text-lg md:text-xl text-stone-700 max-w-3xl mx-auto">
        Bringing feel-good fitness to your doorstep—from Maroochydore and
        Mudjimba to Buderim and Coolum—Mood Over Muscle is your local Sunshine
        Coast M.O.M.unity.
      </p>
    </div>
  )
}

function WorksSteps(): React.ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
      {steps.map((step, index) => (
        <StepCard key={index} step={step} index={index} />
      ))}
    </div>
  )
}

interface StepCardProps {
  step: StepData
  index: number
}

function StepCard({ step, index }: StepCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative">
      <div className="relative mb-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
          {step.step}
        </div>
        {index < 3 && (
          <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-rose-200 to-transparent"></div>
        )}
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
      <p className="text-stone-600 leading-relaxed">{step.description}</p>
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
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        Start Step 1: Book Your FREE Session
      </Button>
    </div>
  )
}
