import * as React from 'react'
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react'

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1]

export const useCarouselState = (
  orientation: 'horizontal' | 'vertical',
  opts?: CarouselOptions,
  plugins?: CarouselPlugin
): {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi
  canScrollPrev: boolean
  canScrollNext: boolean
  onSelect: (api: CarouselApi) => void
  scrollPrev: () => void
  scrollNext: () => void
} => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  return {
    carouselRef,
    api,
    canScrollPrev,
    canScrollNext,
    onSelect,
    scrollPrev,
    scrollNext,
  }
}
