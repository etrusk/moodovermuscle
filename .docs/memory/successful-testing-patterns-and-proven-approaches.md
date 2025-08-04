---
title: Successful Testing Patterns and Proven Approaches
tags:
  [
    testing,
    patterns,
    unit-tests,
    integration-tests,
    e2e,
    success,
    jest,
    playwright,
    msw,
    react-testing-library,
  ]
confidence: high
sample_size: 15 patterns over project lifetime
last_calibrated: 2025-08-03
search_terms:
  [
    test patterns,
    testing success,
    proven approaches,
    test architecture,
    testing strategies,
  ]
---

# Successful Patterns & Institutional Knowledge

## Test Suite Architecture Patterns

### Component Testing with Custom Hooks

**Pattern**: Extract data fetching logic into custom hooks for better testability
**Success**: Resolved race conditions in `SchedulingStep` component tests

```typescript
// Successful Pattern: Custom Hook Extraction
// File: components/booking-form/useAvailability.ts
export function useAvailability(selectedDate: Date | undefined) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Clean separation of concerns enables deterministic testing
  // Mock the hook rather than complex async operations
}

// Test Pattern: Hook Mocking
jest.mock('../useAvailability', () => ({
  useAvailability: jest.fn(),
}))
```

**Key Learning**: Separating data fetching from UI logic creates testable, maintainable components
**Reuse Opportunity**: Apply this pattern to other async components

### API Route Testing with Prisma

**Pattern**: Standardized NextRequest/NextResponse mocking with Prisma transaction handling
**Success**: Achieved 100% API test pass rate

```typescript
// Successful Pattern: API Route Testing
function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    body: blob,
  })
}

// Prisma Transaction Mocking
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))
```

**Key Learning**: Consistent mocking patterns across test files prevent maintenance overhead
**Reuse Opportunity**: Template for all future API route tests

### MSW Integration Testing

**Pattern**: Network-level mocking for realistic test scenarios
**Success**: Comprehensive error scenario coverage with 38 passing Playwright tests

```typescript
// Successful Pattern: MSW Handlers
export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody

    // Realistic error simulation
    if (body.email === 'fail@example.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Internal Server Error' }),
        { status: 500 }
      )
    }

    return new HttpResponse(
      JSON.stringify({ message: 'Booking submitted successfully!' }),
      { status: 200 }
    )
  }),
]
```

**Key Learning**: MSW provides more realistic testing than Jest mocks for integration scenarios
**Reuse Opportunity**: Extend handlers for new API endpoints

## Accessibility Excellence Patterns

### Three-Layer Accessibility Testing

**Pattern**: Unit → Integration → E2E accessibility validation
**Success**: 95% Lighthouse score with zero critical violations

```typescript
// Unit Level: jest-axe integration
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

test('component has no accessibility violations', async () => {
  const { container } = render(<BookingForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

// E2E Level: Playwright accessibility
test('booking flow maintains accessibility', async ({ page }) => {
  await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')
  const btn = page.getByRole('button', { name: 'Book session' })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-busy', 'true')
})
```

**Key Learning**: Automated accessibility testing eliminates manual verification while maintaining compliance
**Reuse Opportunity**: Apply three-layer approach to all new features

### Mobile-First Responsive Design

**Pattern**: Design components with mobile constraints first, enhance for desktop
**Success**: WCAG 2.1 AA compliance across all device sizes

**Key Learning**: Mobile-first approach creates more accessible, performant experiences
**Reuse Opportunity**: Standard approach for all new UI components

## Performance Optimization Patterns

### Privacy-Focused Lighthouse CI

**Pattern**: Local Chromium with automated quality gates and complete privacy isolation
**Success**: Automated performance monitoring without privacy compromise

```javascript
// Successful Pattern: Privacy-Hardened Chrome Config
const chromeFlags = [
  '--disable-background-networking',
  '--disable-sync',
  '--disable-translate',
  '--no-pings',
  '--no-referrers',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-logging',
  '--disable-domain-reliability',
  '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
  '--headless',
  '--disable-gpu',
]
```

**Key Learning**: Local performance testing can be both private and automated
**Reuse Opportunity**: Template for performance testing in other projects

### Image Optimization Strategy

**Pattern**: Next.js Image component with responsive sizing and WebP support
**Success**: Improved Core Web Vitals and mobile performance

```typescript
// Successful Pattern: Responsive Image Implementation
<Image
  src="/images/hero-image.jpg"
  alt="Fitness training session"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
  className="rounded-lg"
/>
```

**Key Learning**: Strategic image optimization has significant performance impact
**Reuse Opportunity**: Apply to all image-heavy components

## Database & API Patterns

### Fire-and-Forget Email Pattern

**Pattern**: Non-blocking email sending to prevent API response delays
**Success**: Reliable booking flow regardless of email service status

```typescript
// Successful Pattern: Non-blocking Email
const newBooking = await prisma.booking.create({ data: validatedData.data })

// Fire-and-forget email sending
sendCustomerConfirmation(emailData)
  .then(res => {
    if (!res.success) {
      console.error('Failed to send customer confirmation email:', res.error)
    }
  })
  .catch(err => {
    console.error('Error in sendCustomerConfirmation:', err)
  })

// Return success immediately, don't wait for email
return NextResponse.json(
  { message: 'Booking submitted successfully!', data: newBooking },
  { status: 201 }
)
```

**Key Learning**: Email failures shouldn't block user workflows
**Reuse Opportunity**: Apply to all background task patterns

### Zod Schema Validation

**Pattern**: Type-safe validation with user-friendly error messages
**Success**: Robust input validation with TypeScript integration

