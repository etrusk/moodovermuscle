# Pattern: Time Format Validation Debugging

**Complexity**: Simple
**Files Affected**: 2-4 test files typically
**Prerequisites**: Jest test suite, time-based test data
**Use Cases**: When test failures occur due to time format mismatches between test data and validation logic

## Problem Statement

Test suites fail due to time format inconsistencies where test data uses one format (e.g., 12-hour with AM/PM) but validation or application logic expects another format (e.g., 24-hour format). This creates systematic test failures that appear unrelated to actual functionality.

## Implementation Steps

### 1. Systematic Format Identification

```typescript
// Step 1: Identify the format mismatch
// Check test data format
const testTimeData = '2:00 PM' // 12-hour format with AM/PM

// Check validation/application format expectation
const expectedFormat = '14:00' // 24-hour format expected
```

### 2. Standardization Strategy

Choose one consistent format across the entire test suite:

**Option A: Standardize to 24-hour format**

```typescript
// Convert all test data to 24-hour format
const standardizedTestData = {
  time: '14:00', // Instead of "2:00 PM"
  time2: '09:30', // Instead of "9:30 AM"
  time3: '22:15', // Instead of "10:15 PM"
}
```

**Option B: Standardize to 12-hour format**

```typescript
// Convert all validation to accept 12-hour format
const standardizedTestData = {
  time: '2:00 PM',
  time2: '9:30 AM',
  time3: '10:15 PM',
}
```

### 3. Systematic Application

```typescript
// Apply format standardization across all test files
// __tests__/setup/test-db-data.ts
export const testBookings = [
  {
    date: '2025-08-06',
    time: '14:00', // Standardized 24-hour format
    // ... other fields
  },
  // ... more test data with consistent format
]

// __tests__/api/booking-creation.test.ts
const bookingRequest = {
  date: '2025-08-06',
  time: '14:00', // Matching format
  // ... other fields
}
```

### 4. Validation Alignment

Ensure validation logic matches the chosen format:

```typescript
// If using 24-hour format, validation should expect it
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // 24-hour format

// If using 12-hour format, validation should expect it
const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i // 12-hour format
```

## Testing Strategy

### Before Fix Verification

```bash
# Run tests to confirm format mismatch failures
npm test
# Expected: Multiple test failures due to time format issues
```

### After Fix Verification

```bash
# Run tests to confirm 100% resolution
npm test
# Expected: All tests passing with standardized format
```

### Format Consistency Check

```typescript
// Add a helper to verify format consistency
const validateTimeFormat = (time: string): boolean => {
  const format24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return format24Hour.test(time)
}

// Use in tests to ensure consistency
expect(validateTimeFormat(testData.time)).toBe(true)
```

## Common Pitfalls

### Mixed Format Usage

```typescript
// ❌ AVOID: Mixing formats within same test suite
const testData1 = { time: '2:00 PM' } // 12-hour
const testData2 = { time: '14:00' } // 24-hour - inconsistent!
```

### Incomplete Standardization

```typescript
// ❌ AVOID: Fixing some files but not others
// Fixed: __tests__/api/booking-creation.test.ts uses "14:00"
// Missed: __tests__/setup/test-db-data.ts still uses "2:00 PM"
```

### Validation Misalignment

```typescript
// ❌ AVOID: Test data format doesn't match validation
const testTime = '14:00' // 24-hour format
const validation = /AM|PM/ // Expects 12-hour format - mismatch!
```

## Success Metrics

- **Resolution Rate**: 100% test failures resolved
- **Format Consistency**: All time data uses identical format
- **Validation Alignment**: Application logic matches test format
- **Systematic Application**: Format applied across all test files consistently

## Historical Success Example

**MoodOverMuscle Project (2025-08-06)**:

- **Before**: 4 failed test suites due to time format mismatch
- **After**: 41 passed test suites (100% resolution)
- **Method**: Systematic 24-hour format standardization across all test files
- **Files Modified**: `__tests__/setup/test-db-data.ts`, `__tests__/api/booking-creation.test.ts`, `__tests__/integration/booking-api.integration.test.ts`, `__tests__/integration/error-scenarios.integration.test.ts`

## Related Patterns

- [Test Data Management Pattern](./test-data-management-pattern.md) - Consistent test data structure
- [API Contract Validation Pattern](./api-contract-validation-pattern.md) - Ensuring API expects consistent format
- [Schema Validation Pattern](./ts-schema-validation-pattern.md) - Runtime type checking for time formats

## Prevention Strategy

1. **Single Source of Truth**: Define time format standard in one location
2. **Validation Helpers**: Create reusable time format validation functions
3. **Test Data Factory**: Generate all test time data from single format source
4. **Format Documentation**: Document chosen format in project README
5. **Linting Rules**: Add custom ESLint rules to catch format inconsistencies

## Quick Resolution Checklist

- [ ] Identify all time-related test data across test suite
- [ ] Choose single format standard (24-hour recommended for consistency)
- [ ] Update all test data files to use chosen format
- [ ] Verify validation logic expects the chosen format
- [ ] Run full test suite to confirm 100% resolution
- [ ] Document format choice for future development
