# Known Issues & Resolutions

Reference for debugging similar issues. Check here before investigating problems.

## Time & Date Issues

### Time Format Validation
**Problem**: Booking times failed validation in tests
**Root Cause**: Inconsistent time format (12hr vs 24hr, with/without timezone)
**Solution**: Standardized on ISO 8601 format throughout codebase
**Code**: `lib/validation/time-utils.ts`
**Prevention**: Always use `new Date().toISOString()` for API data

### DST Boundary Bugs
**Problem**: Calendar availability incorrect at DST transitions
**Root Cause**: Timezone conversion logic didn't account for DST changes
**Solution**: Use `date-fns-tz` library for timezone-aware operations
**Code**: `lib/utils/timezone.ts`
**Prevention**: Always use timezone-aware date libraries

## Testing Issues

### Critical Test Suite Failures (2025-10-11)
**Problem**: 17 tests failing across admin and booking integration tests
**Root Causes**:
1. Invalid JWT token test strings - `'not.a.jwt'` splits into 3 parts, passing validation
2. Response data structure mismatches - accessing undefined nested properties
3. Prisma mock returning undefined - jest-mock-extended not properly initialized
4. NextResponse.json() called twice in same test - returns Promise, not callable function
5. Service enum values - tests using 'Personal Training' instead of '1-on-1 Personal Training'

**Solutions Applied**:
1. **JWT token tests**: Use `'invalid-token-without-dots'` and `'invalid'` for proper validation
2. **Response validation**: Add `.toHaveProperty('data')` checks before accessing nested properties
3. **Prisma mock**: Implement in-memory store pattern for stateful mock operations
4. **Response handling**: Use `await response.json()` once, store result in variable
5. **Service enums**: Update test data to use correct enum values from schema

**Files Modified**:
- `__tests__/integration/admin-api-session.test.ts` - JWT validation logic
- `__tests__/integration/booking-transactions.test.ts` - Response structure + service enum
- `__tests__/integration/admin-api-bookings.test.ts` - Uses improved prisma-mock
- `__tests__/setup/prisma-mock.ts` - Added in-memory store for stateful mocks
- `__tests__/integration/booking-api.integration.test.ts` - Response.json() handling (partial)

**Results**: Improved from 36/53 passing (67.9%) to 48/53 passing (90.5%)

**Prevention**:
- Always verify JWT test strings don't accidentally match expected patterns
- Check response structure before accessing nested properties
- Use in-memory stores for stateful mock operations
- Never call response.json() twice - it returns a Promise
- Validate test data against schema enum values

**Remaining Issues** (5 tests):
- booking-api.integration.test.ts: NextResponse.json() method access pattern needs investigation
- These tests pass individually but fail in pre-commit suite

### Jest Mock Hoisting
**Problem**: Mocks not hoisted in ES modules
**Root Cause**: Jest hoisting doesn't work with `import` statements
**Solution**: Use `jest.unstable_mockModule()` instead of `jest.mock()`
**Code**: `tests/mocks/prisma-mock.ts`
**Pattern**: Always use unstable_mockModule for ESM mocks

### Transaction Test Failures
**Problem**: Tests fail due to transaction rollback timing
**Root Cause**: Race condition in async transaction cleanup
**Solution**: Use `await prisma.$transaction()` with proper cleanup
**Code**: `tests/integration/booking.test.ts`
**Prevention**: Always await transaction completion in tests

## Build Issues

### Next.js Dev Server Infinite Reload Loop (2025-10-11)
**Problem**: Dev server stuck in infinite reload loop, GET / 200 requests every ~80ms, Fast Refresh compiling 875 modules repeatedly

**Root Causes**:
1. **Vercel Analytics/Speed Insights Hot Reload Trigger**: The `@vercel/analytics` and `@vercel/speed-insights` packages can trigger hot reload loops in development
2. **useEffect dependency issue in BookingWizard**: Lines 103-108 have `submissionSuccess` and `onClose` as dependencies, creating potential re-render cycle
3. **Client component re-rendering**: `app/page.tsx` is a client component with state management that may be re-rendering unnecessarily

**Investigation Steps Taken**:
1. Examined `app/page.tsx` - client component with `useState` for booking modal
2. Examined `app/layout.tsx` - includes `<Analytics />` and `<SpeedInsights />` from Vercel
3. Examined `components/booking-form/BookingWizard.tsx` - `useEffect` at lines 103-108 with `setTimeout(() => onClose(), 0)`
4. Checked middleware.ts - admin route protection only, not causing issue
5. Confirmed no `next.config.js` exists (using Next.js defaults)

