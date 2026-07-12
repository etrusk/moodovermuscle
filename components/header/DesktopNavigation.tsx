'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DesktopNavigationProps {
  onBookSessionClick: () => void
}

export function DesktopNavigation({
  onBookSessionClick,
}: DesktopNavigationProps): React.ReactElement {
  return (
    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium ml-auto">
      <Link
        href="/#about"
        className="text-stone-600 hover:text-rose-500 transition-colors duration-300 font-medium relative group"
      >
        About
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href="/classes"
        className="text-stone-600 hover:text-rose-500 transition-colors duration-300 font-medium relative group"
      >
        Classes
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href="/#contact"
        className="text-stone-600 hover:text-rose-500 transition-colors duration-300 font-medium relative group"
      >
        Contact
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href="/#gallery"
        className="text-stone-600 hover:text-rose-500 transition-colors duration-300 font-medium relative group"
      >
        Gallery
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Button
        onClick={onBookSessionClick}
        size="sm"
        className="bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 font-medium group"
      >
        Book a Session
      </Button>
    </nav>
  )
}
