+++
[metadata]
type = "implementation_pattern"
complexity = 4
priority = "medium"
phase = 2
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "customizable email content, A/B testing"
blocking_deployment = false
user_experience_impact = "medium"
performance_impact = "low"

[technical_details]
files_affected = 4
appetite_estimate = "1-2 days"
dependencies = ["React Email", "template engine", "email service"]
integration_points = ["email notifications", "admin dashboard", "content management"]
+++

# Pattern: Dynamic Email Templates with A/B Testing and Customization

**Complexity**: Medium (3-4)
**Files Affected**: 4-5 files (template engine, admin UI, email service, database schema)
**Prerequisites**: Email service setup, React Email or template engine, admin authentication
**Use Cases**: Customizable email content, A/B testing campaigns, personalized messaging, marketing automation

## Context & Problem

**When to Use**: When business needs flexible email content management, A/B testing capabilities, or personalized email experiences
**Problem Solved**: Eliminates hardcoded email templates, enables marketing experimentation, provides content personalization without code changes
**Appetite Scope**: 1-2 days for basic template management, 2-3 days with A/B testing and advanced personalization

## Solution Overview

Implements a flexible email template system with dynamic content, variable substitution, A/B testing capabilities, and admin-friendly template management interface.

## Implementation Details

### Code Structure

```typescript
// lib/email/template-engine.ts
import React from 'react'
import { render } from '@react-email/render'
import Handlebars from 'handlebars'
import { prisma } from '@/lib/prisma'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: EmailVariable[]
  isActive: boolean
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface EmailVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'url'
  defaultValue?: string
  description: string
  required: boolean
}

export interface EmailContext {
  user?: {
    firstName?: string
    lastName?: string
    email: string
  }
  booking?: {
    id: string
    service: string
    date: string
    time: string
  }
  business?: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  custom?: Record<string, any>
}

export class DynamicEmailTemplateEngine {
  private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>()

  constructor() {
    this.registerHelpers()
  }

  async renderTemplate(
    templateName: string,
    context: EmailContext,
    variant?: string
  ): Promise<{ subject: string; html: string; text: string }> {
    const template = await this.getTemplate(templateName, variant)

    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    // Compile template if not cached
    if (!this.compiledTemplates.has(template.id)) {
      this.compiledTemplates.set(
        template.id,
        Handlebars.compile(template.content)
      )
    }

    const compiledTemplate = this.compiledTemplates.get(template.id)!
    const enrichedContext = await this.enrichContext(context)

    // Render HTML content
    const htmlContent = compiledTemplate(enrichedContext)

    // Render subject
    const subjectTemplate = Handlebars.compile(template.subject)
    const subject = subjectTemplate(enrichedContext)

    // Generate text version (simplified)
    const textContent = this.htmlToText(htmlContent)

    return {
      subject,
      html: htmlContent,
      text: textContent,
    }
  }

  private async enrichContext(
    context: EmailContext
  ): Promise<EmailContext & Record<string, any>> {
    const enriched = { ...context }

    // Add common business context
    enriched.business = {
      name: process.env.BUSINESS_NAME || 'MoodOverMuscle',
      email: process.env.BUSINESS_EMAIL || 'hello@moodovermuscle.com',
      phone: process.env.BUSINESS_PHONE,
      address: process.env.BUSINESS_ADDRESS,
      ...enriched.business,
    }

    // Add current date/time helpers
    enriched.now = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      year: new Date().getFullYear(),
    }

    // Add formatting helpers
    enriched.formatters = {
      currency: (amount: number) =>
        new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(amount),
      date: (date: string | Date) => new Date(date).toLocaleDateString('en-AU'),
      time: (time: string) =>
        new Date(`2000-01-01T${time}`).toLocaleTimeString('en-AU', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
    }

    return enriched
  }

  private registerHelpers(): void {
    // Register Handlebars helpers
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this)
    })

    Handlebars.registerHelper('formatCurrency', function (amount: number) {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(amount)
    })

    Handlebars.registerHelper('formatDate', function (date: string | Date) {
      return new Date(date).toLocaleDateString('en-AU')
    })

    Handlebars.registerHelper('formatTime', function (time: string) {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-AU', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    })

    Handlebars.registerHelper('capitalize', function (str: string) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    })
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion (could use a library like html-to-text)
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// lib/email/ab-testing.ts
export interface ABTestConfig {
  name: string
  templateName: string
  variants: ABTestVariant[]
  trafficSplit: number[] // percentages that sum to 100
  startDate: Date
  endDate?: Date
  targetMetric: 'open_rate' | 'click_rate' | 'conversion_rate'
}

export interface ABTestVariant {
  name: string
  template: EmailTemplate
  weight: number
}

export class EmailABTestingService {
  async selectVariant(
    templateName: string,
    userId?: string
  ): Promise<string | null> {
    const abTest = await prisma.emailABTest.findFirst({
      where: {
        templateName,
        isActive: true,
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      include: { variants: true },
    })

    if (!abTest) return null

    // Use user ID for consistent variant assignment
    if (userId) {
      const hash = this.hashUserId(userId)
      const bucket = hash % 100

      let cumulativeWeight = 0
      for (const variant of abTest.variants) {
        cumulativeWeight += variant.weight
        if (bucket < cumulativeWeight) {
          return variant.name
        }
      }
    }

    return abTest.variants[0]?.name || null
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// hooks/useEmailTemplates.ts
import { useState, useEffect } from 'react'

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates', {
        credentials: 'include',
      })
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
        credentials: 'include',
      })
      const newTemplate = await response.json()
      setTemplates(prev => [...prev, newTemplate])
      return newTemplate
    } catch (error) {
      throw new Error('Failed to create template')
    }
  }

  const previewTemplate = async (
    templateName: string,
    context: any,
    variant?: string
  ) => {
    try {
      const response = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, context, variant }),
        credentials: 'include',
      })
      return await response.json()
    } catch (error) {
      throw new Error('Failed to preview template')
    }
  }

  return {
    templates,
    loading,
    createTemplate,
    previewTemplate,
    refresh: loadTemplates,
  }
}
```

