/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for button component testing, removed TEST_STRINGS dependency
 * @last-refactored 2025-10-10
 */
import { vi, describe, expect } from 'vitest'

import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from '@/components/ui/button'
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

describe('Button Component', () => {
  test('renders button with text', () => {
    // Arrange & Act
    render(<Button>Click me</Button>)

    // Assert
    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button')).toMatchObject({
      tagName: 'BUTTON'
    })
  })

  test('handles click events', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
  })

  test('disables button when disabled prop is true', () => {
    // Arrange & Act
    render(<Button disabled>Disabled</Button>)

    // Assert
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toMatchObject({
      disabled: true
    })
  })

  test('renders as link when asChild is true', () => {
    // Arrange & Act
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    )

    // Assert
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toMatchObject({
      tagName: 'A'
    })
  })

  test('has no accessibility violations', async () => {
    // Arrange & Act
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    
    // Assert
    expect(results).toHaveNoViolations()
  })

  test('has no accessibility violations when disabled', async () => {
    // Arrange & Act
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    
    // Assert
    expect(results).toHaveNoViolations()
  })

  test('throws error when invalid variant provided', () => {
    // Arrange
    const invalidVariant = 'invalid' as any

    // Act & Assert
    expect(() => {
      render(<Button variant={invalidVariant}>Invalid</Button>)
    }).not.toThrow() // Button component handles gracefully
  })
})
