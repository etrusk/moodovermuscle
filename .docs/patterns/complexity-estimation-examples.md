# Complexity Estimation Examples - All Metrics

Use these examples as templates when planning code generation. Each example includes ALL complexity metrics.

---

## Example 1: Simple Feature (Single File)

**Task:** Add email notification when booking is confirmed

### Complete Estimation:

```
FUNCTION COMPLEXITY:
- sendBookingConfirmationEmail(booking: Booking) - ~20 lines, 1 param ✓
- formatEmailBody(booking: Booking, service: Service) - ~15 lines, 2 params ✓
- logEmailSent(bookingId: string) - ~10 lines, 1 param ✓

Total functions: 3
All ≤3 parameters: ✓
All ≤40 lines: ✓

FILE SIZE:
- Code: 45 lines
- Overhead: 15 lines
- Total: 60 lines

Limits: 60 < 250 (target) < 300 (limit) ✓

PARAMETER COMPLEXITY:
- All functions ≤3 params ✓
- No options objects needed ✓

DUPLICATION:
- No repeated patterns (single use)
- Duplication: 0% ✓

COMPLIANCE:
✓ Functions ≤40 lines
✓ File <250 lines  
✓ Params ≤3
✓ Duplication <3%
```

**Decision:** Single file (`lib/email/booking-confirmation.ts`) - ALL metrics compliant ✓

---

## Example 2: Medium Feature (Requires Options Object)

**Task:** Create booking with validation, availability check, notifications

### Initial Analysis:

```
FUNCTION COMPLEXITY:

❌ WRONG APPROACH:
createBooking(
  serviceId: string,
  datetime: Date,
  clientName: string,
  clientEmail: string,
  phone: string,
  notes?: string
) // 6 parameters - VIOLATES ≤3 rule

✓ CORRECT APPROACH:
interface CreateBookingRequest {
  serviceId: string;
  datetime: Date;
  clientName: string;
  clientEmail: string;
  phone: string;
  notes?: string;
}

createBooking(request: CreateBookingRequest) // 1 parameter ✓

Functions with estimates:
- validateBookingRequest(request: CreateBookingRequest) - ~25 lines, 1 param ✓
- checkServiceAvailability(serviceId, datetime) - ~30 lines, 2 params ✓
- validateClientData(request: CreateBookingRequest) - ~20 lines, 1 param ✓
- createBookingRecord(request: CreateBookingRequest) - ~35 lines, 1 param ✓
- sendNotifications(booking: Booking) - ~25 lines, 1 param ✓
- logBookingActivity(bookingId, action) - ~10 lines, 2 params ✓

Total functions: 6
All ≤3 parameters: ✓
All ≤40 lines: ✓

FILE SIZE:
- Code: 145 lines
- Overhead: 30 lines
- Total: 175 lines

Limits: 175 < 250 (target) < 300 (limit) ✓

DUPLICATION:
- Email validation pattern: Used in 2 places → Extract to utils/validators.ts
- Date formatting: Used in 2 places → Extract to utils/date-helpers.ts
- After extraction: <3% ✓

COMPLIANCE:
✓ All functions ≤40 lines
✓ File 175 lines (75-line buffer)
✓ All functions ≤3 params (using options objects)
✓ Duplication <3% (utilities extracted)
```

**Decision:** Single file with utilities extracted

**Files created:**
- `lib/booking/booking-service.ts` (175 lines)
- `lib/utils/validators.ts` (40 lines) - shared validators
- `lib/utils/date-helpers.ts` (35 lines) - shared date functions

---

## Example 3: Test Suite (Requires Split + Parameter Refactoring)

**Task:** Full test coverage for AdminBookings component

### Complete Estimation:

