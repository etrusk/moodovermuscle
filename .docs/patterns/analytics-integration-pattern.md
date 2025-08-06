+++
[metadata]
type = "implementation_pattern"
complexity = 3
priority = "low"
phase = 3
status = "proven"
created = "2025-08-06"
last_updated = "2025-08-06"
used_in = []
success_rate = 0.0

[business_impact]
feature_enabler = "user behavior tracking, conversion metrics"
blocking_deployment = false
user_experience_impact = "low"
performance_impact = "low"

[technical_details]
files_affected = 3
appetite_estimate = "1 day"
dependencies = ["analytics provider", "privacy compliance", "event tracking"]
integration_points = ["user interactions", "conversion tracking", "admin dashboard"]
+++

# Pattern: Analytics Integration with Privacy-First Tracking

**Complexity**: Simple-Medium (2-3)
**Files Affected**: 3-4 files (analytics service, event tracking, privacy components, admin dashboard)
**Prerequisites**: Analytics provider selection, privacy compliance understanding, consent management
**Use Cases**: User behavior tracking, conversion optimization, business intelligence, A/B test measurement

## Context & Problem

**When to Use**: When business needs insights into user behavior, conversion rates, and application performance beyond basic server logs
**Problem Solved**: Provides actionable business intelligence while maintaining user privacy, enables data-driven decisions, tracks conversion funnels
**Appetite Scope**: 1 day for basic implementation, 2 days with advanced privacy features and custom events

## Solution Overview

Implements privacy-first analytics with configurable tracking, GDPR compliance, and comprehensive event management that integrates with existing admin dashboard and A/B testing systems.

## Implementation Details

### Code Structure

