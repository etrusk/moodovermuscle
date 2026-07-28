/**
 * lucide-react v1 removed every brand icon, so the Instagram mark is kept
 * locally. These assertions pin the glyph to what lucide 0.454 rendered, so a
 * future edit can't silently change the mark in the footer and gallery.
 */
import { describe, expect, test } from 'vitest'

import React from 'react'
import { render } from '@/__tests__/setup/test-utils'
import '@testing-library/jest-dom'
import { InstagramIcon } from '@/components/ui/instagram-icon'

describe('InstagramIcon', () => {
  test('renders the lucide 0.454 glyph geometry', () => {
    const { container } = render(<InstagramIcon />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('fill', 'none')

    expect(container.querySelector('rect')).toHaveAttribute('rx', '5')
    expect(container.querySelector('path')).toHaveAttribute(
      'd',
      'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'
    )
    expect(container.querySelector('line')).toHaveAttribute('x1', '17.5')
  })

  test('applies caller className alongside the lucide defaults', () => {
    const { container } = render(<InstagramIcon className="h-4 w-4 stroke-1" />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveClass('lucide', 'lucide-instagram', 'h-4', 'w-4', 'stroke-1')
  })
})
