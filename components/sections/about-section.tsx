'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface AboutSectionProps {
  onBookSessionClick: () => void
}

export function AboutSection({ onBookSessionClick }: AboutSectionProps) {
  return (
    <section id="about" className="section-height section-white w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 md:-inset-8 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-3xl blur-3xl"></div>
            <Image
              src="/images/emily-portrait.jpeg"
              width={600}
              height={700}
              alt="Emily, founder of MoodOverMuscle"
              className="relative rounded-3xl object-cover shadow-3xl w-full aspect-[4/5] hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="space-y-8 md:space-y-10 order-1 lg:order-2">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-lg hover:scale-105 transition-transform">
                <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                Meet Your Trainer
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent leading-tight pb-2">
                Hi mama, I&apos;m Emily
              </h2>
            </div>

            <div className="space-y-6 md:space-y-8 text-stone-600 leading-relaxed">
              <p className="text-lg md:text-xl lg:text-2xl font-light">
                I&apos;m a proud mum of a little tornado named Max and a
                Certified Safe Return to Exercise trainer.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <Image
                  src="/images/sre-accredited-circle-rgb.png"
                  width={96}
                  height={96}
                  alt="Safe Return to Exercise Certified"
                  className="w-24 h-24 object-contain"
                />
                <Image
                  src="/images/ausactive-logo.jpeg"
                  width={96}
                  height={96}
                  alt="AUSactive Trainer"
                  className="w-24 h-24 object-contain"
                />
              </div>

              <p className="text-base md:text-lg">
                With a background in yoga, Pilates, and fitness training, I help
                women feel strong, supported, and seen.
              </p>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="space-y-3 md:space-y-4">
                  <h3 className="font-bold text-stone-800 text-lg md:text-xl">
                    Why Mums Choose Me:
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                      Experienced Personal Trainer, Cert III and IV in Fitness
                    </p>
                    <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                      Certified Postnatal Exercise Specialist
                    </p>
                    <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                      Pelvic floor & core restoration expert
                    </p>
                    <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                      I&apos;m a mum too - I get it!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                <p className="text-base md:text-lg text-stone-700 font-medium">
                  💕 &quot;I created MoodOverMuscle because I know how isolating
                  motherhood can feel. Let&apos;s lift the mood, one squat (or
                  stretch) at a time. You don&apos;t have to do it alone –
                  M.O.M.unity got your back (and your core).&quot;
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
              <Button
                onClick={onBookSessionClick}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full group"
              >
                Start Your FREE Session
                <ChevronRight className="ml-2 h-3 md:h-4 w-3 md:w-4 stroke-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
