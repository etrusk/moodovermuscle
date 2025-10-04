# MoodOverMuscle General Workspace Rules

**MANDATORY UNIVERSAL RULES**: These instructions apply to ALL custom roles and override any conflicting role-specific guidelines. All specialized roles must build upon these foundations while maintaining their specific responsibilities.

## Project Context

**MoodOverMuscle** is a Next.js 14 booking platform built with TypeScript, Prisma ORM, and focused on personal training/wellness services. The system handles session booking, calendar management, and administrative workflows with emphasis on real-time availability and conflict prevention.

**Technology Stack**:

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Testing**: Jest, Playwright, accessibility testing
- **Quality**: ESLint, Prettier, Husky pre-commit hooks

## Role Configuration

**DISALLOWED ROLES** (default Roo modes not permitted):

- `code` - Use `implementation-specialist` for development work
- `debug` - Use `investigation-specialist` for troubleshooting
- `ask` - Use `navigator` for strategic questions and coordination
- `architect` - Use `navigator` for architectural planning
- `orchestrator` - Use `navigator` for multi-phase coordination

**ALLOWED ROLES** (specialized MoodOverMuscle modes):

- `implementation-specialist` - Appetite-constrained development execution
- `investigation-specialist` - Systematic issue diagnosis and resolution
- `quality-specialist` - Comprehensive testing and production readiness
- `deployment-specialist` - Production deployment and client approval workflows
- `navigator` - Strategic project coordination and business context integration

## Mandatory Quality Gates

**CRITICAL GATES** (must pass before any commit):

```bash
npm run lint              # ESLint + Prettier (auto-fix)
npm run type-check        # TypeScript compilation
npm run test:critical     # Essential tests (< 30 seconds)
npm run security:scan     # Security vulnerability check
npm run build:verify      # Build verification
```

### Quality Gate Failure Protocol

- **Linting failures**: Auto-fix where possible, manual fix required issues
- **Type checking failures**: Resolve TypeScript errors, no bypassing
- **Test failures**: Fix failing tests or update if implementation changed correctly
- **Security issues**: Must resolve before commit, escalate if appetite impact
- **Build failures**: Resolve compilation/build issues within scope

## Institutional Memory Compliance

### Pattern Discovery Protocol

- **MANDATORY**: Always check [`.docs/patterns/index.md`](.docs/patterns/index.md) before implementation
- Search by feature type: auth, forms, uploads, integrations, TypeScript, testing
- Apply existing patterns rather than creating new approaches
- Document new reusable patterns when developed

### Knowledge Integration

- Check [`.docs/investigations/index.md`](.docs/investigations/index.md) for component-related issues
- Reference [`.docs/decisions/index.md`](.docs/decisions/index.md) for architectural context
- Apply lessons from [`.docs/memory/index.md`](.docs/memory/index.md) for complexity insights
- Preserve institutional knowledge through pattern documentation

## Appetite-Constrained Development

### Scope Boundary Respect

- **Execute within defined appetite boundaries absolutely**
- Respect circuit breakers and scope limitations
- Stop at scope boundaries and escalate rather than expand
- Update [`.docs/current-task.md`](.docs/current-task.md) with progress tracking

### 70/30 Decision Routing

**Implement Autonomously (70%)**:

- Code structure using established patterns
- CRUD operations and database interactions
- UI component implementation
- Testing and documentation
- Error handling patterns
- Performance optimizations within scope

**Escalate to Human (30%)**:

- Business rule definitions
- Security policy decisions
- User experience flows
- Data validation rules (business logic)
- Integration strategies
- Authentication/authorization logic

### Escalation Triggers

- Approaching appetite boundaries (scope expansion needed)
- Stuck in implementation loops
- Business logic or security decisions required
- Requirements ambiguity affecting scope

## Knowledge Capture Requirements

### Pattern Documentation

When developing new reusable approaches:

- Update [`.docs/patterns/index.md`](.docs/patterns/index.md) with new patterns
- Categorize by feature type and complexity level
- Include prerequisites and usage guidelines
- Cross-reference with related patterns and decisions

### Investigation Insights

- Document debugging insights for [`.docs/investigations/index.md`](.docs/investigations/index.md) updates
- Track complexity lessons for [`.docs/memory/index.md`](.docs/memory/index.md)
- Preserve successful approaches for institutional memory

### Technical Debt Resolution

- **IMMEDIATE MEMORY MIGRATION**: All resolved technical debt items MUST be moved to [`.docs/memory/technical-debt-resolution-achievements.md`](.docs/memory/technical-debt-resolution-achievements.md) immediately upon completion
- **LEAN DOCUMENTATION**: Active debt register [`.docs/debt.md`](.docs/debt.md) contains only unresolved items to maintain focus
- **INSTITUTIONAL MEMORY**: Preserve all resolution strategies and success metrics for pattern recognition and future reference

## Handback Protocol

### Universal Completion Requirement

ALL roles must end every task completion with:

**"Hand back to Navigator for next phase coordination"**

### Automatic Handback Execution

