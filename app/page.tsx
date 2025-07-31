'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking-form'
import { HeroSection } from '@/components/sections/hero-section'
import { FooterSection } from '@/components/sections/footer-section'
import { AboutSection } from '@/components/sections/about-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { GallerySection } from '@/components/sections/gallery-section'
import { LocationContactSection } from '@/components/sections/location-contact-section'
import { FinalCtaSection } from '@/components/sections/final-cta-section'

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
        <AboutSection onBookSessionClick={handleBookSessionClick} />
        <HowItWorksSection onBookSessionClick={handleBookSessionClick} />
        <GallerySection />
        <LocationContactSection />
        <FinalCtaSection onBookSessionClick={handleBookSessionClick} />
      </main>

      <FooterSection />

      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  )
}
