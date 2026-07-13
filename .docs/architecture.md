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

- **Framework**: Next.js 16 (App Router) - Mature, well-documented, excellent TypeScript support
- **Database**: Neon PostgreSQL with Prisma ORM - Serverless, type-safe, familiar patterns
- **Styling**: Tailwind CSS + shadcn/ui components - Rapid development, consistent design system
- **Email**: Nodemailer with SMTP - Simple, reliable, fire-and-forget pattern
- **Authentication**: jose (JWT) + bcryptjs - Edge Runtime compatible, secure password hashing
- **Testing**: Vitest + React Testing Library + Playwright + MSW - Comprehensive, automated quality gates
- **Performance**: Vercel Analytics + SpeedInsights - Zero-maintenance monitoring
- **Deployment**: Vercel with GitHub integration - One-click deploys, automatic previews
- **Security**: Built-in Next.js security + custom rate limiting - Good defaults, minimal configuration
- **Middleware**: Next.js Edge Runtime authentication - Route-level protection for admin access

### Database Architecture & Evolution Path

#### Current Schema (Production - Transaction Safety Implemented)

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
  statusChanges   BookingStatusChange[]

  @@unique([date, time])  // CRITICAL: Prevent double bookings
  @@index([date])         // PERFORMANCE: Optimize availability queries
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

