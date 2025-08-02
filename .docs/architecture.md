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

### Schema Architecture

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

### Key Design Decisions

- **CUID Primary Keys**: Better for distributed systems, sortable by creation time
- **Nullable Fields**: Flexible schema for optional user input (phone, message, goals, experience)
- **Time Storage**: DateTime for precise dates, String for user-selected time slots
- **Audit Trail**: Automatic createdAt/updatedAt timestamps

## Core Components

### Booking System

- **Multi-step Wizard**: Progressive form with validation at each step
- **Calendar Integration**: Date/time selection with availability checking
- **Email Notifications**: Automated confirmations via Nodemailer + SMTP
- **Rate Limiting**: In-memory IP-based protection (5 requests/minute)

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

### Testing Tools Integration

- **Jest**: Excellent Next.js integration, fast feedback loops
- **MSW**: Network-level mocking for realistic test scenarios
- **Playwright**: Superior browser automation with WCAG compliance testing
- **Privacy-Focused Lighthouse CI**: Local Chromium with complete isolation and automated quality enforcement

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

## Future Considerations

### Scalability Enhancements

```prisma
// Potential future schema additions
model Booking {
  // ... existing fields
  status        BookingStatus @default(PENDING)
  sessionDuration Int?         // Minutes
  location        String?      // Session location
  trainerId       String?
  trainer         Trainer?     @relation(fields: [trainerId], references: [id])
  paymentId       String?
  payment         Payment?     @relation(fields: [paymentId], references: [id])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
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
