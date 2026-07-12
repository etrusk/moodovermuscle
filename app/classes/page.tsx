'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronRight,
  Users,
  Sparkles,
  MapPin,
} from 'lucide-react'
import { ServiceCardHeader } from '@/components/classes/ServiceCardHeader'
import { ServiceCardContent } from '@/components/classes/ServiceCardContent'
import { ServiceCardActions } from '@/components/classes/ServiceCardActions'

const services = [
  {
    icon: Users,
    title: '1-on-1 Personal Training',
    description:
      'Completely personalized program designed just for you and your goals.',
    price: '$80',
    gradient: 'from-rose-500 to-pink-500',
    popular: true,
    features: [
      'Fully customized workout plans',
      'Flexible location (home, park, studio)',
      'Programs adapted to any stage of life',
      'One-on-one guidance & support',
    ],
  },
]

const HeroSection = (): React.ReactElement => (
  <section className="section-height section-pink w-full overflow-hidden">
    <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
      <div className="text-center space-y-8 md:space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-linear-to-r from-green-400 to-emerald-400 text-green-900 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold shadow-xl border border-green-300 animate-pulse">
            <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
            <span className="text-xs md:text-sm">
              Your First Session is 100% FREE!
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-linear-to-r from-stone-900 via-rose-600 to-rose-500 bg-clip-text text-transparent block animate-fade-in-up">
              Choose Your Perfect
            </span>
            <span className="bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent block animate-fade-in-up delay-200">
              Training Option
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-stone-600 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up delay-400">
            Every option includes supportive, one-on-one coaching — and your
            first session is completely FREE!
          </p>
        </div>

        <div className="bg-linear-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg max-w-4xl mx-auto animate-fade-in-up delay-600">
          <div className="flex items-center gap-3 justify-center mb-4">
            <MapPin className="h-5 w-5 stroke-1 text-rose-600" />
            <h3 className="font-bold text-stone-800 text-lg md:text-xl">
              Service Areas
            </h3>
          </div>
          <p className="text-stone-700 text-base md:text-lg">
            Bringing feel-good fitness to your doorstep—from Maroochydore
            and Mudjimba to Buderim and Coolum—MoodOverMuscle is your
            local Sunshine Coast personal training service.
          </p>
        </div>
      </div>
    </div>
  </section>
)

const ServicesSection = ({ onBookSessionClick }: { onBookSessionClick: () => void }): React.ReactElement => (
  <section className="section-height section-white w-full">
    <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
      <div className="grid gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} onBookSessionClick={onBookSessionClick} />
        ))}
      </div>
    </div>
  </section>
)

const ServiceCard = ({ service, onBookSessionClick }: { service: typeof services[0], onBookSessionClick: () => void }): React.ReactElement => (
  <Card
    className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/90 backdrop-blur-xs overflow-hidden hover:scale-105 relative"
  >
    <ServiceCardHeader popular={service.popular} />

    <CardContent className="p-10 space-y-8 pt-12">
      <ServiceCardContent
        icon={service.icon}
        title={service.title}
        description={service.description}
        price={service.price}
        features={service.features}
      />

      <ServiceCardActions
        gradient={service.gradient}
        onBookSessionClick={onBookSessionClick}
      />
    </CardContent>
  </Card>
)

const CtaSection = ({ onBookSessionClick }: { onBookSessionClick: () => void }): React.ReactElement => (
  <section className="section-height section-pink w-full bg-linear-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-linear-to-r from-black/10 to-transparent"></div>
    <div className="absolute top-20 right-10 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-10 left-20 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

    <div className="container relative z-10 px-4 md:px-6 text-center max-w-7xl mx-auto section-inner mobile-px">
      <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-rose-100 leading-relaxed font-light max-w-3xl mx-auto">
            Book your FREE session today and discover why Sunshine Coast
            locals choose MoodOverMuscle!
          </p>
        </div>

        <div className="flex flex-col gap-4 md:gap-6 justify-center pt-4 max-w-sm mx-auto md:max-w-none">
          <Button
            size="lg"
            onClick={onBookSessionClick}
            className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold hover:scale-105 w-full md:w-auto group pulse-glow"
          >
            Book Your FREE Session Now
            <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-rose-100 text-sm">
            ⚡ Quick booking • 📞 Instant confirmation • 💯 No pressure
          </p>
        </div>

        <div className="text-center pt-8 md:pt-12 border-t border-white/20">
          <Link
            href="/"
            className="text-rose-100 hover:text-white font-medium text-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  </section>
)

export default function ClassesPage(): React.ReactElement {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleBookSessionClick = (): void => {
    setIsBookingOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header onBookSessionClick={handleBookSessionClick} />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <ServicesSection onBookSessionClick={handleBookSessionClick} />
        <CtaSection onBookSessionClick={handleBookSessionClick} />
      </main>

      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  )
}
