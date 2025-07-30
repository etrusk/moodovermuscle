'use client'

import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'

interface FinalCtaSectionProps {
  onBookSessionClick: () => void
}

export function FinalCtaSection({ onBookSessionClick }: FinalCtaSectionProps) {
  return (
    <section className="section-height section-white w-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
      <div className="absolute top-20 right-10 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container relative z-10 px-4 md:px-6 text-center max-w-7xl mx-auto section-inner mobile-px">
        <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight pb-2">
              Ready to Transform Your Life?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-rose-100 leading-relaxed font-light max-w-3xl mx-auto">
              Join our amazing M.O.M.unity who&apos;ve already started their
              transformation. Your first session is completely FREE with no
              strings attached!
            </p>
          </div>

          {/* Enhanced Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Sparkles className="h-5 w-5 stroke-1 text-rose-200" />
                <span className="font-bold text-rose-100">
                  100% FREE First Session
                </span>
              </div>
              <p className="text-rose-200 text-sm">
                No payment, no commitment, just come and see what we&apos;re
                about!
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Heart className="h-5 w-5 stroke-1 text-rose-200" />
                <span className="font-bold text-rose-100">
                  Supportive Community
                </span>
              </div>
              <p className="text-rose-200 text-sm">
                Connect with amazing mums who understand your journey.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Users className="h-5 w-5 stroke-1 text-rose-200" />
                <span className="font-bold text-rose-100">Expert Guidance</span>
              </div>
              <p className="text-rose-200 text-sm">
                Certified trainer with specialized postnatal expertise.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 justify-center pt-4 max-w-sm mx-auto md:max-w-none">
            <Button
              onClick={onBookSessionClick}
              size="lg"
              className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold hover:scale-105 w-full md:w-auto group pulse-glow"
            >
              Book Your FREE Session Now
              <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-rose-100 text-sm">
              ⚡ Quick booking • 📞 Instant confirmation • 💯 No pressure
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row justify-center md:gap-8 pt-8 md:pt-12 border-t border-white/20">
            <div className="flex items-center gap-3 justify-center text-rose-100">
              <MapPin className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
              <span className="text-base md:text-lg">Sunshine Coast, QLD</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-rose-100">
              <Mail className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
              <span className="text-base md:text-lg">
                moodovermuscle@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