model BookingStatusChange {
  id          String        @id @default(cuid())
  booking     Booking       @relation(fields: [bookingId], references: [id])
  bookingId   String
  fromStatus  BookingStatus
  toStatus    BookingStatus
  createdAt   DateTime      @default(now())

  @@index([bookingId])
}
```

#### Prisma Client & Connection (Prisma 7 driver adapter)

The client is instantiated in [`lib/prisma.ts`](lib/prisma.ts) via a **driver adapter** — `PrismaPg`
(`@prisma/adapter-pg` + `pg`) built from a `connectionString`, wrapped in a `createPrismaClient()`
factory; there is no `datasource url` on the client itself. The generated client lives at
`lib/generated/prisma` (schema `generator` is `provider = "prisma-client"`,
`output = "../lib/generated/prisma"`). The models above still match `prisma/schema.prisma`.

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

### Edge Middleware Architecture

**Admin Route Protection** ([`middleware.ts`](middleware.ts:1)):
- **Runtime**: Next.js Edge Runtime (global edge deployment)
- **Pattern**: Cookie-based JWT authentication with automatic redirect
- **Protected Routes**: `/admin/*` (UI pages) and `/api/admin/*` (API endpoints)
- **Token Verification**: jose library for Edge Runtime compatibility
- **Header Injection**: Adds admin context (adminId, email, name) to request headers
- **Performance**: <10ms authentication check (edge-native execution)

**Security Benefits:**
- Authentication enforced before route handlers execute
- Prevents unauthorized access at infrastructure level
- Token verification happens at edge (low latency globally)
- Automatic cookie cleanup on invalid/expired tokens
- Stateless verification (no session lookup required)

## Core System Components

### Booking System (Production Implementation)

#### Transaction Safety Architecture (✅ Implemented)

```typescript
// Production Implementation (Transaction-Safe)
export async function createBooking(bookingData: BookingData): Promise<Booking> {
  try {
    const newBooking = await prisma.$transaction(async tx => {
      // 1. Validate real-time availability within transaction
      try {
        await validateRealTimeAvailability(date, time, tx)
      } catch (error) {
        if (error instanceof AvailabilityConflictError) {
          throw new BookingConflictError(error.message)
        }
        throw error
      }

      // 2. Create booking within transaction after availability validation
      return tx.booking.create({
        data: {
          name, email, phone, service, date, time,
          message, goals, experience,
        },
      })
    })

    return newBooking
  } catch (error) {
    handleBookingError(error)
  }
}
```

**Architectural Benefits**:

- **Atomicity**: All-or-nothing booking creation
- **Consistency**: Database always in valid state
- **Isolation**: Concurrent bookings don't interfere
- **Durability**: Committed bookings are permanent

#### Real-Time Availability Architecture (✅ Implemented)

```typescript
// Production API Endpoint: /api/availability
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  // Validate date input
  const validationResult = validateDateQuery(date)
  if (!validationResult.success) {
    return validationResult.error
  }

  // Check availability with transaction support
  const availabilityData = await checkAvailability(validationResult.data)
  
  // Return formatted availability response
  return formatAvailabilityResponse(availabilityData)
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
- **Native date input (deliberate)**: the scheduling step uses a native `<input type="date">`, not a calendar component — a `react-day-picker`/Radix Popover calendar nested in the booking Dialog trips a React 19 + `@radix-ui/react-focus-scope` infinite setState loop. See the comment in `components/booking-form/steps/scheduling/DateSelector.tsx`; don't "upgrade" it back to a calendar.

### Email Architecture (Stable Pattern)

#### Fire-and-Forget Implementation (✅ Production)

```typescript
// Production non-blocking email pattern
// app/api/book-session/route.ts
const newBooking = await createBooking(validationResult.data)

// Fire-and-forget notification sending (never blocks API response)
sendBookingNotifications(newBooking)

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

### Email Service Provider

**Gmail SMTP (Production Implementation):**
- **Provider**: Gmail SMTP (`smtp.gmail.com:587`, STARTTLS)
- **Library**: Nodemailer 9
- **Scale Threshold**: Sufficient for 50-100 bookings/month (~2-4 emails/day)
- **Configuration**: App-specific password via environment variables
- **Fire-and-Forget**: Email failures logged but never block booking success
- **Migration Trigger**: Consider dedicated service (SendGrid/Postmark) if volume exceeds 500 emails/month

**Environment Variables Required:**
- `SMTP_HOST` (default: smtp.gmail.com)
- `SMTP_PORT` (default: 587)
- `SMTP_SECURE` (false for STARTTLS)
- `SMTP_USER` (Gmail account with app-specific password)
- `SMTP_PASS` (Gmail app-specific password)
- `EMAIL_FROM` (sender email address)
- `EMAIL_FROM_NAME` (default: "MoodOverMuscle")
- `ADMIN_EMAIL` (Emily's notification email)

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

**Note**: Lighthouse CI configuration shown for reference. Currently used for local validation only. CI pipeline uses Playwright accessibility tests for WCAG compliance enforcement.

```javascript
// Local Lighthouse CI configuration (not in CI pipeline)
// Critical Gates (Build Blockers)
'categories:accessibility': ['error', { minScore: 0.95 }],  // WCAG compliance
'categories:seo': ['error', { minScore: 0.9 }],            // Search visibility
'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],  // LCP < 2.5s
'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],    // CLS < 0.1

// Warning Gates (non-blocking)
'categories:performance': ['warn', { minScore: 0.85 }],    // Overall performance
'audits:total-blocking-time': ['warn', { maxNumericValue: 300 }]  // TBT < 300ms
```

### Image Optimization Strategy

**Next.js Image Component Configuration ([`next.config.mjs`](next.config.mjs:3-7)):**
- **Formats**: AVIF (primary), WebP (fallback) - modern compression with 30-50% size reduction
- **Device Sizes**: [640, 750, 828, 1080, 1200, 1920] - mobile-first responsive breakpoints
- **Image Sizes**: [16, 32, 48, 64, 96, 128, 256, 384] - optimized for icons and thumbnails
- **CDN**: Vercel Image Optimization (automatic, zero-config, global edge caching)
- **Lazy Loading**: Native browser lazy loading with Next.js intersection observer enhancements
- **Performance Impact**: Reduces image payload by 40-60% vs unoptimized JPEGs

## Security Architecture & Constraints

### Authentication & Authorization

**JWT Token Strategy (jose library - Edge Runtime compatible):**
- **Session Tokens**: 8-hour lifetime for admin sessions
- **Storage**: HTTP-only cookies (prevents XSS attacks)
- **Algorithm**: HS256 (HMAC) for symmetric signing
- **Payload**: Minimal admin info (adminId, email, name)
- **Library**: `jose` for Edge Runtime compatibility

**Session Management:**
- Stateless JWT-only approach (no server-side session tracking)
- Session timeout: 8 hours absolute expiration
- Token refresh available for extending active sessions
- Single admin user (Emily) - no concurrent session limits needed

**Admin Authentication:**
- Simple password-based access for Emily (solo trainer)
- Bcrypt password hashing (hardcoded hash for single admin)
- Rate limiting on booking endpoints (protects admin notification emails)

### Input Validation Strategy (Defense in Depth)

Server-side validation with Zod on every input — never trust the client. The booking schema lives in [`lib/schemas.ts`](lib/schemas.ts) (`bookingSchema`); it validates types and format only. **Gap:** the `date` field has no server-side past/future bound — see the comment in `lib/schemas.ts` for the migration history — so the client-side `<input min>` is the only past-date guard, and it's bypassable via the API.

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
// Custom in-memory rate limiting store (sufficient for current scale)
export const rateLimitStore: Record<string, { count: number; firstRequest: number }> = {}
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
export const RATE_LIMIT_MAX = 5 // Max 5 booking attempts per IP

// Applied per IP via x-forwarded-for header in API routes
```

### Security Scanning Strategy

**Automated Security Validation:**
- **NPM Audit**: `pnpm audit --audit-level moderate` - vulnerability scanning in dependencies
- **Semgrep**: Static analysis security testing (optional, graceful degradation if not installed)
- **Schedule**: Pre-commit hooks + CI pipeline on every push
- **Thresholds**: Moderate+ vulnerabilities block deployment
- **False Positives**: Tracked in security exceptions if unavoidable

**Implementation:**
```typescript
// package.json scripts
"security:scan": "pnpm audit --audit-level moderate --production"
"security:semgrep": "semgrep --config=auto --quiet --error ."
"quality:gates": "... && pnpm security:scan && pnpm security:semgrep ..."
```

**CI Integration:** Security scans part of quality gates job, must pass for merge.

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

### Layered Pure-Handler Testing (NextRequest isn't mockable)

`NextRequest` (especially `.cookies`) can't be reliably constructed or mocked in the test env, so
route logic is extracted into **pure functions** tested directly: `lib/auth/admin-auth-handlers.ts`
(`handleLogin` / `handleSessionValidation`) and `app/api/*/functions/*.ts` (e.g. `booking-validation.ts`,
`booking-creation.ts`). The route handlers are thin wrappers over them. Where a route itself must be
exercised, tests build `new Request(...) as NextRequest`. Don't try to unit-test a route by mocking
`NextRequest` — test the pure function.

## Deployment Architecture (Zero-Maintenance)

### Vercel Platform Integration

- **Production Deployment**: Every merge to main branch
- **Preview Deployments**: Every pull request gets unique URL
- **Environment Variables**: Managed via Vercel dashboard
- **Rollback Capability**: One-click rollback through Vercel interface
- **Monitoring**: Built-in analytics and performance monitoring

### CI/CD Pipeline (GitHub Actions)

```yaml
# Automated quality enforcement with tiered failure handling
jobs:
  # Critical Gates (Build Blockers - must pass):
  - lint-and-typecheck: Code quality validation (ESLint + TypeScript)
  - test-critical: Essential business logic tests (Vitest)
  - test-accessibility: WCAG 2.1 AA compliance (Playwright + axe-core)
  - build: Application build verification (Next.js)
  
  # Warning Gates (Non-blocking):
  - test-integration: Full integration suite (continue-on-error: true)
  - size-check: Bundle size monitoring (informational only)
  
# CI Strategy:
- Critical tests block merge (no exceptions)
- Integration tests warn but don't block (non-blocking)
- Accessibility failures trigger automated PR comments
- All jobs use pnpm with frozen lockfile
```

### Database Deployment (Neon PostgreSQL)

- **Connection Pooling**: Handled automatically by Neon
- **Backups**: Automatic daily backups with point-in-time recovery
- **Scaling**: Serverless scaling based on demand
- **Migration Strategy**: Explicit configuration in vercel.json and package.json
  - **vercel.json**: `buildCommand: "npx prisma migrate deploy && pnpm build"`
  - **package.json**: `build: "prisma generate && next build"` (DB migrations run via `build:deploy` / Vercel buildCommand, not the plain `build`)
  - **Vercel Integration**: Migrations run before Next.js build on every deployment
  - **Rollback**: Via Vercel deployment rollback + manual migration revert if needed
  - **Safety**: Migrations are idempotent and tested in preview environments first

### Automated Dependency Management

**Renovate Bot** (`.github/renovate.json`):
- **Schedule**: Weekly updates (Mondays at 9am Australia/Sydney timezone)
- **Auto-merge Strategy**:
  - Patch updates (1.0.x): Auto-merge after quality gates pass
  - Minor updates (1.x.0): Auto-merge after quality gates pass
  - Major updates (x.0.0): Require manual review with `requires-attention` label
- **Separation**: npm/pnpm dependencies handled separately from GitHub Actions
- **Notifications**: GitHub email for PRs requiring manual intervention
- **Quality Gates**: All auto-merged PRs must pass full CI pipeline

**Benefits:**
- Reduces security vulnerability window (weekly patching)
- Prevents dependency drift (automated minor updates)
- Human oversight for breaking changes (major updates)
- Zero manual effort for routine updates (80% of dependencies)

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

### Phase 1: Transaction Safety (✅ Completed)

- **Database**: ✅ Unique constraints and status enum implemented
- **API**: ✅ Prisma transactions with conflict detection implemented
- **Testing**: ✅ Transaction safety test coverage added
- **Performance**: ✅ Maintaining <500ms API response times

### Phase 2: Real-Time Availability (✅ Completed)

- **API**: ✅ `/api/availability` endpoint implemented
- **Frontend**: ✅ Dynamic calendar integration operational
- **Caching**: ✅ Client-side availability caching active
- **Performance**: ✅ <500ms availability queries achieved

### Phase 3: Admin Dashboard (✅ Completed)

- **Authentication**: ✅ JWT-based admin access with jose library
- **UI**: ✅ Booking list and calendar views for Emily operational
- **API**: ✅ Admin CRUD operations for booking management implemented
- **Integration**: ✅ Email notification system integrated

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
- **pnpm**: Primary package manager (enforced via .npmrc), faster installs, stricter dependency resolution

### Local Development Quality Enforcement

**Pre-commit Hooks** (Husky + lint-staged + commitlint):
- **Automatic Linting**: ESLint + Prettier run on staged files before commit
- **Type Checking**: TypeScript validation on modified .ts/.tsx files
- **Commit Message Format**: Conventional commits enforced (feat:, fix:, docs:, etc.)
- **Configuration Files**:
  - `.husky/pre-commit` - Git hook trigger
  - `lint-staged.config.js` - Staged file linting
  - `commitlint.config.js` - Commit message validation

**Developer Experience:**
- Prevents committed code quality violations (catch before push)
- Auto-fixes formatting issues (Prettier)
- Enforces consistent commit history (conventional commits)
- Fast feedback loop (<5 seconds for typical commit)

**Installation:** Automatic via `pnpm install` (husky prepare script)

### Database Operations & Backup Strategy

**Routine Operations:**
- `pnpm db:setup` - Generate Prisma client, run migrations, seed data
- `pnpm db:studio` - Launch Prisma Studio for database inspection
- `pnpm db:reset` - Reset database (destructive, dev only)

**Backup & Restore:**
- `pnpm db:backup` - Manual backup via scripts/backup-database.sh
- `pnpm db:restore` - Restore from backup via scripts/restore-database.sh
- **Neon Automatic Backups**: Daily backups with point-in-time recovery (platform-managed)
- **Retention**: Neon free tier: 7 days; paid tiers: 30+ days

**Production Safety:**
- Never run `db:reset` in production (blocked by environment checks)
- Backups before major migrations (automated via CI)
- Point-in-time recovery available via Neon dashboard

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

**Last Updated**: 2026-07-13
**Architecture Status**: Transaction safety implemented, admin dashboard operational
**Next Review**: After multi-trainer support appetite (6+ months)
**Evolution Driver**: Emily's business needs and user feedback
