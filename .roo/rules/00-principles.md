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
4. Only extract on confirmed 2nd occurrence

## Constitutional Principles (Priority Order)

**When principles conflict, follow this priority:**

1. **SECURITY**: Never generate code with known vulnerabilities
2. **CORRECTNESS**: Bug-free code over feature completeness  
3. **MAINTAINABILITY**: Readable code over clever optimizations
4. **TESTING**: Consider test cases for all code
5. **PERFORMANCE**: Optimize only when profiling shows need

**Examples of conflict resolution:**
- Security vs Speed → Choose security (SQL parameterization over string concatenation)
- Correctness vs Elegance → Choose correctness (explicit checks over assumed behavior)
- Maintainability vs Performance → Choose maintainability (clear code over micro-optimizations)
- Testing vs Speed → Choose testing (write tests even if it slows initial development)
- YAGNI vs Future-Proofing → Choose YAGNI (implement for today's needs, not tomorrow's guesses)

**When to escalate to human:**
- Principles 1-2 conflict (Security vs Correctness) → Always ask
- Unclear which principle applies → Always ask
- Business requirement conflicts with any principle → Always ask

## Complexity Limits (Pre-Commit Enforced)

**Hard Limits:**
- Functions ≤ 50 lines (AST-based)
- Files ≤ 300 lines
- Function parameters ≤ 3
- Code duplication ≤ 3%

**When approaching limits:**
- Functions 40-50 lines → Consider extracting
- Files 250-300 lines → Consider splitting
- Parameters = 3 → Consider options object for next addition

## Documentation Standards

**Code Comments:**
- Explain WHY, not WHAT (code shows what)
- Complex algorithms need explanation
- Non-obvious business logic needs context
- Public APIs need JSDoc

**Don't Document:**
- Obvious code (`// increment counter`)
- Self-explanatory variable names
- Standard patterns from patterns index

## Error Handling

**Always handle errors explicitly:**
- No silent failures
- No generic `catch (error) {}` without logging
- Return typed errors, not throwing strings
- User-facing errors should be helpful

**Error Categories:**
- Validation errors → 400 with specific field messages
- Auth errors → 401/403 with clear action
- Not found → 404 with helpful suggestions
- Server errors → 500 with incident ID (never expose internals)

## Performance Guidelines

**Don't optimize prematurely:**
- Profile before optimizing
- Measure, don't guess
- Clear code first, fast code second
- Optimize only proven bottlenecks

**Do optimize:**
- Database queries (N+1 prevention)
- Large data transformations
- Critical user paths (booking flow)
- Bundle size (lazy loading)

## Testing Philosophy

**Test behavior, not implementation:**
- Test what users see/experience
- Test API contracts
- Don't test internal details
- Tests should survive refactoring

**Coverage targets:**
- Critical paths: 100% (booking, payment)
- Business logic: 90%+
- UI components: 70%+
- Utilities: 80%+

## Security Requirements

**Never compromise on:**
- Input validation (all user data)
- SQL injection prevention (use Prisma, never raw queries)
- XSS prevention (sanitize outputs)
- CSRF protection (use Next.js defaults)
- Rate limiting (public endpoints)
- Secure password handling (bcrypt, never plaintext)

**Audit trigger points:**
- Authentication changes
- Authorization logic
- Payment processing
- User data access
- API endpoint creation

## Success Metrics

- Pre-commit pass rate >95%
- Test coverage >70%
- Zero