'use client'

import { FooterContent } from './footer/FooterContent'

export function FooterSection(): React.ReactElement {
  return (
    <footer className="w-full py-12 md:py-16 bg-stone-900 text-white relative z-10">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <FooterContent />
      </div>
    </footer>
  )
}