**MANDATORY**: When any specialist role completes their final todo item "Hand back to Navigator for next phase coordination":

1. Mark the handback task as complete [x]
2. Use `attempt_completion` to present results
3. **IMMEDIATELY execute `switch_mode` to Navigator mode** - this is automatic and required
4. No manual intervention needed - the transition happens automatically

### Handoff Requirements

- Check [`.docs/handoffs/index.md`](.docs/handoffs/index.md) for appropriate templates
- Use structured handoff templates for mode transitions
- Include context, constraints, and success criteria
- Document pattern applications and discoveries
- **Automatic mode switch to Navigator upon handback completion**

## Git Standards

### Conventional Commits

```bash
feat(auth): add JWT middleware using established auth pattern
fix(booking): resolve calendar conflict detection using validation pattern
docs(api): update booking endpoint documentation
test(calendar): add integration tests for availability
refactor(user): improve registration using validation pattern
```

### Commit Message Format

- **Type**: feat, fix, docs, style, refactor, test, chore
- **Scope**: Component or feature area affected
- **Subject**: Brief description in present tense
- **Body** (optional): Detailed explanation if needed
- **Footer** (optional): Breaking changes or issue references

## Progress Documentation

Update [`.docs/current-task.md`](.docs/current-task.md) with:

- Completed roadmap items marked with [x]
- Appetite boundary encounters
- 70/30 decision routing
- Pattern applications
- Quality gate status

## Security Requirements

### Core Security Principles

- **Validate ALL user inputs** at API boundaries
- Use established JWT patterns for authentication
- **NEVER commit secrets or API keys**
- Implement proper session management
- Follow principle of least privilege

### Input Validation

- Use Zod or similar for runtime type validation
- Sanitize data before database operations
- Implement rate limiting on public endpoints
- Hash passwords using bcrypt or similar

## MoodOverMuscle Specific Context

### Booking System Requirements

- **Real-time availability**: Prevent double bookings
- **Conflict detection**: Validate time slot availability
- **Session management**: Handle booking lifecycle states
- **Calendar integration**: Synchronize availability data

### Administrative Features

- **Authentication**: Secure admin login and session management
- **Dashboard**: Real-time booking statistics and management
- **Booking management**: CRUD operations for sessions
- **Calendar view**: Visual representation of bookings

### Data Requirements

- **Prisma models**: User, Booking, Session, Availability
- **Validation**: Zod schemas for input validation
- **Relationships**: Proper foreign key constraints
- **Indexes**: Optimized for query performance

## Anti-Patterns to Avoid

### Development Anti-Patterns

❌ **Scope creep**: Implementing beyond appetite boundaries  
❌ **Pattern amnesia**: Not checking existing patterns before implementation  
❌ **Quality gate bypass**: Skipping pre-commit verification  
❌ **Decision overreach**: Making business logic decisions that should escalate  
❌ **Investigation blindness**: Not checking [`.docs/investigations/index.md`](.docs/investigations/index.md)  
❌ **Handback omission**: Failing to end with Navigator handback protocol

### Technical Anti-Patterns

❌ **Performance negligence**: Ignoring Core Web Vitals standards  
❌ **Security shortcuts**: Bypassing input validation or authentication  
❌ **Database inefficiency**: N+1 queries or missing indexes  
❌ **Error swallowing**: Catching errors without proper handling

## Success Metrics

### Implementation Effectiveness

- **95%+ appetite compliance**: Staying within scope boundaries
- **100% critical quality gate passage**: No bypassing mandatory checks
- **80%+ pattern reuse**: Applying existing institutional knowledge
- **90%+ 70/30 routing accuracy**: Proper decision escalation
- **100% handback compliance**: All tasks end with Navigator coordination

### Quality Maintenance

- **Zero critical quality gate bypasses**: Maintaining code standards
- **100% TypeScript compliance**: No `any` types in production code
- **95%+ test coverage**: For critical business logic
- **WCAG 2.1 AA compliance**: Accessibility standards met

### Knowledge Building

- **Pattern documentation**: New patterns captured when developed
- **Investigation effectiveness**: Issues prevented through pattern application
- **Complexity calibration**: Appetite estimates improving over time
- **Institutional memory growth**: Contributing to shared knowledge base

## Implementation Protocol

1. **Pattern Discovery**: Check [`.docs/patterns/index.md`](.docs/patterns/index.md) for existing approaches
2. **Context Loading**: Apply specific patterns and constraints from handoff
3. **Quality-First Implementation**: Write code that passes all critical gates
4. **Progress Tracking**: Update [`.docs/current-task.md`](.docs/current-task.md) throughout
5. **Knowledge Capture**: Document new patterns for institutional memory
6. **Appetite Compliance**: Stay within scope, escalate at boundaries
7. **Navigator Handback**: End with "Hand back to Navigator for next phase coordination"

**REMEMBER**: These are MANDATORY universal rules. All specialized roles must comply with these standards while executing their specific responsibilities. When in doubt, prioritize quality, security, and institutional memory over speed of delivery.
