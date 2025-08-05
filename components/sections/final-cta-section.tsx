'use client'

import { CtaBackground } from './final-cta/CtaBackground'
import { CtaContent } from './final-cta/CtaContent'

interface FinalCtaSectionProps {
  onBookSessionClick: () => void
}

export function FinalCtaSection({
  onBookSessionClick,
}: FinalCtaSectionProps): React.ReactElement {
  return (
    <section className="section-height section-white w-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
      <CtaBackground />
      <div className="container relative z-10 px-4 md:px-6 text-center max-w-7xl mx-auto section-inner mobile-px">
        <CtaContent onBookSessionClick={onBookSessionClick} />
      </div>
    </section>
  )
}
