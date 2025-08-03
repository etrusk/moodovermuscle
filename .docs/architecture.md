# System Architecture

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Email**: Nodemailer with Gmail SMTP
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Performance**: Vercel Analytics + SpeedInsights
- **Deployment**: Vercel with GitHub integration
- **Security**: Built-in Next.js security + rate limiting

## Database Design

### Current Schema Architecture

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

### Planned Schema Enhancements

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

  @@unique([date, time])  // Prevent double bookings
  @@index([date])         // Optimize availability queries
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

### Key Design Decisions

- **CUID Primary Keys**: Better for distributed systems, sortable by creation time
- **Nullable Fields**: Flexible schema for optional user input (phone, message, goals, experience)
- **Time Storage**: DateTime for precise dates, String for user-selected time slots
- **Audit Trail**: Automatic createdAt/updatedAt timestamps
- **Conflict Prevention**: Unique constraint on date/time combination prevents double bookings
- **Query Optimization**: Date indexing for efficient availability checking

## Core Components

### Booking System

- **Multi-step Wizard**: Progressive form with validation at each step
- **Calendar Integration**: Date/time selection with real-time availability checking
- **Transaction Safety**: Atomic booking operations with conflict detection and rollback
- **Email Notifications**: Automated confirmations via Nodemailer + SMTP (fire-and-forget)
- **Rate Limiting**: In-memory IP-based protection (5 requests/minute)
- **Conflict Prevention**: Database constraints and application logic prevent double bookings

### Email Architecture

- **Fire-and-forget Pattern**: Non-blocking email sending
- **Provider Flexibility**: SMTP-agnostic (Gmail dev, professional SMTP production)
- **Error Resilience**: Email failures don't break booking flow
- **Template Management**: HTML/text templates in code

### Performance Monitoring

- **Vercel Analytics**: Zero-maintenance user behavior tracking
- **SpeedInsights**: Real-time Core Web Vitals monitoring (LCP, FID, CLS)
- **Automated Alerts**: Built-in performance regression notifications

## Security Architecture

### Input Validation

- **Zod Schemas**: Server-side validation with TypeScript integration
- **Sanitization**: Automatic React JSX escaping + DOMPurify for rich content
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### Security Headers

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

- **Implementation**: In-memory per-IP tracking
- **Limits**: 5 requests per minute per IP address
- **Rationale**: Simple, sufficient for current scale, cost-effective

## Testing Architecture

### Test Pyramid

- **Unit Tests**: Jest + React Testing Library (80% coverage minimum)
- **Integration Tests**: MSW for realistic API mocking
- **E2E Tests**: Playwright with accessibility validation
- **Performance Tests**: Privacy-focused Lighthouse CI with automated quality gates
- **Accessibility Tests**: Comprehensive automated WCAG 2.1 AA compliance testing

### Testing Tools Integration

- **Jest**: Excellent Next.js integration, fast feedback loops
- **MSW**: Network-level mocking for realistic test scenarios
- **Playwright**: Superior browser automation with WCAG compliance testing
- **Privacy-Focused Lighthouse CI**: Local Chromium with complete isolation and automated quality enforcement
- **Automated Accessibility Testing**: Three-layer approach eliminating manual verification requirements

### Accessibility Testing Architecture

**Three-Layer Automated Testing Approach**

**Unit Level: Enhanced Jest + jest-axe**

- Custom accessibility testing utilities with comprehensive validation
- Keyboard navigation testing automation
- Screen reader output simulation and validation
- Focus management testing across components
- Form accessibility testing with validation feedback
- Dynamic content accessibility testing (loading states, live regions)

**Integration Level: Playwright Accessibility Automation**

- Complex user journey accessibility validation
- Modal dialog, dropdown, and date picker accessibility testing
- Form wizard accessibility flow validation
- Cross-browser accessibility testing (Chromium, Firefox, Mobile)
- Touch interaction accessibility validation
- Keyboard-only navigation testing

**System Level: Enhanced Lighthouse CI**

