# Failure Recovery Patterns & Learning

## Test Suite Failures (Resolved 2025-08-03)

### Component Testing Race Conditions

**Failure Pattern**: Async data fetching in components caused intermittent test failures
**Root Cause**: Tests were dependent on real network requests and timing

**Failed Approaches**:

- Trying to control timing with `waitFor` and delays
- Mocking at the component level with complex async state management
- Using `act()` to wrap async operations (still had race conditions)

**Successful Resolution**: Extract data fetching into custom hooks

```typescript
// Before: Unreliable component with async data fetching
const SchedulingStep = () => {
  const [times, setTimes] = useState([])

  useEffect(() => {
    // Direct API call in component - hard to test deterministically
    fetchAvailableTimes(selectedDate).then(setTimes)
  }, [selectedDate])
}

// After: Testable component with injected dependencies
const SchedulingStep = () => {
  const { availableTimes, isLoading } = useAvailability(selectedDate)
  // Component purely focuses on UI, data fetching abstracted
}

// Test: Deterministic hook mocking
jest.mock('../useAvailability', () => ({
  useAvailability: jest.fn().mockReturnValue({
    availableTimes: ['09:00', '10:00'],
    isLoading: false,
  }),
}))
```

**Key Learning**: Separate data fetching from UI logic for testable components
**Prevention**: Always extract async operations into custom hooks or services
**Early Warning Signs**: Tests that occasionally fail on CI but pass locally

### API Route Test Mocking Inconsistencies

**Failure Pattern**: Inconsistent Prisma mocking caused API tests to fail unpredictably
**Root Cause**: Different mocking strategies across test files, incomplete NextRequest mocking

**Failed Approaches**:

- Trying to mock Prisma at different levels (client, model, method)
- Inconsistent NextRequest constructor patterns
- Complex transaction mocking with nested promises

**Successful Resolution**: Standardized mocking patterns across all API tests

```typescript
// Standardized API Test Pattern
function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    body: blob,
  })
}

// Consistent Prisma mocking
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

**Key Learning**: Consistency in test patterns is more important than perfection
**Prevention**: Document and template successful mocking patterns
**Early Warning Signs**: API tests fail with different error messages on different runs

## Lighthouse CI Docker Failure (Resolved 2025-08-02)

### Docker Chrome Interstitial Errors

**Failure Pattern**: Persistent Chrome interstitial errors in containerized environments on CachyOS
**Root Cause**: Chrome security model conflicts with container sandboxing

**Failed Approaches**:

- Multiple Docker Chrome configurations (headless, sandbox disabled, different base images)
- Various Chrome flags to bypass security features
- Different container runtimes and security contexts
- Xvfb virtual display configurations

**Attempted Solutions**:

```dockerfile
# Failed: Multiple Docker configurations tried
FROM mcr.microsoft.com/playwright:v1.40.0-focal
FROM node:18-alpine
FROM lighthouse-ci/docker-node

# Failed: Various Chrome flags
--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage
--disable-background-timer-throttling --disable-renderer-backgrounding
--disable-features=TranslateUI --disable-ipc-flooding-protection
```

**Successful Resolution**: Local Chromium with privacy-hardened configuration

```javascript
// Privacy-focused local implementation
const chromeFlags = [
  '--disable-background-networking',
  '--disable-sync',
  '--disable-translate',
  '--no-pings',
  '--no-referrers',
  '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
  '--headless',
  '--disable-gpu',
]
```

**Key Learning**: Sometimes simple solutions work better than complex ones
**Prevention**: Prefer platform-native solutions over containerization when privacy/compatibility issues arise
**Early Warning Signs**: Persistent interstitial errors despite multiple configuration attempts

## Integration Test Library Updates (Resolved 2025-08-01)

### Calendar Component Test Failures

**Failure Pattern**: react-day-picker library updates broke existing test selectors
**Root Cause**: Tests relied on brittle data-testid selectors instead of semantic selectors

**Failed Approaches**:

- Updating data-testid values to match new library output
- Complex CSS selectors to target calendar elements
- Waiting for specific DOM structures that changed

**Successful Resolution**: Switch to accessibility-focused selectors

```typescript
// Before: Brittle selector-based tests
await page.click('[data-testid="calendar-next-month"]')
await page.click('[data-testid="date-15"]')