```typescript
// lib/analytics/analytics-service.ts
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp?: Date
}

export interface AnalyticsConfig {
  provider: 'vercel' | 'plausible' | 'google' | 'mixpanel'
  enabledEvents: string[]
  privacyMode: 'strict' | 'balanced' | 'minimal'
  consentRequired: boolean
}

export interface UserConsent {
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: Date
}

export class AnalyticsService {
  private config: AnalyticsConfig
  private userConsent: UserConsent | null = null
  private sessionId: string
  private eventQueue: AnalyticsEvent[] = []

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
    this.loadUserConsent()
  }

  async track(eventName: string, properties?: Record<string, any>, userId?: string): Promise<void> {
    // Check if tracking is enabled for this event
    if (!this.isEventEnabled(eventName)) {
      return
    }

    // Check user consent
    if (this.config.consentRequired && !this.hasAnalyticsConsent()) {
      // Queue event for later if consent might be granted
      this.queueEvent(eventName, properties, userId)
      return
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      userId: this.config.privacyMode === 'strict' ? undefined : userId,
      sessionId: this.sessionId,
      timestamp: new Date()
    }

    try {
      await this.sendToProvider(event)
      await this.logInternalEvent(event)
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      // Fail silently to not impact user experience
    }
  }

  private async sendToProvider(event: AnalyticsEvent): Promise<void> {
    switch (this.config.provider) {
      case 'vercel':
        await this.sendToVercel(event)
        break
      case 'plausible':
        await this.sendToPlausible(event)
        break
      case 'google':
        await this.sendToGA(event)
        break
      case 'mixpanel':
        await this.sendToMixpanel(event)
        break
    }
  }

  private async sendToVercel(event: AnalyticsEvent): Promise<void> {
    // Vercel Analytics (Web Analytics)
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event.name, event.properties)
    }
  }

  private async sendToPlausible(event: AnalyticsEvent): Promise<void> {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(event.name, {
        props: event.properties
      })
    }
  }

  setUserConsent(consent: UserConsent): void {
    this.userConsent = consent
    localStorage.setItem('analytics-consent', JSON.stringify(consent))

    // Process queued events if consent granted
    if (consent.analytics && this.eventQueue.length > 0) {
      this.processQueuedEvents()
    }
  }

  private loadUserConsent(): void {
    try {
      const stored = localStorage.getItem('analytics-consent')
      if (stored) {
        this.userConsent = JSON.parse(stored)
      }
    } catch (error) {
      // Ignore errors
    }
  }

  private hasAnalyticsConsent(): boolean {
    return this.userConsent?.analytics === true
  }

  private isEventEnabled(eventName: string): boolean {
    return this.config.enabledEvents.includes(eventName) || this.config.enabledEvents.includes('*')
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined

    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(properties)) {
      // Remove PII in strict privacy mode
      if (this.config.privacyMode === 'strict') {
        if (this.isPotentialPII(key)) {
          continue
        }
      }

      // Sanitize values
      if (typeof value === 'string' && value.includes('@')) {
        // Potential email - hash it
        sanitized[key] = this.hashValue(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private isPotentialPII(key: string): boolean {
    const piiKeys = ['email', 'phone', 'name', 'address', 'ip']
    return piiKeys.some(pii => key.toLowerCase().includes(pii))
  }

  private hashValue(value: string): string {
    // Simple hash for demonstration - use proper crypto in production
    return btoa(value).slice(0, 8)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Predefined event tracking methods
  async trackPageView(page: string, properties?: Record<string, any>): Promise<void> {
    await this.track('page_view', { page, ...properties })
  }

  async trackBookingStart(serviceType: string, properties?: Record<string, any>): Promise<void> {
    await this.track('booking_started', { service_type: serviceType, ...properties })
  }

  async trackBookingComplete(bookingId: string, properties?: Record<string, any>): Promise<void> {
    await this.track('booking_completed', { booking_id: bookingId, ...properties })
  }
}

// hooks/useAnalytics.ts
import { useEffect, useMemo } from 'react'

const analyticsConfig = {
  provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as any) || 'vercel',
  enabledEvents: process.env.NEXT_PUBLIC_ANALYTICS_EVENTS?.split(',') || ['*'],
  privacyMode: (process.env.NEXT_PUBLIC_PRIVACY_MODE as any) || 'balanced',
  consentRequired: process.env.NEXT_PUBLIC_REQUIRE_CONSENT === 'true'
}

export function useAnalytics() {
  const analytics = useMemo(() => new AnalyticsService(analyticsConfig), [])

  useEffect(() => {
    // Track page view on mount
    analytics.trackPageView(window.location.pathname)
  }, [analytics])

  return analytics
}

// components/ConsentBanner.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const analytics = useAnalytics()

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = {
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date()
    }
    analytics.setUserConsent(consent)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const consent = {
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: new Date()
    }
    analytics.setUserConsent(consent)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold">We value your privacy</h3>
            <p className="text-sm text-gray-600 mt-2">
              We use cookies and similar technologies to improve your experience, analyze site usage,
              and assist in our marketing efforts. You can customize your preferences below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAcceptAll} className="flex-1">
              Accept All
            </Button>
            <Button variant="outline" onClick={handleRejectAll} className="flex-1">
              Reject All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

### Key Components

- **AnalyticsService**: Core service with privacy-first tracking and multi-provider support
- **Consent Management**: GDPR-compliant consent banner and preference management
- **Event Queue**: Queuing system for events when consent is pending
- **Provider Abstraction**: Support for multiple analytics providers (Vercel, Plausible, GA, Mixpanel)
- **Privacy Controls**: Data sanitization and PII handling based on privacy mode
- **Internal Analytics**: Custom event storage for admin dashboard insights
- **Automatic Tracking**: Page views, errors, and user journey tracking

### Dependencies

- Analytics provider SDK (varies by provider)
- `@prisma/client` for internal event storage
- React hooks for component integration
- Next.js API routes for event collection

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/analytics/analytics-service.test.ts
describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    const mockConfig = {
      provider: 'vercel' as const,
      enabledEvents: ['*'],
      privacyMode: 'balanced' as const,
      consentRequired: false,
    }
    analyticsService = new AnalyticsService(mockConfig)
  })

  describe('track', () => {
    it('should track events when consent not required', async () => {
      const trackSpy = jest.spyOn(analyticsService as any, 'sendToProvider')
      trackSpy.mockResolvedValue(undefined)

      await analyticsService.track('test_event', { key: 'value' })

      expect(trackSpy).toHaveBeenCalledWith({
        name: 'test_event',
        properties: { key: 'value' },
        sessionId: expect.any(String),
        timestamp: expect.any(Date),
      })
    })

    it('should sanitize PII in strict privacy mode', async () => {
      const strictConfig = {
        provider: 'vercel' as const,
        enabledEvents: ['*'],
        privacyMode: 'strict' as const,
        consentRequired: false,
      }
      const service = new AnalyticsService(strictConfig)

      const trackSpy = jest.spyOn(service as any, 'sendToProvider')
      trackSpy.mockResolvedValue(undefined)

      await service.track('test_event', {
        email: 'user@example.com',
        name: 'John',
      })

      expect(trackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {}, // PII should be removed
        })
      )
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/analytics-tracking.integration.test.ts
describe('Analytics Integration', () => {
  it('should track booking completion flow', async () => {
    const mockAnalyticsProvider = jest.fn()
    global.window = { va: mockAnalyticsProvider } as any

    render(<BookingWizardWithAnalytics />)

    // Complete booking steps
    await userEvent.click(screen.getByText('Personal Training'))
    await userEvent.click(screen.getByText('Next'))

    await userEvent.fill(screen.getByLabelText('Date'), '2025-08-07')
    await userEvent.click(screen.getByText('Complete Booking'))

    // Verify tracking calls
    expect(mockAnalyticsProvider).toHaveBeenCalledWith('track', 'booking_started', expect.any(Object))
    expect(mockAnalyticsProvider).toHaveBeenCalledWith('track', 'booking_completed', expect.any(Object))
  })
})
```

