import type React from 'react'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/next'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'MoodOverMuscle — Personal Training',
  description:
    'Personal training on the Sunshine Coast — strength, movement, and sustainable progress. Specialisations in postnatal recovery and senior strength.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
