'use client'

import Image from 'next/image'

export function HeroBackground(): React.ReactElement {
  return (
    <>
      <Image
        src="/images/mom-group.jpeg"
        alt="Group of mothers exercising"
        fill
        priority
        className="absolute inset-0 object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
    </>
  )
}
