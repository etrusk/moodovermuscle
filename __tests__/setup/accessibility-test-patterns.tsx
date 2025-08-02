import React from 'react'
import { render } from '@testing-library/react'
import { assertNoAccessibilityViolations } from './accessibility-utils'

/**
 * Standard accessibility test suite for any component.
 *
 * @param Component - React component to test.
 * @param props - Props to pass to the component.
 * @param testName - Optional name for the test case.
 */
export function standardAccessibilityTestSuite(
  Component: React.ComponentType<unknown>,
  props: Record<string, unknown> = {},
  testName?: string
): void {
  const name = testName || Component.displayName || Component.name || 'Component'
  describe(`${name} Accessibility Tests`, () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Component {...props} />)
      await assertNoAccessibilityViolations(container)
    })
  })
}

/**
 * Form-specific accessibility test patterns.
 *
 * @param FormComponent - React component rendering a form.
 * @param props - Props to pass to the form component.
 */
export function formAccessibilityTests(
  FormComponent: React.ComponentType<unknown>,
  props: Record<string, unknown> = {}
): void {
  describe('Form Accessibility Tests', () => {
    it('form container should have no accessibility violations', async () => {
      const { container } = render(<FormComponent {...props} />)
      const form = container.querySelector('form')
      if (!form) {
        throw new Error('Form element not found in component')
      }
      await assertNoAccessibilityViolations(form)
    })

    it('all inputs have associated labels', () => {
      const { getByLabelText, container } = render(<FormComponent {...props} />)
      const inputs = container.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        const name = input.getAttribute('name') || input.getAttribute('aria-label') || ''
        expect(() => getByLabelText(name)).not.toThrow()
      })
    })
  })
}

/**
 * Interactive component accessibility pattern.
 *
 * @param Component - React component with interactive behavior.
 * @param props - Props to pass to the component.
 * @param interactions - Array of functions performing user interactions.
 */
export function interactiveAccessibilityTests(
  Component: React.ComponentType<unknown>,
  props: Record<string, unknown> = {},
  interactions: Array<(container: HTMLElement) => Promise<void>>
): void {
  const name = Component.displayName || Component.name || 'InteractiveComponent'
  describe(`${name} Interactive Accessibility Tests`, () => {
    it('interactive sequence should have no accessibility violations', async () => {
      const { container } = render(<Component {...props} />)
      for (const action of interactions) {
        await action(container as HTMLElement)
      }
      await assertNoAccessibilityViolations(container)
    })
  })
}