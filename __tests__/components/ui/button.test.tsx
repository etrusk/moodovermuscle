import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from '@/components/ui/button'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>{TEST_STRINGS.BUTTONS.PRIMARY}</Button>)

    expect(
      screen.getByRole('button', { name: TEST_STRINGS.BUTTONS.PRIMARY })
    ).toBeInTheDocument()
  })

  test('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>{TEST_STRINGS.BUTTONS.PRIMARY}</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>{TEST_STRINGS.BUTTONS.DISABLED}</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders as link when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">{TEST_STRINGS.BUTTONS.LINK}</a>
      </Button>
    )

    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  test('has no accessibility violations', async () => {
    const { container } = render(<Button>{TEST_STRINGS.BUTTONS.PRIMARY}</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('has no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>{TEST_STRINGS.BUTTONS.DISABLED}</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
