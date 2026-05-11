'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface HeroContentProps {
  onBookSessionClick: () => void
}

export function HeroContent({
  onBookSessionClick,
}: HeroContentProps): React.ReactElement {
  return (
    <div className="space-y-6 md:space-y-10 text-center max-w-5xl mx-auto">
      <HeroHeading />
      <HeroDescription />
      <HeroValues />
      <HeroCTA onBookSessionClick={onBookSessionClick} />
    </div>
  )
}

function HeroHeading(): React.ReactElement {
  return (
    <div className="space-y-4 md:space-y-8">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight pb-2">
        <span className="text-white block animate-fade-in-up drop-shadow-2xl">
          MoodOverMuscle
        </span>
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl text-white leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up delay-400 drop-shadow-lg">
        Personal training for people who care about how they move — not just
        how they look.
      </p>
    </div>
  )
}

function HeroDescription(): React.ReactElement {
  return (
    <div className="space-y-4 animate-fade-in-up delay-500">
      <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
        Strength, mobility, and movement that holds up over time — for adults
        who want training that respects how their body actually works.
      </p>
      <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
        I also have specialist training in postnatal recovery and senior
        strength, so mums returning to exercise and older adults staying
        independent are in good hands.
      </p>
    </div>
  )
}

function HeroValues(): React.ReactElement {
  return (
    <div className="animate-fade-in-up delay-600">
      <p className="text-lg md:text-xl text-white font-medium drop-shadow-lg">
        Good technique. Gradual progression. Respect for your body.
      </p>
    </div>
  )
}

interface HeroCTAProps {
  onBookSessionClick: () => void
}

function HeroCTA({ onBookSessionClick }: HeroCTAProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 md:gap-4 max-w-sm mx-auto lg:max-w-none lg:mx-0 animate-fade-in-up delay-600">
      <Button
        onClick={onBookSessionClick}
        size="lg"
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 md:px-10 py-5 md:py-7 text-lg md:text-xl font-bold hover:scale-105 w-full group"
      >
        Book a Free Session
        <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
