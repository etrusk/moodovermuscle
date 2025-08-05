import * as React from 'react'
import type { UseEmblaCarouselType } from 'embla-carousel-react'

type CarouselApi = UseEmblaCarouselType[1]

export const useCarouselEffects = (
  api: CarouselApi,
  setApi?: (api: CarouselApi) => void,
  onSelect?: (api: CarouselApi) => void
): void => {
  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api || !onSelect) {
      return
    }

    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])
}
