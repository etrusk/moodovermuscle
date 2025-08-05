'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Logo(): React.ReactElement {
  return (
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
  )
}
