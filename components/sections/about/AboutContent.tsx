'use client'

import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

export function AboutContent(): React.ReactElement {
  return (
    <div className="space-y-6 md:space-y-8 text-stone-600 leading-relaxed">
      <p className="text-lg md:text-xl lg:text-2xl font-light">
        I&apos;m a proud mum of a little tornado named Max and a Certified Safe
        Return to Exercise trainer.
      </p>

      <CertificationLogos />

      <p className="text-base md:text-lg">
        With a background in yoga, Pilates, and fitness training, I help women
        feel strong, supported, and seen.
      </p>

      <CredibilitySection />
      <PersonalMessage />
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
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-3 md:space-y-4">
        <h3 className="font-bold text-stone-800 text-lg md:text-xl">
          Why Mums Choose Me:
        </h3>
        <div className="space-y-2 md:space-y-3">
          <CredibilityPoint text="Experienced Personal Trainer, Cert III and IV in Fitness" />
          <CredibilityPoint text="Certified Postnatal Exercise Specialist" />
          <CredibilityPoint text="Pelvic floor & core restoration expert" />
          <CredibilityPoint text="I'm a mum too - I get it!" />
        </div>
      </div>
    </div>
  )
}

function PersonalMessage(): React.ReactElement {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-base md:text-lg text-stone-700 font-medium">
        💕 &quot;I created MoodOverMuscle because I know how isolating
        motherhood can feel. Let&apos;s lift the mood, one squat (or stretch) at
        a time. You don&apos;t have to do it alone – M.O.M.unity got your back
        (and your core).&quot;
      </p>
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