### Key Components

- **DynamicEmailTemplateEngine**: Core template rendering with Handlebars and context enrichment
- **A/B Testing Service**: Variant selection, consistent user assignment, and metrics tracking
- **Template Management**: Admin interface for creating and editing email templates
- **Context Enrichment**: Automatic addition of business data, formatting helpers, and date/time utilities
- **Variable System**: Defined template variables with types and validation
- **Version Control**: Template versioning for safe updates without breaking existing campaigns
- **Preview System**: Live template preview with test data for admin users

### Dependencies

- `handlebars` for template compilation and rendering
- `@react-email/render` for React-based email templates (optional)
- `@prisma/client` for template and A/B test data management
- React hooks for admin UI state management
- Admin authentication middleware for secure template management

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/email/template-engine.test.ts
describe('DynamicEmailTemplateEngine', () => {
  let templateEngine: DynamicEmailTemplateEngine

  beforeEach(() => {
    templateEngine = new DynamicEmailTemplateEngine()
  })

  describe('renderTemplate', () => {
    it('should render template with context data', async () => {
      const mockTemplate = {
        id: 'template-1',
        subject: 'Booking Confirmed - {{booking.service}}',
        content: '<h1>Hello {{user.firstName}}!</h1>',
      }

      mockPrisma.emailTemplate.findFirst.mockResolvedValue(mockTemplate)

      const context = {
        user: { firstName: 'John', email: 'john@example.com' },
        booking: { service: 'Personal Training' },
      }

      const result = await templateEngine.renderTemplate(
        'booking-confirmation',
        context
      )

      expect(result.subject).toBe('Booking Confirmed - Personal Training')
      expect(result.html).toContain('Hello John!')
    })

    it('should handle Handlebars helpers correctly', async () => {
      const mockTemplate = {
        id: 'template-1',
        subject: 'Test',
        content:
          '<p>{{capitalize user.firstName}}, cost: {{formatCurrency 150}}</p>',
      }

      mockPrisma.emailTemplate.findFirst.mockResolvedValue(mockTemplate)

      const context = {
        user: { firstName: 'john', email: 'john@example.com' },
      }

      const result = await templateEngine.renderTemplate('test', context)

      expect(result.html).toContain('John, cost: $150.00')
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/dynamic-email-templates.integration.test.ts
describe('Dynamic Email Templates Integration', () => {
  it('should send personalized booking confirmation email', async () => {
    const template = await createTestEmailTemplate({
      name: 'booking-confirmation',
      subject: 'Booking Confirmed - {{booking.service}}',
      content: '<h1>Hello {{user.firstName}}!</h1>',
    })

    const context = {
      user: { firstName: 'Alice', email: 'alice@example.com' },
      booking: { service: 'Yoga Class', date: '2025-08-07', time: '10:00' },
    }

    const success = await sendDynamicEmail(
      'alice@example.com',
      'booking-confirmation',
      context
    )

    expect(success).toBe(true)
    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: 'alice@example.com',
      subject: 'Booking Confirmed - Yoga Class',
      html: expect.stringContaining('Hello Alice!'),
      text: expect.any(String),
    })
  })
})
```

### E2E Validation

```typescript
// e2e/email-template-management.spec.ts
test('admin can create and preview email template', async ({ page }) => {
  await adminLogin(page, { permissions: ['email_templates.manage'] })

  await page.goto('/admin/email-templates')
  await page.click('[data-testid="create-template-button"]')

  await page.fill('[data-testid="template-name"]', 'test-template')
  await page.fill(
    '[data-testid="template-subject"]',
    'Hello {{user.firstName}}!'
  )
  await page.fill(
    '[data-testid="template-content"]',
    '<h1>Welcome {{user.firstName}}!</h1>'
  )

  // Preview template
  await page.click('[data-testid="preview-button"]')
  await page.fill('[data-testid="preview-user-firstname"]', 'John')
  await page.click('[data-testid="update-preview"]')

  await expect(page.locator('[data-testid="email-preview"]')).toContainText(
    'Hello John!'
  )
  await expect(page.locator('[data-testid="email-preview"]')).toContainText(
    'Welcome John!'
  )

  await page.click('[data-testid="save-template"]')
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- All email templates must be validated for syntax errors before activation
- Template variable types must be enforced to prevent runtime errors
- A/B test traffic splits must sum to 100%
- Admin permission checks required for all template management endpoints
- Email content must be sanitized to prevent XSS in preview mode

**Warning Gates** (Track in .docs/debt.md):

- Performance monitoring for template rendering with large context objects
- Advanced personalization features (dynamic content blocks)
- Email deliverability monitoring integration

## Success Metrics

- Template rendering performance: <100ms per email
- A/B test statistical significance: >95% confidence for decisions
- Template update deployment: Zero downtime for email campaigns
- Admin productivity: <5 minutes to create and deploy new template
- Personalization accuracy: 100% variable substitution success rate

## Common Pitfalls

1. **Template Syntax Errors**: Invalid Handlebars syntax breaking email rendering
   - **Prevention**: Syntax validation in admin UI, preview testing before activation

2. **Missing Context Variables**: Templates referencing undefined variables
   - **Prevention**: Variable definition system, context validation, fallback values

3. **A/B Test Data Pollution**: Inconsistent user assignment affecting test validity
   - **Prevention**: Deterministic hashing, consistent user identification

4. **Performance Issues**: Complex templates or large contexts causing slow rendering
   - **Prevention**: Template complexity monitoring, context size limits, caching

5. **Version Control Chaos**: Multiple template versions causing confusion
   - **Prevention**: Clear versioning system, rollback capabilities, change tracking

## Related Patterns

- [Notification System Pattern](./notification-system-pattern.md) - Integration point for email notifications
- [Admin Authentication Pattern](./admin-authentication-pattern.md) - Required for template management access
- [Analytics Integration Pattern](./analytics-integration-pattern.md) - Email performance tracking integration

## References

- Handlebars.js documentation: https://handlebarsjs.com/
- React Email: https://react.email/
- Email A/B testing best practices
- HTML email development guidelines

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: Medium for any application requiring flexible email content
