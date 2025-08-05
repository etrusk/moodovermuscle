'use client'

import { WorksHeader } from './how-it-works/WorksHeader'
import { WorksContent } from './how-it-works/WorksContent'

interface HowItWorksSectionProps {
  onBookSessionClick: () => void
}

export function HowItWorksSection({
  onBookSessionClick,
}: HowItWorksSectionProps): React.ReactElement {
  return (
    <section className="section-height section-pink w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <WorksHeader />
        <WorksContent onBookSessionClick={onBookSessionClick} />
      </div>
    </section>
  )
}
