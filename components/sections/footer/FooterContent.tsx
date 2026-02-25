'use client'

import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function FooterContent(): React.ReactElement {
  return (
    <div className="grid gap-8 md:gap-12 md:grid-cols-3">
      <FooterAbout />
      <FooterLinks />
      <FooterSocial />
    </div>
  )
}

function FooterAbout(): React.ReactElement {
  return (
    <div className="space-y-4 md:space-y-6 text-center md:text-left">
      <Image
        src="/images/logo.png"
        width={48}
        height={48}
        alt="MoodOverMuscle"
        className="rounded-full shadow-lg mx-auto md:mx-0 hover:scale-110 transition-transform"
      />
      <p className="text-stone-400 leading-relaxed text-base md:text-lg">
        Personal training on the Sunshine Coast — postnatal recovery, senior
        strength, and movement that lasts.
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
  )
}

function FooterLinks(): React.ReactElement {
  const links = [
    { href: '#about', label: 'About' },
    { href: '/classes', label: 'Classes' },
    { href: '#contact', label: 'Contact' },
    { href: '#gallery', label: 'Gallery' },
  ]

  return (
    <div className="space-y-4 md:space-y-6 text-center md:text-left">
      <h3 className="font-bold text-lg md:text-xl">Quick Links</h3>
      <div className="space-y-2 md:space-y-3 text-stone-400">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function FooterSocial(): React.ReactElement {
  return (
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
        © 2026 Mood Over Muscle. All rights reserved.
      </p>
    </div>
  )
}