- Raised accessibility threshold to 95% (from 90%)
- Zero-tolerance critical violations (color contrast, alt text, labeling)
- Comprehensive accessibility audit coverage
- Privacy-hardened configuration with automated quality enforcement

**Accessibility Quality Gates Framework**

```javascript
// Critical Accessibility Gates (Build Blockers)
'categories:accessibility': ['error', { minScore: 0.95 }],  // Raised from 0.9
'audits:color-contrast': ['error', { minScore: 1.0 }],      // 100% compliance
'audits:image-alt': ['error', { minScore: 1.0 }],           // 100% coverage
'audits:label': ['error', { minScore: 1.0 }],               // 100% form labeling
'audits:link-name': ['error', { minScore: 1.0 }],           // 100% link naming
'audits:button-name': ['error', { minScore: 1.0 }],         // 100% button naming
'audits:heading-order': ['error', { minScore: 1.0 }],       // 100% heading structure
'audits:landmark-one-main': ['error', { minScore: 1.0 }],   // 100% landmark usage

// Warning Accessibility Gates (Tracked)
'audits:skip-link': ['warn', { minScore: 1.0 }],            // Skip link implementation
'audits:tabindex': ['warn', { minScore: 1.0 }],             // Tab index usage
'audits:use-landmarks': ['warn', { minScore: 1.0 }],        // Advanced landmark usage
```

**Accessibility Regression Prevention**

- **Baseline Management**: Automated comparison of accessibility metrics across test runs
- **Regression Detection**: Automated detection of decreased accessibility scores or increased violations
- **Baseline Updates**: Automatic baseline updates when accessibility metrics improve
- **Comprehensive Reporting**: Detailed accessibility compliance reports with violation analysis

**File Architecture for Accessibility Testing**

```
__tests__/setup/
├── accessibility-utils.ts           # Core accessibility testing utilities
├── accessibility-test-patterns.ts   # Reusable accessibility test templates
└── accessibility-setup.js          # Accessibility test environment setup

e2e/utils/
└── accessibility-helpers.ts        # Playwright accessibility automation

scripts/
├── accessibility-regression-check.sh    # Automated regression detection
├── validate-accessibility-compliance.sh # Compliance validation
└── generate-accessibility-report.sh     # Accessibility reporting

configs/
├── jest.config.accessibility.ts    # Jest accessibility configuration
├── playwright.config.accessibility.ts # Playwright accessibility configuration
└── lighthouserc.accessibility.js   # Enhanced Lighthouse accessibility configuration
```

**Accessibility Testing Integration**

- **Unit Tests**: Every component automatically tested for accessibility violations
- **Integration Tests**: Complex user flows validated for accessibility compliance
- **E2E Tests**: Complete user journeys tested across browsers with accessibility validation
- **CI/CD Pipeline**: Automated accessibility testing with build blocking on critical violations
- **Regression Prevention**: Continuous monitoring and prevention of accessibility regressions

## Lighthouse CI Architecture

### Privacy-First Implementation

**Local Chromium with Complete Isolation**

- **Installation**: Direct Chromium package installation with privacy-hardened configuration
- **Profile Isolation**: Dedicated `~/.lighthouse-chrome-profile` directory, completely separate from personal browsing
- **Zero Persistent Data**: Profile wiped clean before and after each test run
- **Process Management**: All Chrome processes terminated after testing to prevent data leakage

**Privacy-Hardened Chrome Configuration**

```javascript
// Network Privacy Protection
;('--disable-background-networking', // No background requests
  '--disable-sync', // No Google account sync
  '--disable-translate', // No translation services
  '--no-pings', // No ping requests
  '--no-referrers', // No referrer headers
  // Data Collection Prevention
  '--disable-breakpad', // No crash reporting
  '--disable-client-side-phishing-detection', // No phishing detection
  '--disable-component-update', // No component updates
  '--disable-logging', // No logging to disk
  '--disable-domain-reliability', // No domain reliability tracking
  // Complete Profile Isolation
  '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
  '--headless', // No GUI
  '--disable-gpu') // No GPU acceleration
```

