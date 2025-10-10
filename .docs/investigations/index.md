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
