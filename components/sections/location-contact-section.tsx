'use client'

import { ContactHeader } from './location-contact/ContactHeader'
import { ContactCards } from './location-contact/ContactCards'

export function LocationContactSection(): React.ReactElement {
  return (
    <section id="contact" className="section-height section-pink w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <ContactHeader />
        <ContactCards />
      </div>
    </section>
  )
}
