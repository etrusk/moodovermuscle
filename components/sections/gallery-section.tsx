"use client"

import { Instagram } from "lucide-react"
import Image from "next/image"

export function GallerySection() {
  return (
    <section id="gallery" className="section-height section-white w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-lg hover:scale-105 transition-transform">
            <Instagram className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
            Gallery
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
            M.O.M.unity in Action
          </h2>
        </div>

        <div className="max-w-4xl mx-auto mb-12 text-center">
          <p className="text-lg text-stone-700 leading-relaxed">
            Hi Mama! I see you..Between the nappies, meetings, bedtime chaos and reheated coffee, we know carving
            out time for yourself feels like a luxury. But here's a little secret: moving your body isn't just about
            squats or stretchy pants – it's your daily dose of sanity, strength and self-care.
          </p>
          <p className="text-lg text-stone-700 leading-relaxed mt-4">
            At MoodOverMuscle, we believe movement is medicine – for your physical body and your mental health.
            This is your space to rebuild from the inside out, safely and sustainably. No "bouncing back", no
            six-pack pressure. Just real support for real women. Whether you're postpartum, peri-menopausal, or just
            overdue for "you-time" – you're in the right place.
          </p>
        </div>

        {/* Mobile Gallery - 2 columns */}
        <div className="grid gap-4 grid-cols-2 md:hidden">
          {[
            { src: "/images/gallery-1.jpeg", alt: "M.O.M.unity group celebrating" },
            { src: "/images/gallery-5.jpeg", alt: "Outdoor fitness class" },
            { src: "/images/gallery-9.jpeg", alt: "Mums and bubs group" },
            { src: "/images/gallery-4.jpeg", alt: "High five celebration" },
            { src: "/images/gallery-2.jpeg", alt: "Sunset workout" },
            { src: "/images/gallery-10.jpeg", alt: "Energetic workout" },
          ].map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-500"
            >
              <Image
                src={image.src || "/placeholder.svg"}
                width={200}
                height={200}
                alt={image.alt}
                className="w-full aspect-square object-cover transition-all duration-700 group-hover:scale-110 shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Instagram className="h-4 w-4 stroke-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Gallery */}
        <div className="hidden md:grid gap-6 md:gap-8 grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
          {[
            { src: "/images/gallery-1.jpeg", alt: "M.O.M.unity group celebrating", span: "md:col-span-2" },
            { src: "/images/gallery-5.jpeg", alt: "Outdoor fitness class" },
            { src: "/images/gallery-9.jpeg", alt: "Mums and bubs group" },
            { src: "/images/gallery-4.jpeg", alt: "High five celebration" },
            { src: "/images/gallery-2.jpeg", alt: "Sunset workout", span: "md:col-span-2" },
            { src: "/images/gallery-10.jpeg", alt: "Energetic workout" },
            { src: "/images/gallery-6.jpeg", alt: "Emilia portrait" },
            { src: "/images/gallery-7.jpeg", alt: "Workout in progress" },
          ].map((image, index) => (
            <div
              key={index}
              className={`relative group overflow-hidden rounded-3xl hover:scale-105 transition-transform duration-500 ${
                image.span || ""
              }`}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                width={400}
                height={300}
                alt={image.alt}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Instagram className="h-5 w-5 stroke-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}