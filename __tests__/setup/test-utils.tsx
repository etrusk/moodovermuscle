import React from 'react'
import { render as rtlRender } from '@testing-library/react'

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  return rtlRender(ui, { ...renderOptions })
}

describe('Test Utilities', () => {
  it('should render without crashing', () => {
    expect(true).toBe(true)
  })
})

export * from '@testing-library/react'
export { render }
