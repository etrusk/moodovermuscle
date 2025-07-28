"use client"

import type React from "react"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for development
    console.error('Application error:', error)
    
    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo/Brand */}
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

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
            Something went wrong
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed max-w-lg mx-auto">
            Hi lovely! We&apos;ve hit a little bump in the road. Don&apos;t worry - these things happen, and we&apos;re here to help get you back on track.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Development Error Details:</h3>
            <pre className="text-sm text-red-700 overflow-auto">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Helpful Message */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100">
          <h3 className="font-semibold text-stone-800 mb-3">What can you do?</h3>
          <ul className="text-stone-600 space-y-2 text-left">
            <li>• Try refreshing the page - sometimes that&apos;s all it takes!</li>
            <li>• Check your internet connection</li>
            <li>• If the problem persists, please contact us</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
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

        {/* Contact Information */}
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
      </div>
    </div>
  )
}