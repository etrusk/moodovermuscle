import { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export class PlaywrightAccessibilityTester {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Run axe-core accessibility analysis on the page or a specific selector scope.
   * Throws an error if any violations are found.
   *
   * @param selector Optional CSS selector to scope the analysis. Defaults to entire page.
   */
  async assertNoViolations(selector?: string, excludeRules?: string[]): Promise<void> {
    const builder = new AxeBuilder({ page: this.page })
      .withTags(['wcag2aa', 'wcag2a', 'wcag21aa'])
    
    if (selector) {
      // Verify the selector exists before including it
      const elementExists = await this.page.locator(selector).count() > 0
      if (!elementExists) {
        throw new Error(`Accessibility test failed: Selector "${selector}" not found on page`)
      }
      builder.include(selector)
    }
    
    if (excludeRules && excludeRules.length > 0) {
      builder.disableRules(excludeRules)
    }
    
    const results = await builder.analyze()
    if (results.violations.length > 0) {
      const violationMessages = results.violations
        .map(v => {
          const nodes = v.nodes
            .map(n => `  Selector: ${n.target.join(', ')}\n    Failure Summary: ${n.failureSummary}`)
            .join('\n')
          return `Violation: ${v.id} - ${v.help}\nImpact: ${v.impact}\n${nodes}`
        })
        .join('\n\n')
      throw new Error(`Accessibility violations found:\n\n${violationMessages}`)
    }
  }

  /**
   * Navigate to a page and assert no accessibility violations on load.
   *
   * @param url Path or full URL to navigate to.
   * @param selector Optional CSS selector scope for analysis.
   */
  async checkPage(url: string, selector?: string, excludeRules?: string[]): Promise<void> {
    await this.page.goto(url)
    await this.assertNoViolations(selector, excludeRules)
  }
}