'use client'

import { Instagram } from 'lucide-react'
import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
  span?: string
}

const mobileImages: GalleryImage[] = [
  { src: '/images/gallery-1.jpeg', alt: 'M.O.M.unity group celebrating' },
  { src: '/images/gallery-5.jpeg', alt: 'Outdoor fitness class' },
  { src: '/images/gallery-9.jpeg', alt: 'Mums and bubs group' },
  { src: '/images/gallery-4.jpeg', alt: 'High five celebration' },
  { src: '/images/gallery-2.jpeg', alt: 'Sunset workout' },
  { src: '/images/gallery-10.jpeg', alt: 'Energetic workout' },
]

const desktopImages: GalleryImage[] = [
  {
    src: '/images/gallery-1.jpeg',
    alt: 'M.O.M.unity group celebrating',
    span: 'md:col-span-2',
  },
  { src: '/images/gallery-5.jpeg', alt: 'Outdoor fitness class' },
  { src: '/images/gallery-9.jpeg', alt: 'Mums and bubs group' },
  { src: '/images/gallery-4.jpeg', alt: 'High five celebration' },
  {
    src: '/images/gallery-2.jpeg',
    alt: 'Sunset workout',
    span: 'md:col-span-2',
  },
  { src: '/images/gallery-10.jpeg', alt: 'Energetic workout' },
  { src: '/images/gallery-6.jpeg', alt: 'Emilia portrait' },
  { src: '/images/gallery-7.jpeg', alt: 'Workout in progress' },
]

export function GalleryGrid(): React.ReactElement {
  return (
    <>
      {/* Mobile Gallery - 2 columns */}
      <div className="grid gap-4 grid-cols-2 md:hidden">
        {mobileImages.map((image, index) => (
          <GalleryImageCard key={index} image={image} isMobile />
        ))}
      </div>

      {/* Desktop Gallery */}
      <div className="hidden md:grid gap-6 md:gap-8 grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {desktopImages.map((image, index) => (
          <GalleryImageCard key={index} image={image} />
        ))}
      </div>
    </>
  )
}

interface GalleryImageCardProps {
  image: GalleryImage
  isMobile?: boolean
}

// Size/spacing variants collapsed into a single object so the card stays under
// the complexity budget (one branch instead of one ternary per attribute).
const CARD_VARIANTS = {
  mobile: {
    radius: 'rounded-2xl',
    width: 200,
    height: 200,
    sizes: '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    imageClass: 'aspect-square shadow-lg',
    captionPosition: 'bottom-3 left-3',
    iconSize: 'h-4 w-4',
  },
  desktop: {
    radius: 'rounded-3xl',
    width: 400,
    height: 300,
    sizes: '(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw',
    imageClass: 'h-full shadow-xl',
    captionPosition: 'bottom-6 left-6',
    iconSize: 'h-5 w-5',
  },
} as const

function GalleryImageCard({
  image,
  isMobile = false,
}: GalleryImageCardProps): React.ReactElement {
  const variant = isMobile ? CARD_VARIANTS.mobile : CARD_VARIANTS.desktop
  return (
    <div
      className={`relative group overflow-hidden ${variant.radius} hover:scale-105 transition-transform duration-500 ${image.span ?? ''}`}
    >
      <Image
        src={image.src || '/placeholder.svg'}
        alt={image.alt}
        width={variant.width}
        height={variant.height}
        sizes={variant.sizes}
        loading="lazy"
        placeholder="blur"
        blurDataURL="/placeholder.svg"
        className={`w-full ${variant.imageClass} object-cover transition-all duration-700 group-hover:scale-110`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div
        className={`absolute ${variant.captionPosition} text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      >
        <Instagram className={`${variant.iconSize} stroke-1`} />
      </div>
    </div>
  )
}
