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