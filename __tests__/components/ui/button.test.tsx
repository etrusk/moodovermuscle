/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for button component testing, removed TEST_STRINGS dependency
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from '@/components/ui/button'
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)

    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument()
  })

  test('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders as link when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    )

    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  test('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('has no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