// After: Semantic, accessibility-focused selectors
await page.getByRole('button', { name: 'Next month' }).click()
await page.getByRole('button', { name: '15' }).click()
```

**Key Learning**: Semantic selectors are more resilient to library changes
**Prevention**: Use `getByRole`, `getByLabelText` instead of `data-testid` when possible
**Early Warning Signs**: Tests break after dependency updates, even when functionality works

## Email Service Integration Challenges (Resolved 2025-07-30)

### Email Failures Blocking Booking Flow

**Failure Pattern**: SMTP connection failures caused entire booking process to fail
**Root Cause**: Synchronous email sending blocked API response

**Failed Approaches**:

- Implementing retry logic with exponential backoff
- Switching to different email providers
- Adding complex error handling with user notification

**Successful Resolution**: Fire-and-forget email pattern

```typescript
// Before: Blocking email sending
const booking = await prisma.booking.create({ data })
await sendConfirmationEmail(booking) // This could fail and block response
return NextResponse.json({ success: true })

// After: Non-blocking fire-and-forget
const booking = await prisma.booking.create({ data })

// Fire-and-forget email sending
sendConfirmationEmail(booking).catch(err => console.error('Email failed:', err))

return NextResponse.json({ success: true }) // Immediate response
```

**Key Learning**: User workflows should never depend on non-critical external services
**Prevention**: Identify critical vs non-critical operations in system design
**Early Warning Signs**: API timeouts during email service outages

## Performance Degradation Patterns

### Image Loading Performance Issues (Resolved 2025-08-01)

**Failure Pattern**: Slow page loads on mobile devices due to unoptimized images
**Root Cause**: Large image files served without optimization or responsive sizing

**Failed Approaches**:

- Manual image compression without format optimization
- CSS-only responsive images without proper sizing hints
- Loading all images eagerly without priority optimization

**Successful Resolution**: Next.js Image optimization with responsive sizing

```typescript
// Before: Unoptimized image loading
<img src="/images/hero-large.jpg" alt="Training" />

// After: Optimized with responsive sizing
<Image
  src="/images/hero-image.jpg"
  alt="Fitness training session"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>
```

**Key Learning**: Image optimization has significant performance impact on mobile
**Prevention**: Use Next.js Image component by default, set proper sizing
**Early Warning Signs**: Poor Lighthouse performance scores, high LCP values

## Database Migration Challenges

### Schema Evolution Complexity

**Failure Pattern**: Difficulty making database changes without breaking existing functionality
**Root Cause**: Lack of migration planning and rollback strategies

**Learning from Near-Misses**:

- Always test migrations in development first
- Plan rollback strategies before implementing forward migrations
- Consider data preservation during schema changes

**Successful Patterns**:

```sql
-- Safe migration pattern with backwards compatibility
ALTER TABLE booking ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE booking ADD COLUMN session_duration INTEGER DEFAULT 60;

