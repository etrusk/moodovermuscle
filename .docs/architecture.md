# System Architecture & Design Constraints

## Architecture Philosophy

**Constraint-Driven Design**: Architecture decisions optimized for single developer + agentic LLM workflow with Emily's fitness coaching business requirements.

**Navigator-Driver Model**: Human provides strategic direction and architectural decisions while AI handles tactical implementation and pattern application. This model maximizes automation while preserving human oversight for critical business and architectural decisions.

**Appetite-Based Constraints**:

- **Simplicity Over Complexity**: Choose proven solutions over cutting-edge when appetite is limited
- **Functionality Over Elegance**: Deliver user value within appetite boundaries
- **Privacy-First**: Technical choices must respect privacy constraints
- **FLOSS Preference**: Open-source solutions unless significant functionality gap
- **Automation-First**: Automate repetitive tasks while preserving human control over strategic decisions

## Current System State

### Tech Stack (Proven & Stable)

- **Framework**: Next.js 14 (App Router) - Mature, well-documented, excellent TypeScript support
- **Database**: Neon PostgreSQL with Prisma ORM - Serverless, type-safe, familiar patterns
- **Styling**: Tailwind CSS + shadcn/ui components - Rapid development, consistent design system
- **Email**: Nodemailer with Gmail SMTP - Simple, reliable, fire-and-forget pattern
- **Testing**: Vitest + React Testing Library + Playwright + MSW - Comprehensive, automated quality gates
- **Performance**: Vercel Analytics + SpeedInsights - Zero-maintenance monitoring
- **Deployment**: Vercel with GitHub integration - One-click deploys, automatic previews
- **Security**: Built-in Next.js security + rate limiting - Good defaults, minimal configuration

### Database Architecture & Evolution Path

#### Current Schema (Stable Foundation)

