"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

const ErrorHeader = (): React.ReactElement => (
  <div className="flex justify-center mb-8">
    <div className="relative">
      <div className="absolute -inset-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-xl opacity-40"></div>
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

const ErrorIcon = (): React.ReactElement => (
  <div className="flex justify-center">
    <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-rose-100">
      <AlertTriangle className="h-12 w-12 text-red-600" />
    </div>
  </div>
)

const ErrorMessage = (): React.ReactElement => (
  <div className="space-y-4">
    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
      500
    </h1>
    <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
      Server Error
    </h2>
    <p className="text-lg text-stone-600 leading-relaxed max-w-lg mx-auto">
      Hi lovely! Our server is having a little moment. We&apos;re working on getting
      everything back to normal as quickly as possible.
    </p>
  </div>
)

const HelpfulMessage = (): React.ReactElement => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100">
    <h3 className="font-semibold text-stone-800 mb-3">What happened?</h3>
    <p className="text-stone-600 mb-4">
      This is a temporary server issue on our end. It&apos;s not something you
      did - we&apos;re already working on fixing it!
    </p>
    <ul className="text-stone-600 space-y-2 text-left">
      <li>• Try refreshing the page in a few minutes</li>
      <li>• Check our social media for updates</li>
      <li>• If it&apos;s urgent, please contact us directly</li>
    </ul>
  </div>
)

const ActionButtons = ({ onRefresh }: { onRefresh: () => void }): React.ReactElement => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button
      onClick={onRefresh}
      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Try Again
    </Button>
    
    <Button
      asChild
      variant="outline"
      className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <Link href="/">
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
    </Button>
  </div>
)

const ContactInfo = (): React.ReactElement => (
  <div className="text-sm text-stone-500 space-y-2">
    <p>Need immediate help? Get in touch:</p>
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

const StatusMessage = (): React.ReactElement => (
  <div className="text-xs text-stone-400">
    <p>Error ID: {Date.now().toString(36)} • {new Date().toLocaleString()}</p>
  </div>
)

export default function Custom500(): React.ReactElement {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <ErrorHeader />
        <ErrorIcon />
        <ErrorMessage />
        <HelpfulMessage />
        <ActionButtons onRefresh={() => router.refresh()} />
        <ContactInfo />
        <StatusMessage />
      </div>
    </div>
  )
}