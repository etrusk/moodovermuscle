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

### Next.js Dev Server Infinite Reload Loop (2025-10-11) - ✅ RESOLVED

**Severity**: Critical (100% CPU usage, development blocked)

**Problem**: Dev server stuck in infinite reload loop, compiling every ~500ms repeatedly, 100% CPU usage

**Initial Investigation (Multiple False Leads)**:
1. Initially suspected Vercel Analytics/Speed Insights packages - removed but issue persisted
2. Suspected React component re-render loops - added `useCallback` but issue persisted
3. Investigated file watcher issues - ruled out (no continuous file modifications)
4. Suspected webpack chunk loading failures from browser console errors

**Actual Root Cause (Final)**:
**Webpack file watcher permission errors on `.docker/postgres-data` directory**

Build output revealed:
```
glob error [Error: EACCES: permission denied, scandir '/home/bob/Projects/moodovermuscle/.docker/postgres-data']
Failed to compile.
Error: EACCES: permission denied, scandir '/home/bob/Projects/moodovermuscle/.docker/postgres-data'
```

Webpack was attempting to scan the Docker data directory during hot reload, hitting permission denied errors, and continuously retrying → infinite compilation loop.

**Why This Caused Infinite Loop**:
1. Dev server starts successfully
2. Webpack file watcher scans project directories for changes
3. **Attempts to scan `.docker/postgres-data` → permission denied (EACCES)**
4. Webpack detects "error" and triggers recompilation
5. Process repeats infinitely → 100% CPU usage

**Final Solution**:
Enhanced webpack `watchOptions.ignored` configuration to explicitly exclude all restricted directories:

```javascript
// next.config.mjs - WORKING FIX
webpack: (config, { dev, isServer }) => {
  if (dev && !isServer) {
    config.optimization = {
      ...config.optimization,
      runtimeChunk: false,
      splitChunks: false,
    }
  }
  
  config.watchOptions = {
    ...config.watchOptions,
    ignored: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.git/**',
      '**/.docker/**',           // Critical fix
      '**/postgres-data/**',     // Critical fix
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
    ],
    poll: 1000,
    aggregateTimeout: 300,
  }
  return config
}
```

**Why This Fixed It**:
- Explicitly excluding `.docker/**` and `postgres-data/**` prevents webpack from attempting to scan restricted directories
- Permission errors no longer trigger recompilation attempts
- File watcher only monitors accessible directories

**Prevention Pattern**:
- **Always exclude Docker data directories** from webpack watching
- Add all restricted/permission-protected directories to `watchOptions.ignored`
- Ensure both `.gitignore` and webpack ignore patterns are synchronized
- Monitor for EACCES errors in build output during development

**Verification Results**:
✅ Only 2 compilations (initial + hot reload), then stopped
✅ No repeated GET / requests
✅ No permission denied errors
✅ CPU usage normal
✅ Dev server functional

**Files Modified**:
- `next.config.mjs` - Enhanced `watchOptions.ignored` array to exclude Docker directories
- `app/page.tsx` - Added `useCallback` for stable function references (good practice, not root cause)

**Related Issues**:
- Docker data directories with restricted permissions
- Webpack file watcher permission errors
- Container development environments

**Key Lessons**:
1. **Permission denied errors can cause infinite compilation loops** - webpack treats them as file changes
2. **Always check build output for EACCES errors** - they indicate file watcher issues
3. **Exclude all restricted directories** from webpack watching explicitly
4. **Browser console errors can be misleading** - the syntax errors were symptoms, not the cause
5. **Docker data directories should always be excluded** from development tooling watchers

**Environment-Specific Notes**:
- Docker data directories should always be excluded from webpack watching
- Permission errors in file watchers can cause infinite compilation loops
- Both `.gitignore` and webpack `watchOptions.ignored` need proper configuration

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