**Root Cause Analysis**:
The primary culprit is **Vercel Analytics/Speed Insights** combined with Fast Refresh in development mode. These packages have known issues triggering hot reload loops, especially when:
- Development server watches for file changes
- Packages inject scripts that modify the DOM
- Fast Refresh detects changes and recompiles

**Secondary Issue**: The `useEffect` in `BookingWizard.tsx` (lines 103-108) uses `setTimeout(() => onClose(), 0)` which can cause timing issues with React's render cycle.

**Solutions Applied**:
```typescript
// BookingWizard.tsx - useEffect with proper cleanup
useEffect(() => {
  if (submissionSuccess) {
    const timer = setTimeout(() => onClose(), 0)
    return () => clearTimeout(timer)  // ✅ Already has cleanup
  }
}, [submissionSuccess, onClose])
```

**Recommended Fixes**:

1. **Quick Fix - Disable Vercel packages in development**:
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === 'production' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

2. **Alternative - Use environment variable**:
```bash
# .env.local
NEXT_PUBLIC_VERCEL_ENV=development
```

3. **Nuclear Option - Remove Vercel packages temporarily**:
```bash
pnpm remove @vercel/analytics @vercel/speed-insights
```

**Prevention**:
- Always wrap third-party analytics in production-only conditionals
- Test dev server after adding monitoring packages
- Consider using `next.config.js` with `reactStrictMode: false` for debugging
- Monitor console for repeated Fast Refresh compilation cycles

**Verification**:
After applying fix, dev server should:
- Start normally with single compilation
- No repeated GET / requests
- Fast Refresh only triggers on actual file changes
- ~80ms reload loop should stop

**Files Affected**:
- `app/layout.tsx` - Contains Vercel Analytics/Speed Insights
- `components/booking-form/BookingWizard.tsx` - useEffect timing issue (minor)
- `app/page.tsx` - Client component with state (not primary cause)

**Related Issues**:
- Vercel Analytics GitHub issues: Hot reload loops in development
- Next.js Fast Refresh: Can be triggered by DOM modifications
- React 19 strict mode: Double-invokes effects in development

### Next.js Cache Corruption
**Problem**: Stale cache caused build failures after dependency updates
**Root Cause**: `.next/` directory cached outdated module resolution
**Solution**: Clear `.next/` directory on dependency changes
**Script**: `npm run clean && npm run build`
**Prevention**: Add postinstall script to clean cache

## Git/Commit Issues

### Pre-Commit Hook Bypass
**Problem**: Changes not staged caused pre-commit hooks to pass incorrectly
**Root Cause**: Hooks run on staged files, unstaged changes bypassed checks
**Solution**: Always `git add -A` before commit
**Prevention**: Pre-commit hook now checks for unstaged changes

## Database Issues

### Booking Conflicts Not Detected
**Problem**: Overlapping bookings allowed despite conflict detection
**Root Cause**: Race condition in availability check
**Solution**: Use `FOR UPDATE` lock in availability query
**Code**: `lib/db/availability-check.ts`
**Pattern**: Always use pessimistic locking for conflict-prone operations

### Prisma Relation Loading
**Problem**: Relations undefined at runtime despite type showing them
**Root Cause**: Forgot to use `include` in query
**Solution**: Always explicitly `include` relations in Prisma queries
**Pattern**: Never rely on implicit relation loading

## Performance Issues

### Slow API Response Times
**Problem**: Booking endpoint >1s response time
**Root Cause**: N+1 query problem loading nested relations
**Solution**: Use `include` with proper select to load relations in single query
**Code**: `lib/db/booking-queries.ts`
**Pattern**: Always profile queries, use Prisma's query logging

## Security Issues

### JWT Token Rotation
**Problem**: Long-lived access tokens presented security risk
**Root Cause**: No refresh token mechanism
**Solution**: Implement refresh token rotation with short-lived access tokens
**Code**: `lib/auth/jwt-service.ts`
**Pattern**: 15min access tokens, 7day refresh tokens with rotation

## Common Debugging Steps

### API Endpoint Issues
1. Check request validation (Zod schema)
2. Verify authentication middleware applied
3. Check database query (enable Prisma logging)
4. Verify response format matches expected structure

### UI/Component Issues
1. Check React DevTools for component state
2. Verify props passed correctly
3. Check browser console for errors
4. Verify API calls returning expected data

### Database Issues
1. Enable Prisma query logging: `DEBUG=prisma:query`
2. Check for N+1 queries
3. Verify relations included explicitly
4. Check for transaction deadlocks

## When to Document New Issues

**Document when:**
- Issue took >1 hour to debug
- Root cause non-obvious
- Solution reusable for similar issues
- Prevention pattern can be established

**Don't document:**
- Typos or simple mistakes
- One-off issues specific to local environment
- Issues with obvious solutions