```
TEST COMPLEXITY:

Test requirements:
- Display states: 6 tests × 15 lines = 90 lines
- Filter functionality: 12 tests × 20 lines = 240 lines
- Status updates: 8 tests × 25 lines = 200 lines
- Modal interactions: 6 tests × 20 lines = 120 lines
- Accessibility: 4 tests × 15 lines = 60 lines

Test code: 710 lines

HELPER FUNCTIONS:

❌ WRONG APPROACH:
createMockBooking(id, serviceId, datetime, status, clientName) // 5 params

✓ CORRECT APPROACH:
interface MockBookingOptions {
  id?: string;
  serviceId?: string;
  datetime?: Date;
  status?: BookingStatus;
  clientName?: string;
}

createMockBooking(options?: MockBookingOptions) // 1 param with defaults

Helper functions planned:
- createMockBooking(options?: MockBookingOptions) - ~15 lines, 1 param ✓
- createMockService(options?: MockServiceOptions) - ~10 lines, 1 param ✓
- setupBookingMocks(overrides?: object) - ~20 lines, 1 param ✓
- expectValidBookingId(booking: Booking) - ~5 lines, 1 param ✓

Overhead:
- Mock utilities: 50 lines
- beforeEach setup: 30 lines
- Imports: 15 lines
- Total overhead: 95 lines

TOTAL: 710 + 95 = 805 lines

FILE TYPE: Unit test (600-line limit)

SPLIT ANALYSIS:
Target per file: 550 lines (50-line buffer)
Minimum files: 805 ÷ 550 = 1.46 → 2 files minimum

Option A - 2 files:
  805 ÷ 2 = 402 lines each
  402 < 550 ✓ (148-line buffer)

DUPLICATION CHECK:
- Mock setup repeated in 20+ tests → Extract to setupBookingTest() utility
- Assertions repeated in 15+ tests → Extract to expectValidBooking() matcher
- After extraction: <3% ✓

COMPLIANCE PER FILE:
✓ All test functions ≤50 lines
✓ Each file ~400 lines (150-line buffer below 600 limit)
✓ All helpers ≤3 params (using options objects)
✓ Duplication <3% (utilities extracted)
```

**Proposed Split:**

```
__tests__/components/admin/bookings/
├── bookings-core.test.tsx (~395 lines)
│   ├── Display states (6 tests)
│   ├── Filter functionality (12 tests)
│   ├── Performance (2 tests)
│   └── Shared utilities (50 lines)
│
└── bookings-interactions.test.tsx (~410 lines)
    ├── Status updates (8 tests)
    ├── Modal interactions (6 tests)
    ├── Accessibility (4 tests)
    └── Shared utilities (50 lines)

Shared test utilities:
└── __tests__/utils/booking-test-helpers.ts (~85 lines)
    - createMockBooking(options)
    - createMockService(options)
    - setupBookingMocks(overrides)
    - expectValidBooking(booking)
```

**Verification:**
- File 1: 395 < 550 ✓ (155-line buffer)
- File 2: 410 < 550 ✓ (140-line buffer)
- Utilities: 85 < 300 ✓
- All helpers ≤3 params ✓
- Duplication <3% ✓

---

## Example 4: Refactoring Oversized File

**Task:** Split existing `bookings.test.tsx` (889 lines)

### Analysis of Original File:

```
Current state:
- File size: 889 lines
- Violations: Exceeds 600-line test limit by 289 lines
- Functions with >3 params: 3 helper functions need refactoring
- Duplication: ~8% (mock setup repeated 15+ times)

REFACTORING PLAN:

1. EXTRACT DUPLICATION FIRST:
   Mock setup patterns → test-helpers.ts
   - Before: 8% duplication
   - After: <3% ✓
   - Saves ~70 lines

2. REFACTOR PARAMETER COUNTS:
   ❌ setupTest(booking, service, status, user) // 4 params
   ✓ setupTest(options: TestSetupOptions) // 1 param
   
   Affected helpers: 3 functions
   All converted to options objects ✓

3. FILE SIZE AFTER CLEANUP:
   Original: 889 lines
   - Duplication extracted: -70 lines
   - Helpers moved to utilities: -85 lines
   = Remaining: 734 lines
   
   Still exceeds 600-line limit by 134 lines
   Must split into 2+ files

4. SPLIT CALCULATION:
   Target: 550 lines (50-line buffer)
   Files needed: 734 ÷ 550 = 1.34 → 2 files minimum
   Per file: 734 ÷ 2 = 367 lines each
   
   367 < 550 ✓ (183-line buffer per file)

5. SPLIT STRATEGY BY FUNCTIONALITY:
```