**Automated Cleanup Workflow**

- **Pre-test**: Complete profile directory removal and recreation
- **Post-test**: Automatic cleanup with process termination
- **Fail-safe**: Cleanup scripts ensure no persistent data accumulation
- **Privacy Assessment**: Minimal exposure (localhost:3001 only), zero persistent data

### Quality Gate Framework

**Critical Gates (Build Blockers) 🔴**

```javascript
// Accessibility & SEO (Non-negotiable)
'categories:accessibility': ['error', { minScore: 0.9 }],  // WCAG compliance
'categories:seo': ['error', { minScore: 0.9 }],            // Search visibility
'categories:best-practices': ['error', { minScore: 0.85 }], // Security standards

// Core Web Vitals (User Experience)
'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],  // LCP < 2.5s
'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],    // CLS < 0.1

// Critical Accessibility Audits
'audits:color-contrast': ['error', { minScore: 1.0 }],     // 100% contrast compliance
'audits:image-alt': ['error', { minScore: 1.0 }],          // 100% alt text coverage
'audits:meta-description': ['error', { minScore: 1.0 }],   // SEO essential
'audits:is-on-https': ['error', { minScore: 1.0 }]         // Security requirement
```

**Warning Gates (Tracked) 🟡**

```javascript
// Performance Budgets
'categories:performance': ['warn', { minScore: 0.85 }],           // Overall performance
'audits:first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // FCP < 2s
'audits:total-blocking-time': ['warn', { maxNumericValue: 300 }],      // TBT < 300ms
'audits:total-byte-weight': ['warn', { maxNumericValue: 1048576 }],    // < 1MB total
'audits:dom-size': ['warn', { maxNumericValue: 1500 }]                 // < 1500 elements
```

### Automated Quality Enforcement

**Exit Code Based Workflow**

- **Success (0)**: All critical gates pass → Automatic deployment proceeds
- **Failure (1)**: Critical gates fail → Build blocked with specific failure details
- **No Manual Decisions**: Objective thresholds eliminate subjective quality assessments

**Build Integration**

- **Local Development**: `npm run lighthouse:test` provides immediate feedback
- **CI/CD Pipeline**: Automated enforcement in GitHub Actions workflow
- **Quality Validation**: `npm run lighthouse:validate` checks existing results
- **Emergency Override**: Manual bypass available with debt tracking requirement

### Technical Implementation Details

**File Architecture**

- **Configuration**: [`lighthouserc.js`](../lighthouserc.js) - Privacy-hardened settings with quality gates
- **Cleanup Script**: [`scripts/lighthouse-cleanup.sh`](../scripts/lighthouse-cleanup.sh) - Automated profile cleanup
- **Quality Gates**: [`scripts/lighthouse-quality-gates.sh`](../scripts/lighthouse-quality-gates.sh) - Validation and reporting
- **Report Storage**: `.lighthouseci/` directory with temporary public URLs

**Privacy Risk Assessment**

- **Protected**: Personal browsing data, passwords, extensions, Google sync, location tracking
- **Minimal Exposure**: localhost:3001 testing target only, basic system info (auto-cleaned)
- **Risk Level**: MINIMAL - Complete isolation with automatic cleanup

### Integration with Testing Architecture

**Test Pyramid Enhancement**

- **Unit Tests**: Jest + React Testing Library (80% coverage minimum)
- **Integration Tests**: MSW for realistic API mocking
- **E2E Tests**: Playwright with accessibility validation
- **Performance Tests**: Privacy-focused Lighthouse CI with automated quality gates

**Quality Gate Alignment**

- **Critical Gates**: Never bypass - accessibility, SEO, security, Core Web Vitals
- **Non-Critical Gates**: Can bypass with tracking in [`.docs/debt.md`](.docs/debt.md)
- **Automated Enforcement**: Consistent standards across all environments
- **WCAG Compliance**: Zero accessibility violations requirement maintained

