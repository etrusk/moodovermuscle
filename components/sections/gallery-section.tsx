'use client'

import { GalleryHeader } from './gallery/GalleryHeader'
import { GalleryDescription } from './gallery/GalleryDescription'
import { GalleryGrid } from './gallery/GalleryGrid'

export function GallerySection(): React.ReactElement {
  return (
    <section id="gallery" className="section-height section-white w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
        <GalleryHeader />
        <GalleryDescription />
        <GalleryGrid />
      </div>
    </section>
  )
}
