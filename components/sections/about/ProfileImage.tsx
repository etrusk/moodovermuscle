'use client'

import Image from 'next/image'

export function ProfileImage(): React.ReactElement {
  return (
    <div className="relative order-2 lg:order-1">
      <div className="absolute -inset-6 md:-inset-8 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-3xl blur-3xl"></div>
      <Image
        src="/images/emily-portrait.jpeg"
        alt="Emilia, founder of Mood Over Muscle"
        width={600}
        height={700}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
        priority
        placeholder="blur"
        blurDataURL="/placeholder.svg"
        className="relative rounded-3xl object-cover shadow-3xl w-full aspect-[4/5] hover:scale-105 transition-transform duration-700"
      />
    </div>
  )
}
