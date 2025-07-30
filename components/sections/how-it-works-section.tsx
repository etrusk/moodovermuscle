'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface HowItWorksSectionProps {
  onBookSessionClick: () => void
}

export function HowItWorksSection({
  onBookSessionClick,
}: HowItWorksSectionProps) {
  return (
    <section className="section-height section-pink w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-white/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-xl hover:scale-105 transition-transform">
            <Calendar className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
            How It Works
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
            Your Journey to Transformation
          </h2>
        </div>

        <div className="text-center mb-12">
          <p className="text-lg md:text-xl text-stone-700 max-w-3xl mx-auto">
            Bringing feel-good fitness to your doorstep—from Maroochydore and
            Mudjimba to Buderim and Coolum—Mood Over Muscle is your local
            Sunshine Coast M.O.M.unity.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {[
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
          ].map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {step.step}
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-rose-200 to-transparent"></div>
                )}
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                {step.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            onClick={onBookSessionClick}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Start Step 1: Book Your FREE Session
          </Button>
        </div>
      </div>
    </section>
  )
}
