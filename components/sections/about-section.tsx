'use client'

import { ProfileImage } from './about/ProfileImage'
import { AboutHeader } from './about/AboutHeader'
import { AboutContent } from './about/AboutContent'
import { AboutCTA } from './about/AboutCTA'

interface AboutSectionProps {
  onBookSessionClick: () => void
}

export function AboutSection({
  onBookSessionClick,
}: AboutSectionProps): React.ReactElement {
  return (
    <section id="about" className="section-height section-white w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          <ProfileImage />
          <div className="space-y-8 md:space-y-10 order-1 lg:order-2">
            <AboutHeader />
            <AboutContent />
            <AboutCTA onBookSessionClick={onBookSessionClick} />
          </div>
        </div>
      </div>
    </section>
  )
}
