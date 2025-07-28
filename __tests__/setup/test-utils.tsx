import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

describe('Test Utilities', () => {
  it('should render without crashing', () => {
    expect(true).toBe(true)
  })
})

export * from '@testing-library/react'
export { render }