-- Add constraints in separate migration after data verification
-- ALTER TABLE booking ADD CONSTRAINT unique_date_time UNIQUE (date, time);
```

**Key Learning**: Incremental schema changes are safer than big-bang migrations
**Prevention**: Always plan migration and rollback steps together
**Early Warning Signs**: Complex migrations that change multiple things at once

## Security & Validation Failures

### Input Validation Bypasses

**Failure Pattern**: User input not properly validated, potential for malformed data
**Root Cause**: Client-side validation without server-side verification

**Prevention Patterns**:

```typescript
// Always validate on server-side with Zod
const validatedData = bookingSchema.safeParse(formData)
if (!validatedData.success) {
  return NextResponse.json(
    {
      message: 'Invalid form data.',
      errors: validatedData.error.flatten().fieldErrors,
    },
    { status: 400 }
  )
}
```

**Key Learning**: Never trust client-side validation alone
**Prevention**: Server-side validation for all user inputs
**Early Warning Signs**: Inconsistent data in database, type errors in production

## Common Recovery Strategies

### Rollback Procedures

1. **Code Rollback**: Git revert to last known good commit
2. **Database Rollback**: Run down migrations if schema changed
3. **Deployment Rollback**: Vercel one-click rollback to previous deployment
4. **Feature Flag**: Disable new features without code deployment

### Emergency Debugging Steps

1. **Check Recent Changes**: What was deployed/changed recently?
2. **Verify Environment**: Are environment variables correct?
3. **Check Dependencies**: Did any package versions change?
4. **Review Logs**: What do the error logs show?
5. **Test in Isolation**: Can the issue be reproduced locally?

### Communication During Failures

1. **Document the Issue**: Clear description of symptoms
2. **Assess Impact**: How many users are affected?
3. **Estimate Resolution Time**: Quick fix vs. longer investigation?
4. **Implement Workaround**: Can we minimize impact while fixing?
5. **Post-Mortem**: What can we learn to prevent recurrence?

## Failed Tools & Approaches

### Debugging Tools That Didn't Help

- **Complex Browser DevTools Debugging**: Often too granular for component-level issues
- **Extensive Logging**: Created noise rather than signal
- **Manual Testing Only**: Inconsistent and time-consuming

### Approaches That Backfired

- **Over-Engineering**: Complex solutions for simple problems
- **Premature Optimization**: Optimizing before identifying actual bottlenecks
- **Magic Configuration**: Complex configs that nobody understood

### Time-Wasting Anti-Patterns

- **Yak Shaving**: Fixing peripheral issues instead of core problems
- **Copy-Paste Solutions**: Taking random fixes from Stack Overflow without understanding
- **Tool Proliferation**: Adding more tools instead of using existing ones effectively

## Recovery Time Metrics

### Typical Resolution Times (Based on Experience)

- **Component Test Failures**: 2-4 hours (extract hooks, mock properly)
- **API Integration Issues**: 1-3 hours (standardize mocking patterns)
- **Library Update Breaks**: 1-2 hours (switch to semantic selectors)
- **Performance Regressions**: 3-6 hours (identify bottleneck, implement fix)
- **Email Service Issues**: 30 minutes (implement fire-and-forget)

### Prevention vs. Recovery Investment

- **Prevention**: Invest 20% extra time in proper architecture
- **Recovery**: Often takes 2-5x longer than prevention would have
- **Learning**: Document patterns to prevent similar failures

## Early Warning Systems

### Automated Detection

- **CI/CD Pipeline**: Catches issues before deployment
- **Lighthouse CI**: Performance regression detection
- **Test Suite**: Reliability issues surface as intermittent failures
- **TypeScript**: Type errors often indicate deeper design issues

### Manual Monitoring

- **User Feedback**: Emily's experience using the system
- **Performance Metrics**: Vercel Analytics for real-world performance
- **Error Logs**: Console errors and server logs
- **Build Times**: Increasing build times often indicate complexity creep

## Institutional Memory Patterns

### What to Document

- **Root Causes**: Why did this fail, not just what failed
- **Failed Approaches**: Save others from repeating ineffective solutions
- **Successful Patterns**: Reusable solutions for similar problems
- **Warning Signs**: Early indicators of potential issues

### What Not to Document

- **Temporary Workarounds**: Unless they become permanent
- **Tool-Specific Details**: Focus on patterns, not implementation details
- **Blame or Frustration**: Focus on learning and prevention
- **One-Off Issues**: Only document patterns that might recur

---

**Last Updated**: 2025-08-03  
**Failure Patterns Documented**: 8 major failure categories  
**Recovery Strategies**: 15 actionable recovery patterns  
**Next Update**: Add new patterns as they emerge from development
