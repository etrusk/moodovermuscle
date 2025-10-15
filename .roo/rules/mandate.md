# Development Protocol

## MANDATORY: Read Context First

Before implementing ANY task:
1. Read `README.md` for business context and project overview
2. Read `.docs/architecture.md` for tech stack and constraints
3. Check `.docs/patterns/index.md` for existing patterns
4. For bugs: check `.docs/investigations/index.md`

Apply existing solutions. Document new patterns only if reusable.

## Keep Documentation Current

If your task changes relevant information, update as part of your work:
- `README.md` - Business context, deployment, general project info
- `.docs/architecture.md` - Tech stack, dependencies, architectural decisions

This keeps documentation accurate for future tasks.

## File Creation Policy

Prefer editing existing files over creating new ones. Only create new files when absolutely necessary for functionality.

NEVER proactively create documentation files (*.md, README) unless explicitly requested by user.

## Git Commit Protocol

**MANDATORY for all modes that modify project files:**

After completing work and verifying quality requirements:

1. **Stage changes:** `git add -A`
2. **Commit with conventional format:** `git commit -m "<type>: <description>"`
3. **Push to remote:** `git push`
4. **Complete task:** Use `attempt_completion` with result summary

**Commit type guidelines:**
- `feat:` - New features or capabilities
- `fix:` - Bug fixes or error corrections
- `test:` - Test additions or modifications
- `docs:` - Documentation updates
- `refactor:` - Code restructuring without behavior changes
- `chore:` - Maintenance and tooling

**Commit message format:**
```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Examples:**
```bash
git commit -m "feat: add email notifications on booking"
git commit -m "fix: resolve JWT token refresh race condition"
git commit -m "test: add calendar conflict detection coverage"
```

**Enforcement:** Pre-commit hooks verify quality gates before allowing commits. If commit fails, fix issues, re-stage with `git add -A`, and retry.

**Applies to:** Any mode that modifies files (test, implementation, investigation, develop)  
**Exception:** Navigator mode (read-only, no file modifications)