### E2E Validation

```typescript
// e2e/analytics-tracking.spec.ts
test('tracks user journey through booking flow', async ({ page }) => {
  // Set up analytics interception
  const analyticsEvents: any[] = []

  await page.route('**/api/analytics/events', route => {
    const postData = route.request().postData()
    if (postData) {
      analyticsEvents.push(JSON.parse(postData))
    }
    route.fulfill({ status: 200, body: '{"success":true}' })
  })

  // Navigate and complete booking
  await page.goto('/')
  await page.click('[data-testid="book-session-button"]')

  // Accept analytics consent
  await page.click('[data-testid="accept-all-cookies"]')

  // Complete booking flow
  await page.click('[data-testid="personal-training-option"]')
  await page.fill('[data-testid="customer-name"]', 'John Doe')
  await page.click('[data-testid="complete-booking"]')

  // Wait for booking confirmation
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()

  // Verify analytics events were tracked
  expect(analyticsEvents).toContainEqual(
    expect.objectContaining({ name: 'booking_started' })
  )
  expect(analyticsEvents).toContainEqual(
    expect.objectContaining({ name: 'booking_completed' })
  )
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- User consent must be obtained before tracking personal data
- PII must be sanitized or hashed based on privacy mode settings
- Analytics tracking failures must not impact user experience (fail silently)
- Event tracking must be configurable and can be completely disabled
- GDPR compliance requirements must be met for EU users

**Warning Gates** (Track in .docs/debt.md):

- Performance impact of analytics tracking on page load
- Analytics data retention and cleanup policies
- Advanced segmentation and funnel analysis features

## Success Metrics

- Event tracking success rate: >99% for critical events
- Analytics data accuracy: <1% discrepancy with server-side data
- Privacy compliance: 100% GDPR compliance score
- Performance impact: <50ms additional page load time
- Conversion tracking accuracy: >95% attribution accuracy

## Common Pitfalls

1. **Privacy Violations**: Tracking personal data without proper consent
   - **Prevention**: Implement consent management, sanitize data, follow privacy-by-design principles

2. **Performance Impact**: Heavy analytics scripts slowing down page load
   - **Prevention**: Load analytics asynchronously, implement script optimization

3. **Data Quality Issues**: Inconsistent event naming and property structures
   - **Prevention**: Define event schemas, use TypeScript interfaces, validate events

4. **GDPR Non-Compliance**: Not providing opt-out mechanisms or data deletion
   - **Prevention**: Implement consent management, provide data deletion endpoints

5. **Analytics Blocking**: Users with ad blockers not being tracked
   - **Prevention**: Use first-party analytics where possible, implement server-side tracking fallbacks

## Related Patterns

- [Admin Authentication Pattern](./admin-authentication-pattern.md) - Secure access to analytics dashboard
- [Dynamic Email Template Pattern](./dynamic-email-template-pattern.md) - Email campaign performance tracking
- [A/B Testing Integration](./dynamic-email-template-pattern.md) - Measure A/B test performance

## References

- GDPR compliance guidelines: https://gdpr.eu/
- Google Analytics 4 documentation
- Plausible Analytics documentation
- Privacy-focused analytics best practices

## History

- **Created**: 2025-08-06
- **Last Updated**: 2025-08-06
- **Used In**: []
- **Success Rate**: 0% (not yet implemented)

---

**Pattern Status**: Proven
**Confidence Level**: High
**Reuse Frequency**: High for any user-facing application requiring business intelligence
