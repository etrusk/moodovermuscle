# Documentation Usage Tracking

## Purpose

This file tracks which `.docs` files are actively referenced by roles to identify potential staleness and ensure comprehensive coverage.

## Usage Pattern

When any role references a `.docs` file, they should add a pulse entry:

```
<!-- PULSE: [YYYY-MM-DD] [role] - [brief context why referenced] -->
```

## Staleness Detection

**Monthly Review Process**:

1. Search for `<!-- PULSE:` across all `.docs` files
2. Identify files with no pulses in last 30 days
3. Review stale files for relevance and accuracy
4. Archive or update as needed

**Automated Detection Script**:

```bash
# Find docs without recent pulses (example for August 2025)
find .docs -name "*.md" -exec grep -L "PULSE: 2025-08" {} \;

# Count pulses per file
find .docs -name "*.md" -exec sh -c 'echo "$1: $(grep -c "PULSE:" "$1")"' _ {} \;
```

## Role Responsibilities

### Comprehensive Discovery Roles

**Orchestrator** and **Architect** and **Ask**:

- MUST check ALL relevant `.docs` files before any work
- MUST add pulse tracking when referencing files
- Responsible for identifying stale documentation

### Specialized Roles

**Code** and **Debug**:

- Rely on curated context from Orchestrator/Architect
- Do NOT perform broad `.docs` discovery
- Report context gaps to Orchestrator for investigation

## Documentation Health Metrics

### Active Documentation (Target: 90%+ files with recent pulses)

- Files referenced in last 30 days
- Cross-referenced between multiple roles
- Updated based on usage patterns

### Stale Documentation (Target: <10% of files)

- No pulses in last 30 days
- Candidates for review, update, or archival
- May indicate missing cross-references

### Usage Patterns

- Which files are most frequently referenced
- Which roles reference which documentation types
- Gaps in cross-referencing between related docs

## Implementation Status

- [x] Pulse tracking added to Orchestrator role instructions
- [x] Pulse tracking added to Architect role instructions
- [x] Pulse tracking added to Ask role instructions
- [x] Specialized roles updated to rely on curated context
- [ ] Monthly review process established
- [ ] Automated detection script implemented
- [ ] First staleness review completed

## Example Pulse Entries

```markdown
<!-- PULSE: 2025-08-04 orchestrator - checked for booking system appetite constraints -->
<!-- PULSE: 2025-08-04 architect - referenced for transaction safety design patterns -->
<!-- PULSE: 2025-08-04 ask - analyzed for user question about workflow processes -->
```

---

**Last Updated**: 2025-08-04  
**Next Review**: 2025-09-04  
**Status**: Initial implementation complete, monitoring phase beginning
