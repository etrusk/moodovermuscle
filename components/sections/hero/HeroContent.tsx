'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronRight, Sparkles } from 'lucide-react'

interface HeroContentProps {
  onBookSessionClick: () => void
}

export function HeroContent({
  onBookSessionClick,
}: HeroContentProps): React.ReactElement {
  return (
    <div className="space-y-6 md:space-y-10 text-center max-w-5xl mx-auto">
      <FreeBadge />
      <HeroHeading />
      <HeroDescription />
      <BenefitsList />
      <HeroCTA onBookSessionClick={onBookSessionClick} />
      <HeroFooter />
    </div>
  )
}

function FreeBadge(): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold shadow-xl border border-green-300 animate-pulse">
      <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
      <span className="text-xs md:text-sm">
        Your First Session is 100% FREE!
      </span>
    </div>
  )
}

function HeroHeading(): React.ReactElement {
  return (
    <div className="space-y-4 md:space-y-8">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight pb-2">
        <span className="text-white block animate-fade-in-up drop-shadow-2xl">
          Welcome to
        </span>
        <span className="text-white block animate-fade-in-up delay-200 drop-shadow-2xl">
          MoodOverMuscle 💗
        </span>
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl text-white leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up delay-400 drop-shadow-lg">
        Because strength isn&apos;t just about muscles – it&apos;s about mood,
        too.
      </p>
    </div>
  )
}

function HeroDescription(): React.ReactElement {
  return (
    <div className="space-y-4 animate-fade-in-up delay-500">
      <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
        Hi lovely! If you&apos;re a mama (or just a woman with a lot on her
        plate), you&apos;re in the right place.
      </p>
      <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
        We know getting back to exercise after baby, burnout or &quot;just
        life&quot; is no small feat.
      </p>
    </div>
  )
}

function BenefitsList(): React.ReactElement {
  const benefits = [
    'We rebuild from the inside out – pelvic floor, core, confidence, and calm.',
    'We check for abdominal separation (diastasis recti) and tailor your training safely.',
    'Bring your baby, your messy bun, your tired legs – all welcome here.',
    'We take our training seriously… but not ourselves. Laughter is part of the program.',
  ]

  return (
    <ul className="space-y-3 text-lg md:text-xl text-white max-w-3xl mx-auto">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 stroke-2 text-green-400 mt-1 flex-shrink-0 drop-shadow-lg" />
          <span className="drop-shadow-lg">{benefit}</span>
        </li>
      ))}
    </ul>
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
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 md:px-10 py-5 md:py-7 text-lg md:text-xl font-bold hover:scale-105 w-full group pulse-glow"
      >
        Book Your FREE Session
        <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="text-center text-sm md:text-base text-white/90 drop-shadow-lg">
        💯 No commitment required • 100% risk-free • No credit card needed
      </div>
    </div>
  )
}

function HeroFooter(): React.ReactElement {
  return (
    <div className="text-center text-lg md:text-xl text-white font-semibold animate-fade-in-up delay-800 drop-shadow-lg">
      Let&apos;s lift the mood, one muscle at a time.
      <br />
      Join M.O.M.unity - we are stronger together.
    </div>
  )
}
