import * as React from 'react'

export const useCarouselKeyboardHandler = (
  scrollPrev: () => void,
  scrollNext: () => void
): ((event: React.KeyboardEvent<HTMLDivElement>) => void) => {
  return React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )
}
