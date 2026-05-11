'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight, Heart, Mail, MapPin, Sparkles, Users } from 'lucide-react'

interface CtaContentProps {
  onBookSessionClick: () => void
}

export function CtaContent({
  onBookSessionClick,
}: CtaContentProps): React.ReactElement {
  return (
    <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
      <CtaHeader />
      <CtaBenefits />
      <CtaButton onBookSessionClick={onBookSessionClick} />
      <CtaFooter />
    </div>
  )
}

function CtaHeader(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight pb-2">
        Ready to Move Better?
      </h2>
      <p className="text-lg md:text-xl lg:text-2xl text-rose-100 leading-relaxed font-light max-w-3xl mx-auto">
        If you&apos;re after long-term health, moving well, and feeling capable
        in your own body — get in touch. We&apos;ll figure out where to start.
      </p>
    </div>
  )
}

function CtaBenefits(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
      <BenefitCard
        icon={<Sparkles className="h-5 w-5 stroke-1 text-rose-200" />}
        title="Free First Session"
        description="No payment, no commitment — just come and see if it's right for you."
      />
      <BenefitCard
        icon={<Heart className="h-5 w-5 stroke-1 text-rose-200" />}
        title="Training That Fits You"
        description="Programs adapted to your body, your stage of life, and your goals."
      />
      <BenefitCard
        icon={<Users className="h-5 w-5 stroke-1 text-rose-200" />}
        title="Real Expertise"
        description="Certified personal trainer with specialisations in postnatal recovery, senior strength, and mat-based movement."
      />
    </div>
  )
}

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function BenefitCard({
  icon,
  title,
  description,
}: BenefitCardProps): React.ReactElement {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 justify-center mb-3">
        {icon}
        <span className="font-bold text-rose-100">{title}</span>
      </div>
      <p className="text-rose-200 text-sm">{description}</p>
    </div>
  )
}

interface CtaButtonProps {
  onBookSessionClick: () => void
}

function CtaButton({ onBookSessionClick }: CtaButtonProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 md:gap-6 justify-center pt-4 max-w-sm mx-auto md:max-w-none">
      <Button
        onClick={onBookSessionClick}
        size="lg"
        className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold hover:scale-105 w-full md:w-auto group"
      >
        Book a Free Session
        <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}

function CtaFooter(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 md:flex-row justify-center md:gap-8 pt-8 md:pt-12 border-t border-white/20">
      <div className="flex items-center gap-3 justify-center text-rose-100">
        <MapPin className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
        <span className="text-base md:text-lg">Sunshine Coast, QLD</span>
      </div>
      <div className="flex items-center gap-3 justify-center text-rose-100">
        <Mail className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
        <span className="text-base md:text-lg">moodovermuscle@gmail.com</span>
      </div>
    </div>
  )
}
