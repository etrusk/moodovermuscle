'use client'

import { HeroBackground } from './hero/HeroBackground'
import { HeroContent } from './hero/HeroContent'

interface HeroSectionProps {
  onBookSessionClick: () => void
}

export function HeroSection({
  onBookSessionClick,
}: HeroSectionProps): React.ReactElement {
  return (
    <section className="section-height section-white w-full overflow-hidden relative">
      <HeroBackground />
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <div className="grid gap-8 md:gap-12 items-center">
          <HeroContent onBookSessionClick={onBookSessionClick} />
        </div>
      </div>
    </section>
  )
}
