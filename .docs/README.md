# MoodOverMuscle Documentation

## Quick Start

- **[Current Project Status](./current-task.md)** - Active development tasks
- **[Project Specification](./spec.md)** - Business requirements and scope
- **[System Architecture](./architecture.md)** - Technical architecture and constraints
- **[Development Workflows](./workflow.md)** - Development processes and quality gates

## Documentation Structure

### Core Documents

- **[spec.md](./spec.md)** - Business requirements for solo trainer (Emily) with 50-100 bookings/month
- **[architecture.md](./architecture.md)** - Tech stack (Next.js 14, Prisma, PostgreSQL), security, patterns
- **[workflow.md](./workflow.md)** - Pre-commit enforcement, preview-first deployment, Git standards
- **[current-task.md](./current-task.md)** - Active work tracking

### Pattern Library

- **[patterns/index.md](./patterns/index.md)** - Reusable code patterns (auth, forms, database, testing)

### Decisions & Lessons

- **[decisions/index.md](./decisions/index.md)** - Architectural decision records
- **[lessons-learned/index.md](./lessons-learned/index.md)** - Process improvements from TDD sessions

### Known Issues

- **[investigations/index.md](./investigations/index.md)** - Common issues and solutions (DST bugs, Prisma patterns, etc.)

## Navigation Guide

### Starting Development

1. Review **[current-task.md](./current-task.md)** for context
2. Check **[patterns/index.md](./patterns/index.md)** for similar implementations
3. Reference **[architecture.md](./architecture.md)** for system constraints
4. Follow **[workflow.md](./workflow.md)** for quality gates

### Debugging Issues

1. Check **[investigations/index.md](./investigations/index.md)** for known issues
2. Reference pattern files for implementation details
3. Update investigations if new solution discovered

### Architecture Decisions

1. Review **[spec.md](./spec.md)** for business context
2. Check **[architecture.md](./architecture.md)** for existing patterns
3. Consider scale (50-100 bookings/month, solo trainer)

## Quality Standards

### Pre-Commit Gates (Automatic)

All commits must pass:
- ESLint + Prettier (auto-fix)
- TypeScript compilation
- Critical tests
- Security scan
- Build verification

See **[workflow.md](./workflow.md)** for details.

### Branching & Deployment

- `main` → production (`moodovermuscle.com.au`), PRs only with CI green
- `preview` → staging (`preview.moodovermuscle.com.au`), direct commits, one feature at a time

Functionality changes: commit to `preview` → client approves preview URL → PR `preview → main` → merge.

See **[workflow.md](./workflow.md)** for the full flow including edge cases.

## Key Principles

- **Scale-Appropriate**: Solutions sized for 50-100 bookings/month
- **Pattern-First**: Check patterns before implementing
- **Quality-Enforced**: Pre-commit hooks prevent bad code
- **Simple Solutions**: Booking form, not distributed system

---

**Last Updated**: 2026-02-25
**Documentation Status**: Lean and focused - core docs + TDD workflow
**Workflow**: Claude CLI with `/tdd` command (see workflow.md)
