'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking-form'
import { HeroSection } from '@/components/sections/hero-section'
import { FooterSection } from '@/components/sections/footer-section'
import { Skeleton } from '@/components/ui/skeleton'

const AboutSection = dynamic(
  () =>
    import('@/components/sections/about-section').then(mod => mod.AboutSection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  }
)

const HowItWorksSection = dynamic(
  () =>
    import('@/components/sections/how-it-works-section').then(
      mod => mod.HowItWorksSection
    ),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  }
)

const GallerySection = dynamic(
  () =>
    import('@/components/sections/gallery-section').then(
      mod => mod.GallerySection
    ),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  }
)

const LocationContactSection = dynamic(
  () =>
    import('@/components/sections/location-contact-section').then(
      mod => mod.LocationContactSection
    ),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  }
)

const FinalCtaSection = dynamic(
  () =>
    import('@/components/sections/final-cta-section').then(
      mod => mod.FinalCtaSection
    ),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  }
)

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleBookSessionClick = () => {
    setIsBookingOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header onBookSessionClick={handleBookSessionClick} />

      <main className="flex-1 relative z-10">
        <HeroSection onBookSessionClick={handleBookSessionClick} />
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
          <AboutSection onBookSessionClick={handleBookSessionClick} />
          <HowItWorksSection onBookSessionClick={handleBookSessionClick} />
          <GallerySection />
          <LocationContactSection />
          <FinalCtaSection onBookSessionClick={handleBookSessionClick} />
        </Suspense>
      </main>

      <FooterSection />

      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  )
}
