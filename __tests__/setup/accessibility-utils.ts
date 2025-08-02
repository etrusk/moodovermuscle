import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Conditionally import userEvent only in JSDOM environment
let userEvent: any = null
if (typeof window !== 'undefined') {
  // Dynamic import to avoid loading in Node.js environment
  userEvent = require('@testing-library/user-event').default
}

/**
 * Run axe on the provided container and assert no accessibility violations.
 * @param container - The DOM container to test.
 */
export async function assertNoAccessibilityViolations(container: Element | string) {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

/**
 * Simulate a Tab key press.
 */
export async function simulateTab(): Promise<void> {
  if (!userEvent) {
    throw new Error('userEvent is not available in Node.js environment')
  }
  await userEvent.tab()
}

/**
 * Assert that tabbing through the provided elements follows the expected order.
 * @param selectors - Array of selectors for elements in expected tab order.
 */
export async function assertTabOrder(
  selectors: Array<string>
): Promise<void> {
  // Start from document body
  (document.body as HTMLElement).focus()
  for (const sel of selectors) {
    await simulateTab()
    const active = document.activeElement
    if (typeof sel === 'string') {
      const el = (active as HTMLElement).closest(sel)
      expect(el).toBeTruthy()
    } else {
      // Matcher functions can be implemented as needed
      // Placeholder: uses querySelector with toString of matcher
      const el = document.activeElement
      expect(el).toBeTruthy()
    }
  }
}

/**
 * Utility to query by role with accessible name.
 * @param role - ARIA role.
 * @param name - Accessible name.
 */
export function getByRoleAndName(
  role: string,
  name: string
): HTMLElement {
  const query = `[role="${role}"][name="${name}"], [aria-label="${name}"]`
  const el = document.querySelector(query)
  if (!el) {
    throw new Error(`Element with role="${role}" and name="${name}" not found`)
  }
  return el as HTMLElement
}