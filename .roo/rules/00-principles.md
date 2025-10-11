# MoodOverMuscle Core Principles

**MANDATORY UNIVERSAL RULES**: Apply to all modes without exception.

## Project Context

Next.js 14 booking platform for personal training/wellness services. TypeScript, Prisma ORM, PostgreSQL.

## SOLID Principles

**Single Responsibility Principle (SRP):**
- Each function/module has one clear purpose
- Enforced by complexity limits (≤50 lines per function)
- One reason to change = focused functionality

**Open/Closed Principle (OCP):**
- Extend behavior through composition, not modification
- Use TypeScript interfaces for extensibility
- Preserve existing functionality when adding features

**Liskov Substitution Principle (LSP):**
- Subtypes must be substitutable for base types
- Maintain contracts in TypeScript interfaces
- Type safety through strict TypeScript configuration

**Interface Segregation Principle (ISP):**
- Small, focused interfaces over large ones
- Clients shouldn't depend on unused methods
- Apply YAGNI: create interfaces only when 2+ implementations exist

**Dependency Inversion Principle (DIP):**
- Depend on abstractions, not concrete implementations
- Use dependency injection patterns
- Decouple high-level logic from low-level details

## DRY (Don't Repeat Yourself)

**Enforced by pre-commit:**
- Code duplication ≤ 3% (automatic blocking)
- Extract to shared utility on 2nd occurrence
- Use patterns from `.docs/patterns/index.md`

**When to extract:**
- Same logic appears twice → extract to utility
- Similar patterns in 2+ places → create reusable pattern
- Configuration repeated → centralize in config file

**Where to extract:**
- `/lib/` - Business logic and utilities
- `/components/` - React components (2+ uses)
- `/lib/utils/` - Helper functions
- `/types/` - Shared TypeScript types

## YAGNI (You Aren't Gonna Need It)

**Don't create until actually needed:**
- ❌ Interfaces with single implementation
- ❌ Factories for single type
- ❌ Abstractions used once
- ❌ Generic utilities for specific use

**Wait for second use:**
- ✅ Extract to shared utility on 2nd occurrence
- ✅ Create interface when 2+ implementations exist
- ✅ Build abstraction when pattern repeats

**Before creating abstraction:**
1. Search codebase for similar code
2. Check `.docs/patterns/index.md` for existing patterns
3. If found once, wait for 2nd use
4. If found twice, extract to shared location

## Complexity Limits (Pre-Commit Enforced)

**Function Complexity:**
- ≤ 50 lines per function (AST-based detection)
- ≤ 3 parameters per function
- Break complex functions into smaller units

**File Complexity:**
- ≤ 300 lines per file
- Split large files by responsibility
- Use barrel exports for related modules

**Code Duplication:**
- ≤ 3% duplication (jscpd threshold)
- Extract duplicate code to utilities
- Apply DRY principle consistently

## Institutional Memory Integration

**MANDATORY BEFORE IMPLEMENTATION:**
- Check `.docs/patterns/index.md` for similar implementations
- Review `.docs/investigations/index.md` for component-related issues
- Apply existing patterns rather than creating new approaches
- Reference proven solutions from past work

**Pattern-First Development:**
1. Search patterns index for similar functionality
2. Apply existing pattern if found
3. Implement with minimal modifications
4. Document new patterns only if genuinely reusable

## Security Requirements

**MANDATORY:**
- Validate ALL user inputs at API boundaries (use Zod)
- Use established JWT patterns for authentication
- NEVER commit secrets or API keys
- Hash passwords with bcrypt
- Implement rate limiting on public endpoints
- Follow principle of least privilege

**Input Validation:**
```typescript
// ✅ GOOD: Zod schema validation
import { z } from 'zod';

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  datetime: z.string().datetime(),
  clientEmail: z.string().email()
});

// Validate at API boundary
const validatedData = bookingSchema.parse(requestBody);
```

## Type Safety (TypeScript)

**ZERO `any` types allowed:**
- Use proper typing or `unknown` with type guards
- Strict TypeScript configuration (`strict: true`)
- Explicit return types for public APIs

**Interface Design:**
- Specific interfaces over large catch-all objects
- Use utility types (`Partial<T>`, `Pick<T>`, `Omit<T>`)
- Interface segregation: focused, single-purpose interfaces

## Testing Standards

**Test Pyramid:**
- Unit tests: Component-level functionality (fast, many)
- Integration tests: API and component interactions (medium speed, fewer)
- E2E tests: Critical user journeys (slow, few)

**TDD Approach (Preferred):**
1. Write tests first (use test mode)
2. Implement simplest code to pass tests (use implementation mode)
3. Refactor with tests as safety net

**AAA Pattern:**
```typescript
it('should create booking with valid data', async () => {
  // Arrange
  const mockData = { /* test data */ };
  
  // Act
  const result = await createBooking(mockData);
  
  // Assert
  expect(result).toMatchObject({ status: 'confirmed' });
});
```

## Git Standards

**Conventional Commits:**
```bash
feat(auth): add JWT refresh token rotation
fix(booking): resolve calendar conflict detection
docs(api): update booking endpoint documentation
test(calendar): add availability integration tests
refactor(user): extract validation to shared utility
```

**Commit Message Structure:**
- Type: feat, fix, docs, test, refactor, style, chore
- Scope: Component or feature area
- Subject: Present tense, imperative mood
- Body (optional): Detailed explanation
- Footer (optional): Breaking changes, issue references

**Branch Naming:**
- `feature/profile-editing`
- `hotfix/security-patch`
- `investigation/performance-analysis`

## Documentation Creation Policy

**CRITICAL**: **NEVER create new documentation files unless explicitly requested by the user.**

**Updates ONLY:**
- Update existing `.docs/` files when adding new patterns, investigations, or memory
- Update existing rule files when clarifying practices
- Update `README.md` when core functionality changes

**NEVER Create:**
- New analysis documents
- New strategy documents
- New planning documents
- New reference documents
- New guides or tutorials

**If You Think Documentation is Needed:**
1. Ask user explicitly: "Should I create a new documentation file for [topic]?"
2. Wait for confirmation
3. Only proceed after explicit approval

**Rationale**: Prevents documentation bloat and maintains lean, focused documentation structure.

## Success Metrics

- 100% pre-commit compliance (automatic)
- 90%+ pattern reuse from institutional memory
- Zero manual quality verification (automated)
- <3% code duplication (enforced)
- All functions <50 lines (enforced)
- All files <300 lines (enforced)
- Zero `any` types in TypeScript
- 70%+ test coverage

These principles are non-negotiable and enforced through pre-commit hooks. Write code that respects these limits, and automation handles the rest.