### CachyOS Compatibility & FLOSS Compliance

**Local Implementation Benefits**

- **CachyOS Native**: Works seamlessly with system Chromium package
- **FLOSS Compliance**: Open-source Chromium, no proprietary dependencies
- **Development Efficiency**: Fast local feedback without container overhead
- **Privacy Protection**: Equivalent to containerized approach with proper isolation

**Alternative Approaches Considered**

- **Docker Solution**: Abandoned due to persistent Chrome interstitial errors on CachyOS
- **CI-Only Testing**: Available as fallback but lacks local development feedback
- **Current Approach**: Optimal balance of functionality, privacy, and development efficiency

## System Constraints

- Single client business (Emily's fitness coaching)
- Solo developer with agentic LLM assistance
- FLOSS/free tools preferred
- Privacy-conscious solution choices
- Functionality over complexity
- Zero accessibility violations requirement

## Deployment Architecture

### Environment Strategy

- **Production**: Vercel deployment triggered by main branch
- **Preview**: Automatic preview deployments for all pull requests
- **Database**: Neon serverless PostgreSQL with connection pooling

### CI/CD Pipeline

- **GitHub Actions**: Lint, test, build, size-check, privacy-focused lighthouse audits
- **Quality Gates**: Critical tests must pass, non-critical tracked in debt
- **Privacy-Focused Lighthouse**: Local Chromium with automated quality enforcement
- **Vercel Integration**: Automatic deployments with rollback capability

### Lighthouse CI Workflow

1. **Build Stage**: Create production build artifacts with `npm run build`
2. **Audit Stage**: Run Lighthouse CI with privacy-hardened Chrome configuration
3. **Quality Gate**: Automated pass/fail enforcement blocks deployment if critical thresholds fail
4. **Deploy Stage**: Deploy to Vercel only if automated quality gates pass
5. **Cleanup Stage**: Automatic Chrome profile cleanup ensures zero persistent data

### Automated Quality Enforcement

- **Exit Code Based**: `npm run lighthouse:test` returns 0 (pass) or 1 (fail)
- **Build Blocking**: Failed quality gates prevent deployment automatically
- **No Manual Decisions**: Objective thresholds with consistent enforcement
- **Privacy Protection**: Complete profile isolation with automatic cleanup

## Current Implementation Status

### Transaction Safety & Calendar Integration

**Status**: Planning Complete → Ready for Implementation

**Critical Gaps Addressed**:
- Database transaction safety for atomic booking operations
- Real-time calendar availability checking to prevent conflicts
- Booking conflict detection with proper rollback mechanisms
- Enhanced schema with constraints and status management

**Implementation Priority**:
1. **Phase 1**: Transaction safety with conflict detection (Critical)
2. **Phase 2**: Real-time availability API and calendar integration (High)
3. **Phase 3**: Enhanced user experience and booking status management (Medium)

### Admin Dashboard Requirements

**Current State**: Email-only notifications for Emily
**Next Phase**: Web-based admin interface for booking management

**Essential Features Planned**:
- Booking list view with status management
- Calendar view showing daily/weekly schedules
- Customer communication tools
- Basic authentication for admin access

## Future Considerations

### Scalability Enhancements

**Multi-trainer Support**:
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

**Payment Integration**:
```prisma
model Payment {
  id        String   @id @default(cuid())
  bookingId String   @unique
  booking   Booking  @relation(fields: [bookingId], references: [id])
  amount    Decimal
  status    PaymentStatus
  createdAt DateTime @default(now())
}
```

### Performance Optimizations

- Image optimization strategy
- Database indexing for common queries
- Caching strategy for static content
- Bundle size optimization

## Key Architectural Decisions

1. **Next.js App Router**: Modern React patterns with SSR capabilities
2. **Prisma + Neon**: Type-safe database with serverless optimization
3. **Vercel Platform**: Zero-maintenance monitoring and deployment
4. **Mobile-First Design**: WCAG 2.1 AA compliance requirement
5. **Lean Development**: Functionality over unnecessary complexity