```prisma
model Booking {
  id         String   @id @default(cuid())
  name       String
  email      String
  phone      String?
  service    String
  date       DateTime
  time       String
  message    String?
  goals      String?
  experience String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### Next Evolution (Transaction Safety - Week 1-2)

```prisma
model Booking {
  id              String        @id @default(cuid())
  name            String
  email           String
  phone           String?
  service         String
  date            DateTime
  time            String
  message         String?
  goals           String?
  experience      String?
  status          BookingStatus @default(PENDING)
  sessionDuration Int?          @default(60)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([date, time])  // CRITICAL: Prevent double bookings
  @@index([date])         // PERFORMANCE: Optimize availability queries
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

#### Future Appetite (Multi-trainer Support - Future 6+ month appetite)

```prisma
model Trainer {
  id       String    @id @default(cuid())
  name     String
  email    String
  bookings Booking[]
}

model Booking {
  // ... existing fields
  trainerId String?
  trainer   Trainer? @relation(fields: [trainerId], references: [id])
}
```

### Key Architectural Constraints

#### Navigator-Driver Integration Points

**Human Navigator Responsibilities**:

- Business logic decisions and validation rules
- Security policy and authentication strategy
- User experience flows and interface design
- Architectural patterns and technology choices
- Quality gate definitions and acceptance criteria

**AI Driver Responsibilities**:

- Implementation following established patterns
- Code generation and boilerplate creation
- Test case creation and maintenance
- Documentation updates and pattern capture
- Refactoring and optimization within defined constraints

**Knowledge Distribution (Truck Number Principle)**:

- Critical system knowledge must be documented and accessible
- No single point of failure in team knowledge
- Automated pattern capture prevents knowledge loss
- Institutional memory builds over time through AI assistance

#### Database Design Principles

- **CUID Primary Keys**: Better for distributed systems, sortable by creation time
- **Nullable Fields**: Flexible schema for optional user input (phone, message, goals, experience)
- **Time Storage**: DateTime for precise dates, String for user-selected time slots
- **Audit Trail**: Automatic createdAt/updatedAt timestamps
- **Conflict Prevention**: Unique constraint on date/time combination prevents double bookings
- **Query Optimization**: Date indexing for efficient availability checking

#### API Design Constraints

- **Fire-and-Forget Email**: Email failures never block user workflows
- **Transaction Safety**: All booking operations must be atomic with rollback capability
- **Type Safety**: Zod validation on all inputs, TypeScript end-to-end
- **Performance Budget**: API responses <500ms (95th percentile)

## Core System Components

### Booking System (Current Appetite Focus)

#### Transaction Safety Architecture (Critical - Week 1-2)

```typescript
// Current Implementation (Vulnerable)
const newBooking = await prisma.booking.create({
  data: validatedData.data,
})

// Target Implementation (Transaction-Safe)
return await prisma.$transaction(async tx => {
  // 1. Check for existing booking conflicts
  const existingBooking = await tx.booking.findFirst({
    where: {
      date: validatedData.date,
      time: validatedData.time,
    },
  })

  if (existingBooking) {
    throw new Error('Time slot already booked')
  }

  // 2. Create booking within transaction
  const newBooking = await tx.booking.create({
    data: validatedData.data,
  })

  return newBooking
})
```

**Architectural Benefits**:

- **Atomicity**: All-or-nothing booking creation
- **Consistency**: Database always in valid state
- **Isolation**: Concurrent bookings don't interfere
- **Durability**: Committed bookings are permanent

#### Real-Time Availability Architecture (High Priority - Week 3-4)

```typescript
// New API Endpoint: /api/availability
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  const existingBookings = await prisma.booking.findMany({
    where: { date: new Date(date) },
    select: { time: true },
  })

  const bookedTimes = existingBookings.map(b => b.time)
  const availableTimes = timeSlots.filter(slot => !bookedTimes.includes(slot))

  return NextResponse.json({
    availableTimes,
    bookedTimes,
    date,
  })
}
```

**Performance Constraints**:

- **Response Time**: <500ms for availability queries
- **Caching Strategy**: Client-side caching with real-time invalidation
- **Database Optimization**: Date indexing for efficient queries

#### Multi-step Wizard Pattern (Proven Architecture)

```typescript
// Successful Pattern: Step-based Architecture
<BookingWizard>
  <WizardSteps currentStep={currentStep}>
    <ServiceSelectionStep />
    <SchedulingStep />        // Enhanced with real-time availability
    <PersonalDetailsStep />
  </WizardSteps>
  <WizardNavigation />
</BookingWizard>
```

**Design Constraints**:

- **Separation of Concerns**: Each step focuses on single responsibility
- **State Management**: Centralized booking state with TypeScript safety
- **Accessibility**: WCAG 2.1 AA compliance throughout wizard flow
- **Mobile-First**: Responsive design with touch-friendly interactions

### Email Architecture (Stable Pattern)

#### Fire-and-Forget Implementation

```typescript
// Non-blocking email pattern
const newBooking = await prisma.booking.create({ data: validatedData.data })

// Fire-and-forget email sending (never blocks API response)
sendCustomerConfirmation(emailData)
  .then(res => {
    if (!res.success) {
      console.error('Failed to send customer confirmation email:', res.error)
    }
  })
  .catch(err => {
    console.error('Error in sendCustomerConfirmation:', err)
  })

// Return success immediately
return NextResponse.json(
  { message: 'Booking submitted successfully!', data: newBooking },
  { status: 201 }
)
```

**Architectural Benefits**:

- **Reliability**: Email failures don't affect booking success
- **Performance**: API responses not blocked by SMTP timeouts
- **User Experience**: Immediate feedback regardless of email service status
- **Monitoring**: Email failures logged for admin awareness

#### Email Template Strategy

- **Customer Confirmation**: Professional HTML/text with booking details
- **Admin Notification**: Action-oriented with clear next steps
- **Error Handling**: Graceful degradation when templates fail

### Performance Monitoring Architecture

#### Privacy-Focused Lighthouse CI (Proven Pattern)

```javascript
// Privacy-hardened Chrome configuration
const chromeFlags = [
  '--disable-background-networking', // No background requests
  '--disable-sync', // No Google account sync
  '--disable-translate', // No translation services
  '--no-pings', // No ping requests
  '--no-referrers', // No referrer headers
  '--disable-breakpad', // No crash reporting
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-logging',
  '--disable-domain-reliability',
  '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
  '--headless',
  '--disable-gpu',
]
```

**Privacy Benefits**:

- **Complete Isolation**: Dedicated Chrome profile, wiped after each test
- **Zero Persistent Data**: No tracking, no data accumulation
- **Local Control**: No data sent to external services
- **Automated Cleanup**: Profile cleanup prevents data leakage

#### Automated Quality Gates

```javascript
// Critical Gates (Build Blockers)
'categories:accessibility': ['error', { minScore: 0.95 }],  // WCAG compliance
'categories:seo': ['error', { minScore: 0.9 }],            // Search visibility
'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],  // LCP < 2.5s
'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],    // CLS < 0.1

// Warning Gates (Tracked in debt.md)
'categories:performance': ['warn', { minScore: 0.85 }],    // Overall performance
'audits:total-blocking-time': ['warn', { maxNumericValue: 300 }]  // TBT < 300ms
```

## Security Architecture & Constraints

### Authentication & Authorization

**JWT Token Strategy:**
- **Access Tokens**: 15-minute lifetime for security
- **Refresh Tokens**: 7-day lifetime with rotation
- **Storage**: HTTP-only cookies (prevents XSS attacks)
- **Algorithm**: RS256 signing for asymmetric verification
- **Payload**: Minimal user info (userId, role, email)

**Session Management:**
- Hybrid approach: Stateless JWT + server-side session tracking
- Session timeout: 24 hours of inactivity
- Automatic token refresh for active sessions
- Concurrent sessions: Up to 3 per user (last-in-first-out)

**Admin Authentication:**
- Simple password-based access for Emily (solo trainer)
- Bcrypt password hashing with salt rounds
- Rate limiting on login attempts (5 attempts per 15 minutes)

### Input Validation Strategy (Defense in Depth)

```typescript
// Server-side validation with Zod (Never trust client)
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

### Security Headers (Next.js Defaults + Enhancements)

```typescript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
]
```

### Rate Limiting Strategy

**Booking Endpoints:**
- Anonymous users: 5 requests per 15 minutes per IP
- Authenticated users: 20 requests per 15 minutes
- Protects against booking spam and DoS attacks

**Authentication Endpoints:**
- Login attempts: 5 per 15 minutes per IP
- Token refresh: 10 per hour per user
- Prevents brute force attacks

**Implementation:**
```typescript
// In-memory rate limiting (sufficient for current scale)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 booking attempts per IP
  message: 'Too many booking attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})
