"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Heart } from "lucide-react"

const NotFoundHeader = (): React.ReactElement => (
  <div className="flex justify-center mb-8">
    <div className="relative">
      <div className="absolute -inset-3 bg-linear-to-r from-rose-400 to-pink-400 rounded-full blur-xl opacity-40"></div>
      <Image
        src="/images/logo.png"
        width={80}
        height={80}
        alt="MoodOverMuscle"
        className="relative rounded-full shadow-2xl ring-4 ring-white/80"
      />
    </div>
  </div>
)

const NotFoundMessage = (): React.ReactElement => (
  <div className="space-y-4">
    <h1 className="text-6xl md:text-8xl font-bold bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
      404
    </h1>
    <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
      Oops! Page Not Found
    </h2>
    <p className="text-lg text-stone-600 leading-relaxed max-w-lg mx-auto">
      Hi lovely! It looks like this page has gone for a walk. Don&apos;t
      worry - let&apos;s get you back to where you need to be.
    </p>
  </div>
)

const HelpfulMessage = (): React.ReactElement => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100">
    <div className="flex items-center justify-center gap-2 mb-4">
      <Heart className="h-5 w-5 text-rose-500" />
      <span className="font-semibold text-stone-800">MoodOverMuscle Support</span>
    </div>
    <p className="text-stone-600">
      Looking for something specific? You can always head back to our
      homepage or get in touch - we&apos;re here to help!
    </p>
  </div>
)

const ActionButtons = (): React.ReactElement => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button
      asChild
      className="bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
    >
      <Link href="/">
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
    </Button>
    
    <Button
      asChild
      variant="outline"
      className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <Link href="#contact">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Contact Us
      </Link>
    </Button>
  </div>
)

const ContactInfo = (): React.ReactElement => (
  <div className="text-sm text-stone-500 space-y-2">
    <p>Still having trouble? Reach out to us:</p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="tel:0406846416" 
        className="hover:text-rose-600 transition-colors font-medium"
      >
        📞 0406 846 416
      </a>
      <a 
        href="mailto:moodovermuscle@gmail.com" 
        className="hover:text-rose-600 transition-colors font-medium"
      >
        ✉️ moodovermuscle@gmail.com
      </a>
    </div>
  </div>
)

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <NotFoundHeader />
        <NotFoundMessage />
        <HelpfulMessage />
        <ActionButtons />
        <ContactInfo />
      </div>
    </div>
  )
}