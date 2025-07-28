"use client"

import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/sections/hero-section"
import { FooterSection } from "@/components/sections/footer-section"
import { Skeleton } from "@/components/ui/skeleton"

const AboutSection = dynamic(
  () => import("@/components/sections/about-section").then(mod => mod.AboutSection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  },
)

const HowItWorksSection = dynamic(
  () => import("@/components/sections/how-it-works-section").then(mod => mod.HowItWorksSection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  },
)

const GallerySection = dynamic(
  () => import("@/components/sections/gallery-section").then(mod => mod.GallerySection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  },
)

const LocationContactSection = dynamic(
  () => import("@/components/sections/location-contact-section").then(mod => mod.LocationContactSection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  },
)

const FinalCtaSection = dynamic(
  () => import("@/components/sections/final-cta-section").then(mod => mod.FinalCtaSection),
  {
    loading: () => <Skeleton className="w-full h-screen" />,
  },
)

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex-1 relative z-10">
        <HeroSection setIsBookingOpen={setIsBookingOpen} />
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
          <AboutSection setIsBookingOpen={setIsBookingOpen} />
          <HowItWorksSection setIsBookingOpen={setIsBookingOpen} />
          <GallerySection />
          <LocationContactSection />
          <FinalCtaSection setIsBookingOpen={setIsBookingOpen} />
        </Suspense>
      </main>

      <FooterSection />
    </div>
  )
}