```

## Testing Architecture (Proven Patterns)

### Three-Layer Accessibility Testing (Zero Manual Verification)

```typescript
// Unit Level: Automated accessibility validation
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

test('component has no accessibility violations', async () => {
  const { container } = render(<BookingForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

// Integration Level: Complex interaction testing
test('booking wizard maintains accessibility throughout flow', async ({ page }) => {
  await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')
  const btn = page.getByRole('button', { name: 'Book session' })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-busy', 'true')
})

// System Level: Lighthouse CI with 95% threshold
'audits:color-contrast': ['error', { minScore: 1.0 }],      // 100% compliance
'audits:image-alt': ['error', { minScore: 1.0 }],           // 100% coverage
'audits:label': ['error', { minScore: 1.0 }],               // 100% form labeling
```

### Component Testing Patterns (Race Condition Elimination)

```typescript
// Successful Pattern: Custom Hook Extraction
// File: components/booking-form/useAvailability.ts
export function useAvailability(selectedDate: Date | undefined) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Clean separation enables deterministic testing
}

// Test Pattern: Hook Mocking (No race conditions)
vi.mock('../useAvailability', () => ({
  useAvailability: vi.fn().mockReturnValue({
    availableTimes: ['09:00', '10:00'],
    isLoading: false,
  }),
}))
```

### API Integration Testing (MSW Network-Level Mocking)

```typescript
// Realistic error simulation without brittle mocks
export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody

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

## Deployment Architecture (Zero-Maintenance)

### Vercel Platform Integration

- **Production Deployment**: Every merge to main branch
- **Preview Deployments**: Every pull request gets unique URL
- **Environment Variables**: Managed via Vercel dashboard
- **Rollback Capability**: One-click rollback through Vercel interface
- **Monitoring**: Built-in analytics and performance monitoring

### CI/CD Pipeline (GitHub Actions)

```yaml
# Automated quality enforcement
jobs:
  - lint-and-typecheck: Code quality validation
  - test: Unit and integration tests (must pass)
  - build: Application build verification (must pass)
  - size-check: Bundle size monitoring (warning level)
  - lighthouse: Performance and accessibility gates (critical)
```

### Database Deployment (Neon PostgreSQL)

- **Connection Pooling**: Handled automatically by Neon
- **Backups**: Automatic daily backups with point-in-time recovery
- **Scaling**: Serverless scaling based on demand
- **Migration Strategy**: Prisma migrate with rollback capabilities

## System Constraints & Design Boundaries

### Business Constraints

- **Single Client**: Emily's fitness coaching business (1 trainer)
- **Solo Development**: 1 developer + agentic LLM assistance
- **Budget Conscious**: Free/open-source solutions prioritized
- **Privacy First**: No unnecessary data collection or tracking

### Technical Constraints

- **CachyOS Environment**: Local development on privacy-focused Linux
- **FLOSS Preference**: Open-source tools unless significant functionality gap
- **Simplicity Mandate**: Choose proven solutions over cutting-edge
- **Performance Budget**: Core Web Vitals compliance required

### Scale Constraints (Current Appetite)

- **User Load**: 50-100 bookings per month maximum
- **Data Volume**: <10GB database size in foreseeable future
- **Concurrent Users**: <10 simultaneous users expected
- **Geographic Scope**: Single timezone (Australia/Brisbane)

## Architecture Evolution Path

### Phase 1: Transaction Safety (Current Appetite)

- **Database**: Add unique constraints and status enum
- **API**: Implement Prisma transactions with conflict detection
- **Testing**: Add transaction safety test coverage
- **Performance**: Maintain <500ms API response times

### Phase 2: Real-Time Availability (Next Appetite)

- **API**: New `/api/availability` endpoint
- **Frontend**: Dynamic calendar integration
- **Caching**: Client-side availability caching
- **Performance**: <500ms availability queries

### Phase 3: Admin Dashboard (Future Appetite)

- **Authentication**: Simple password-based admin access
- **UI**: Booking list and calendar views for Emily
- **API**: Admin CRUD operations for booking management
- **Integration**: Email communication tools

### Future Architecture (6+ Month Appetite)

- **Multi-trainer Support**: Schema and UI for multiple trainers
- **Payment Integration**: Stripe or similar payment processing
- **Advanced Scheduling**: Recurring appointments, availability rules
- **Analytics**: Business insights and reporting

## Architectural Decision Framework

### When to Choose Simple Solutions

- **Current appetite is <2 weeks**: Use proven patterns
- **Complexity score >6**: Break into smaller appetites
- **External dependencies involved**: Prefer platform services
- **Team knowledge gaps**: Choose familiar technologies

### When to Invest in Complexity

- **Core business logic**: Transaction safety, booking conflicts
- **User experience critical**: Accessibility, performance
- **Security requirements**: Input validation, data protection
- **Long-term maintainability**: Type safety, testing

### Circuit Breakers (When to Stop)

- **Implementation time exceeds appetite by 50%**: Re-evaluate scope
- **Technology choice requires extensive learning**: Consider alternatives
- **Performance targets not achievable**: Reassess requirements
- **Testing becomes more complex than implementation**: Simplify approach

## Integration Points & Dependencies

### External Service Dependencies

- **Neon PostgreSQL**: Database hosting and management
- **Vercel Platform**: Deployment, monitoring, analytics
- **Gmail SMTP**: Email delivery (fire-and-forget)
- **GitHub**: Code repository and CI/CD triggers

### Internal System Dependencies

- **Next.js Framework**: React, routing, API routes, image optimization
- **Prisma ORM**: Database access, migrations, type generation
- **shadcn/ui**: Component library, design system consistency
- **Tailwind CSS**: Styling, responsive design, theme management

### Development Environment Dependencies

- **CachyOS**: Local development environment
- **Chromium**: Privacy-focused performance testing
- **Node.js**: Runtime environment for local development
- **pnpm/npm**: Package management and dependency resolution

## Success Metrics & Monitoring

### Technical Health Indicators

- **Test Pass Rate**: 100% for critical tests
- **Build Success Rate**: >95% for CI/CD pipeline
- **Performance Score**: ≥95% Lighthouse accessibility, ≥85% performance
- **Error Rate**: <1% API errors in production

### Business Value Indicators

- **Booking Success Rate**: >95% completion rate
- **Double Booking Incidents**: 0 (after transaction safety)
- **User Satisfaction**: Positive feedback from Emily
- **System Reliability**: 99.9% uptime

### Development Velocity Indicators

- **Feature Delivery**: Within appetite timeframes 80% of time
- **Bug Resolution**: <24 hours for critical issues
- **Deployment Frequency**: Multiple deployments per week safely
- **Rollback Time**: <5 minutes to restore working state

---

**Last Updated**: 2025-08-03  
**Architecture Status**: Stable foundation, transaction safety next priority  
**Next Review**: After transaction safety implementation completion  
**Evolution Driver**: Emily's business needs and user feedback