**Proposed Split:**

```
__tests__/components/admin/bookings/
├── bookings-display.test.tsx (~360 lines)
│   - Loading states
│   - Error states
│   - Booking list display
│   - Filters and search
│
└── bookings-actions.test.tsx (~374 lines)
    - Status updates
    - Modal interactions
    - Cancellation flow
    - Accessibility

__tests__/utils/
└── booking-test-helpers.ts (~85 lines)
    - createMockBooking(options?: MockBookingOptions)
    - createMockService(options?: MockServiceOptions)
    - setupBookingTest(options?: SetupOptions)
    - expectValidBooking(booking: Booking)
```

**Final Verification:**
```
✓ File 1: 360 lines < 550 target < 600 limit (240-line buffer)
✓ File 2: 374 lines < 550 target < 600 limit (226-line buffer)
✓ Utilities: 85 lines < 300 limit
✓ All functions ≤50 lines
✓ All helpers ≤3 params (using options objects)
✓ Duplication <3% (extracted to utilities)
```

---

## Red Flags Checklist

### ❌ Don't Do This:

**Parameter Count Violations:**
```typescript
// WRONG: 5 parameters
function processBooking(id, name, email, phone, status) { }

// WRONG: 4 parameters in test helper
function setupTest(booking, service, status, user) { }
```

**File Size Violations:**
```
"Need to split 889-line file"
889 ÷ 3 = 296 lines per file
Close to limit, should work...
→ ❌ No buffer, will exceed with any additions
```

**Duplication Violations:**
```
Same mock setup copied in 15 tests
→ ❌ >3% duplication, should extract to utility
```

### ✓ Do This Instead:

**Use Options Objects:**
```typescript
// CORRECT: 1 parameter with options object
interface BookingOptions {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
}
function processBooking(options: BookingOptions) { }

// CORRECT: 1 parameter with defaults
interface TestSetupOptions {
  booking?: Booking;
  service?: Service;
  status?: BookingStatus;
  user?: User;
}
function setupTest(options: TestSetupOptions = {}) { }
```

**Plan with Buffer:**
```
Need to split 889-line file
Target: 550 lines (50-line buffer below 600 limit)
889 ÷ 550 = 1.62 → 2 files minimum
889 ÷ 2 = 445 lines each
445 < 550 ✓ (105-line buffer per file)
```

**Extract Duplication:**
```
Same mock setup in 15 tests
→ Extract to createMockBooking() utility
→ Extract to setupBookingTest() helper
→ Duplication drops from 8% to <3% ✓
```

---

## Quick Reference Table

| Metric | Target | Hard Limit | Action If Exceeded |
|--------|--------|------------|----------------------|
| Function lines | ≤40 | 50 | Split function into smaller functions |
| Function params | ≤3 | 3 | Use options object/interface |
| File lines (code) | <250 | 300 | Split into multiple files |
| File lines (tests) | <550 | 600 | Split test suite |
| File lines (integration) | <750 | 800 | Split integration tests |
| Code duplication | <3% | 3% | Extract to utility on 2nd occurrence |

---

## Complete Estimation Formula

```
FOR EACH FUNCTION:
  lines = [estimate]
  params = [count]
  
  VERIFY:
    lines ≤ 40? (target) / 50? (limit)
    params ≤ 3? (or using options object?)

TOTAL_FILE_SIZE:
  code_lines = sum(function_lines)
  overhead = imports + types + exports
  total = code_lines + overhead
  
  VERIFY:
    total < 250? (target) / 300? (limit) for code
    total < 550? (target) / 600? (limit) for tests
    total < 750? (target) / 800? (limit) for integration

DUPLICATION:
  patterns_count = [list repeated code]
  
  VERIFY:
    Extract to utilities on 2nd occurrence
    After extraction: <3%?

IF ANY VERIFICATION FAILS:
  1. Refactor functions (split, use options objects)
  2. Extract utilities (reduce duplication)
  3. Split files (increase file count)
  4. Re-estimate until ALL metrics pass