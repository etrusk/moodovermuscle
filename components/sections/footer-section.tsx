'use client'

import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function FooterSection() {
  return (
    <footer className="w-full py-12 md:py-16 bg-stone-900 text-white relative z-10">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid gap-8 md:gap-12 md:grid-cols-3">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <Image
              src="/images/logo.png"
              width={48}
              height={48}
              alt="MoodOverMuscle"
              className="rounded-full shadow-lg mx-auto md:mx-0 hover:scale-110 transition-transform"
            />
            <p className="text-stone-400 leading-relaxed text-base md:text-lg">
              Building a supportive community for mums on the Sunshine Coast
              through fitness, wellness, and connection.
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <p className="text-stone-400 text-sm">
                Certificate 3&4 in Personal Training
                <br />
                Certified Safe Return To Exercise Trainer
                <br />
                AUSactive Trainer
              </p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <h3 className="font-bold text-lg md:text-xl">Quick Links</h3>
            <div className="space-y-2 md:space-y-3 text-stone-400">
              <Link
                href="#about"
                className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
              >
                About Emily
              </Link>
              <Link
                href="/classes"
                className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
              >
                Classes
              </Link>
              <Link
                href="#contact"
                className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
              >
                Contact
              </Link>
              <Link
                href="#gallery"
                className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
              >
                Gallery
              </Link>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <h3 className="font-bold text-lg md:text-xl">Follow Us</h3>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button
                size="sm"
                variant="ghost"
                aria-label="Visit Instagram"
                className="text-stone-400 hover:text-white hover:bg-white/10 rounded-full p-3 hover:scale-110 transition-all"
              >
                <Instagram className="h-4 md:h-5 w-4 md:w-5 stroke-1" />
              </Button>
            </div>
            <p className="text-stone-400 text-base md:text-lg">
              © 2025 MoodOverMuscle. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
