'use client'

import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

export function AboutContent(): React.ReactElement {
  return (
    <div className="space-y-6 md:space-y-8 text-stone-600 leading-relaxed">
      <p className="text-lg md:text-xl lg:text-2xl font-light">
        I&apos;m a Personal Trainer on the Sunshine Coast who works with people
        who care about their long-term health and movement.
      </p>

      <CertificationLogos />

      <p className="text-base md:text-lg">
        I work with adults across the Sunshine Coast on strength, mobility,
        and training that lasts — whether you&apos;re building from scratch,
        coming back after time off, or training around a specific life stage.
        I also hold specialist credentials in postnatal recovery and senior
        strength.
      </p>

      <CredibilitySection />
      <PhilosophySection />
    </div>
  )
}

function CertificationLogos(): React.ReactElement {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
      <Image
        src="/images/sre-accredited-circle-rgb.png"
        alt="Safe Return to Exercise Certified"
        width={96}
        height={96}
        loading="lazy"
        placeholder="blur"
        blurDataURL="/placeholder.svg"
        className="w-24 h-24 object-contain"
      />
      <Image
        src="/images/ausactive-logo.jpeg"
        alt="AUSactive Trainer"
        width={96}
        height={96}
        loading="lazy"
        placeholder="blur"
        blurDataURL="/placeholder.svg"
        className="w-24 h-24 object-contain"
      />
    </div>
  )
}

function CredibilitySection(): React.ReactElement {
  return (
    <div className="bg-linear-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-3 md:space-y-4">
        <h3 className="font-bold text-stone-800 text-lg md:text-xl">
          Qualifications
        </h3>
        <div className="space-y-2 md:space-y-3">
          <CredibilityPoint text="Cert III & IV in Personal Training" />
          <CredibilityPoint text="Mat-based movement training" />
          <CredibilityPoint text="Certified Postnatal Exercise Specialist (Safe Return to Exercise)" />
          <CredibilityPoint text="Pelvic floor & core restoration training" />
          <CredibilityPoint text="Senior strength, balance & fall-prevention" />
        </div>
      </div>
    </div>
  )
}

function PhilosophySection(): React.ReactElement {
  return (
    <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-3">
        <h3 className="font-bold text-stone-800 text-lg md:text-xl">
          How I Work
        </h3>
        <p className="text-base md:text-lg text-stone-700">
          I&apos;m not interested in flogging people. I don&apos;t program
          workouts that leave you wrecked and call that
          &quot;results.&quot;
        </p>
        <p className="text-base md:text-lg text-stone-700">
          What I care about: technique that holds up under load and fatigue,
          progression that&apos;s gradual enough to stick, and training that
          accounts for where your body is now — not where it was ten years ago.
        </p>
      </div>
    </div>
  )
}

interface CredibilityPointProps {
  text: string
}

function CredibilityPoint({ text }: CredibilityPointProps): React.ReactElement {
  return (
    <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
      <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
      {text}
    </p>
  )
}
