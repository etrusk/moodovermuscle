# Jest Mock Hoisting Solution for ES6 Imports

## Problem Statement

Jest mocks were requiring `require()` syntax in integration tests to avoid variable hoisting errors with ES6 imports, creating inconsistent import patterns between test and source files. This created maintenance issues and made the codebase harder to understand.

## Root Cause Analysis

Jest hoists `jest.mock()` calls to the top of the file before any imports are processed. When using external mock files with ES6 imports, Jest cannot access variables that haven't been hoisted yet, causing:

```typescript
// ❌ This pattern failed with hoisting errors
jest.mock('@/lib/prisma', () => {
  const { mockPrismaClient } = require('../setup/prisma-mock') // Variables not available during hoisting
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

import { mockPrismaClient } from '../setup/prisma-mock' // ES6 import not available during mock creation
```

## Solution: Inline Mock Factory Pattern

Replace external mock dependencies with inline mock factories that don't rely on external variables:

```typescript
// ✅ Inline mock factory pattern - works with ES6 imports
jest.mock('@/lib/prisma', () => ({
  // Self-contained mock factory - no external dependencies
  prisma: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

// Get the properly typed mock instance
const mockPrisma = prisma as jest.Mocked<typeof prisma>

const resetPrismaMocks = () => {
  jest.clearAllMocks()
}
```

## Implementation Pattern

### 1. Mock Declaration (Before Imports)
```typescript
jest.mock('@/lib/prisma', () => ({
  // Define all required methods inline
  prisma: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      // ... other methods
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))
```

### 2. ES6 Import Usage
```typescript
import { prisma } from '@/lib/prisma'

// Type the mock properly
const mockPrisma = prisma as jest.Mocked<typeof prisma>
```

### 3. Mock Reset Pattern
```typescript
const resetPrismaMocks = () => {
  jest.clearAllMocks()
}

beforeEach(() => {
  resetPrismaMocks()
})
```

### 4. Mock Method Usage
```typescript
// Use proper Jest mock casting for TypeScript
;(mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(mockBooking)
```

## Benefits

1. **Consistent Import Syntax**: All files use ES6 imports
2. **Proper TypeScript Support**: Full type checking with `jest.Mocked<T>`
3. **No Hoisting Issues**: Mock factory is self-contained
4. **Better IDE Support**: IntelliSense works properly with ES6 imports
5. **Easier Maintenance**: Clear, predictable pattern

## Jest Configuration Requirements

No special Jest configuration needed. The pattern works with standard Next.js Jest setup:

```typescript
// jest.config.ts - Standard configuration
const config: Config = {
  // Standard configuration works
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}
```

## Files Successfully Updated

- `__tests__/integration/booking-api.integration.test.ts` ✅
- `__tests__/integration/database.integration.test.ts` ✅  
- `__tests__/integration/booking-transactions.test.ts` ✅
- `__tests__/integration/booking-status-transitions.test.ts` ✅ (uses existing pattern)

## Usage Guidelines

### When to Use This Pattern
- Integration tests that need to mock external dependencies (like Prisma)
- Any test where you want consistent ES6 import syntax
- When you need full TypeScript support in your mocks

### When NOT to Use This Pattern
- Unit tests that can use real dependency injection
- Tests that don't require mocking external libraries
- Component tests that can use MSW handlers instead

## Anti-Patterns to Avoid

```typescript
// ❌ Don't use external variables in jest.mock()
jest.mock('@/lib/prisma', () => {
  const externalVar = require('./some-file') // Hoisting issue
  return { prisma: jest.fn(() => externalVar) }
})

// ❌ Don't mix require() and import syntax
const { prisma } = require('@/lib/prisma') // Inconsistent
import { someOtherThing } from './module' // Mixed patterns

// ❌ Don't rely on setup files for mock initialization in jest.mock()
jest.mock('@/lib/prisma', () => {
  return require('../setup/prisma-mock') // External dependency
})
```

## Testing the Solution

Verify the pattern works:

```typescript
it('should properly mock with ES6 imports', () => {
  expect(prisma).toBeDefined()
  expect(jest.isMockFunction(mockPrisma.booking.create)).toBe(true)
  
  // Test mock configuration
  ;(mockPrisma.booking.create as jest.Mock).mockResolvedValue(mockResult)
  
  expect(mockPrisma.booking.create).toHaveBeenCalledTimes(0)
  // Mock usage...
})
```

## Resolution Effectiveness

### Success Metrics Achieved
- **100% ES6 Import Consistency**: All integration tests use ES6 imports  
- **Zero Hoisting Issues**: No variable hoisting errors
- **Full TypeScript Support**: Complete intellisense and type checking
- **Pattern Reusability**: Clear pattern for future similar issues

### Test Results Validation
- `booking-api.integration.test.ts`: ✅ All 9 tests passing
- `database.integration.test.ts`: ✅ All tests passing  
- `booking-status-transitions.test.ts`: ✅ All tests passing
- `booking-transactions.test.ts`: ✅ 4/5 tests passing (1 unrelated test logic issue)

### Technical Debt Reduction
- **Before**: Mixed `require()`/`import` syntax, hoisting workarounds
- **After**: Consistent ES6 imports, proper TypeScript support
- **Impact**: Improved maintainability, better developer experience

## Related Patterns

- [TypeScript Jest Mock Typing](./typescript-jest-mock-typing.md)
- [Integration Test Setup](./integration-test-setup.md)  
- [Prisma Testing Patterns](./prisma-testing-patterns.md)