```typescript
// Successful Pattern: Comprehensive Validation Schema
export const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  service: z.string({ required_error: 'Please select a service.' }),
  date: z
    .string()
    .pipe(z.coerce.date({ required_error: 'Please select a date.' })),
  time: z.string({ required_error: 'Please select a time.' }),
  message: z.string().max(500).optional(),
  goals: z.string({ required_error: 'Please select a goal.' }),
  experience: z.string().optional(),
})
```

**Key Learning**: Zod provides excellent DX with TypeScript while ensuring runtime safety
**Reuse Opportunity**: Template for all form validation schemas

## Development Workflow Patterns

### TDD with Critical Test Suite

**Pattern**: Fast feedback loop with `npm run test:critical` for rapid development
**Success**: Maintains developer velocity while ensuring quality

```bash
# Successful Pattern: Layered Testing Commands
npm run test:critical     # Fast feedback for commits (< 30s)
npm run test             # Full suite for comprehensive validation
npm run test:e2e         # User journey validation
npm run lighthouse:test  # Performance and accessibility gates
```

**Key Learning**: Separate fast/comprehensive testing enables effective TDD workflow
**Reuse Opportunity**: Standard approach for all development cycles

### Quality Gate Framework

**Pattern**: Critical (never bypass) vs Non-critical (track in debt.md) quality gates
**Success**: Objective quality enforcement without blocking development velocity

```typescript
// Critical Gates (Build Blockers)
- Type checking failures
- Linting errors
- Security vulnerabilities
- Accessibility violations (95% threshold)
- Core Web Vitals (LCP <2.5s, CLS <0.1)

// Non-Critical Gates (Track in debt.md)
- Integration test failures → Document with timeline
- Performance regressions → Track with impact assessment
- Bundle size increases → Monitor via size-check CI
```

**Key Learning**: Clear quality gate boundaries prevent both quality degradation and development paralysis
**Reuse Opportunity**: Framework for all project quality standards

## Component Architecture Patterns

### Wizard Form Decomposition

**Pattern**: Multi-step forms with clean separation of concerns
**Success**: Maintainable, testable booking wizard

```typescript
// Successful Pattern: Step-based Architecture
<BookingWizard>
  <WizardSteps currentStep={currentStep}>
    <ServiceSelectionStep />
    <SchedulingStep />
    <PersonalDetailsStep />
  </WizardSteps>
  <WizardNavigation />
</BookingWizard>
```

**Key Learning**: Step-based architecture enables independent development and testing of form sections
**Reuse Opportunity**: Template for complex multi-step user flows

### shadcn/ui Integration

**Pattern**: Consistent design system with Tailwind CSS and accessible components
**Success**: Rapid UI development with maintained accessibility standards

**Key Learning**: Design system provides velocity without sacrificing accessibility
**Reuse Opportunity**: Extend component library for business-specific needs

## Error Handling Patterns

### Graceful Degradation

**Pattern**: System continues to function even when non-critical components fail
**Success**: Booking system works despite email service failures

**Key Learning**: Identify critical vs non-critical system components
**Reuse Opportunity**: Apply graceful degradation to all system integrations

### Comprehensive Error Scenarios

**Pattern**: Test both happy path and failure conditions
**Success**: 90% error scenario coverage with automated testing

**Key Learning**: Error conditions are as important as success paths
**Reuse Opportunity**: Error scenario testing for all user journeys

## Deployment & Infrastructure Patterns

### Vercel Integration Excellence

**Pattern**: Zero-configuration deployment with automated preview environments
**Success**: Seamless deployment pipeline with rollback capabilities

**Key Learning**: Platform-as-a-Service can provide enterprise-level capabilities for small teams
**Reuse Opportunity**: Leverage Vercel's full feature set for monitoring and analytics

### GitHub Actions CI/CD

**Pattern**: Automated quality gates in CI with clear pass/fail criteria
**Success**: Objective quality enforcement without manual bottlenecks

**Key Learning**: Automation removes subjective quality decisions
**Reuse Opportunity**: Template CI/CD pipeline for future projects

## Anti-Patterns to Avoid

### Timeline-Based Planning

**Anti-Pattern**: Focus on "when" rather than "what" and "why"
**Problem**: Creates pressure without clarity on value delivery
**Better Approach**: Appetite-based development with clear scope boundaries

### Manual Testing Dependencies

**Anti-Pattern**: Relying on manual verification for quality assurance
**Problem**: Creates bottlenecks and inconsistent quality
**Better Approach**: Comprehensive automated testing with clear quality gates

### Monolithic Components

**Anti-Pattern**: Large components that mix concerns
**Problem**: Difficult to test and maintain
**Better Approach**: Extract hooks, separate data/UI concerns

## Success Metrics That Matter

### Code Quality Indicators

- **Test Pass Rate**: 100% for critical tests
- **Type Safety**: Zero TypeScript errors
- **Accessibility Score**: ≥95% Lighthouse rating
- **Performance**: LCP <2.5s, CLS <0.1

### Developer Experience Indicators

- **Build Time**: <2 minutes for full CI pipeline
- **Test Feedback**: <30 seconds for critical test suite
- **Deploy Time**: <5 minutes from merge to production
- **Rollback Time**: <2 minutes to previous working state

### Business Value Indicators

- **Booking Success Rate**: >95% completion
- **Mobile Experience**: Zero accessibility violations
- **System Reliability**: 99.9% uptime
- **User Satisfaction**: Positive feedback from Emily (primary user)

---

**Last Updated**: 2025-08-03  
**Pattern Count**: 15 successful patterns documented  
**Anti-Patterns**: 3 identified and alternatives provided  
**Next Review**: Add new patterns as they emerge from development
