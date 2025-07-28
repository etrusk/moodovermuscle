"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookingForm } from "@/components/booking-form"
import { Sparkles, Menu, X } from "lucide-react"

export function Header() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-20 md:h-24 items-center px-4 md:px-6 max-w-7xl mx-auto">
          <div className="mr-4 md:mr-6 flex">
            <Link href="/" className="flex items-center group relative">
              <div className="relative z-10">
                <div className="absolute -inset-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full opacity-20"></div>
                <Image
                  src="/images/logo.png"
                  width={80}
                  height={80}
                  alt="MoodOverMuscle"
                  className="md:w-[80px] md:h-[80px] relative rounded-full transition-all duration-300 group-hover:scale-110 shadow-2xl ring-4 ring-white/80 hover:ring-rose-200/80"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
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
              onClick={() => setIsBookingOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 font-medium group"
            >
              Start FREE
              <Sparkles className="ml-2 h-3 w-3 stroke-1 group-hover:rotate-12 transition-transform" />
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden ml-auto hover:bg-rose-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 stroke-1" /> : <Menu className="h-5 w-5 stroke-1" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl animate-fade-in-up">
            <div className="container px-4 py-6 space-y-4 max-w-7xl mx-auto">
              <Link
                href="/#about"
                className="block text-lg font-medium text-stone-700 hover:text-rose-500 transition-colors py-3 border-b border-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/classes"
                className="block text-lg font-medium text-stone-700 hover:text-rose-500 transition-colors py-3 border-b border-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Classes
              </Link>
              <Link
                href="/#contact"
                className="block text-lg font-medium text-stone-700 hover:text-rose-500 transition-colors py-3 border-b border-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/#gallery"
                className="block text-lg font-medium text-stone-700 hover:text-rose-500 transition-colors py-3 border-b border-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Button
                onClick={() => {
                  setIsBookingOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full py-4 text-lg font-medium mt-4 shadow-lg"
              >
                Start Your FREE Session
                <Sparkles className="ml-2 h-4 w-4 stroke-1" />
              </Button>
            </div>
          </div>
        )}
      </header>
      <BookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  )
}