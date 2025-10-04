# Pattern: Package Version Testing Cleanup

**Complexity**: Simple
**Files Affected**: 0 (cleanup only)
**Prerequisites**: pnpm package manager
**Use Cases**: After testing multiple package versions during debugging or upgrades

## Implementation Steps

### 1. Identify Testing Artifacts

Check for accumulated package versions and cache:

```bash
# Check node_modules cache
ls -la node_modules/.cache

# Check pnpm store status
pnpm store status

# Check Next.js build cache size
du -sh .next/cache 2>/dev/null
```

### 2. Execute Cleanup Sequence

Run cleanup in this specific order to ensure thorough removal:

```bash
# 1. Clean pnpm store (removes orphaned packages)
pnpm store prune

# 2. Clear Next.js build cache
rm -rf .next/cache

# 3. Clear node_modules cache (if exists)
rm -rf node_modules/.cache/*

# 4. Optional: Full rebuild to verify clean state
pnpm install --frozen-lockfile
npm run build:verify
```

### 3. Document Cleanup Results

Record what was cleaned for future reference:
- Number of packages removed from pnpm store
- Size of cache cleared
- Any build verification results

## Testing Strategy

After cleanup, verify the application still works:

```bash
# Verify dependencies are correct
pnpm list --depth 0

# Run quality gates
npm run lint
npm run type-check
npm run test:critical

# Verify build still succeeds
npm run build:verify
```

## Common Pitfalls

1. **Don't clean during active development** - May remove needed cached data
2. **Avoid aggressive node_modules deletion** - Use pnpm prune instead
3. **Preserve .env files** - Never include in cleanup scripts
4. **Check git status first** - Ensure no uncommitted package.json changes

## When to Apply

- After package version testing/debugging
- After major dependency upgrades
- When switching between branches with different dependencies
- Before deployment to ensure clean build
- When disk space becomes a concern

## Automation Opportunities

Consider adding npm scripts for common cleanup tasks:

```json
{
  "scripts": {
    "clean:cache": "rm -rf .next/cache node_modules/.cache",
    "clean:store": "pnpm store prune",
    "clean:all": "npm run clean:cache && npm run clean:store",
    "rebuild": "npm run clean:all && pnpm install --frozen-lockfile && npm run build:verify"
  }
}
```

## Real-World Example

During Next.js 15.4.7 upgrade investigation (2025-10-04):
- Tested versions: 15.2.4, 15.3.0, 15.4.7
- Cleanup removed: 1191 packages, 56392 files
- Recovered disk space: ~500MB
- Build verification: Successful post-cleanup

## Related Patterns

- [Git Workflow Systematic Pattern](./git-workflow-systematic-pattern.md) - For branch switching scenarios
- [Quality Gate Comprehensive Pattern](./quality-gate-comprehensive-pattern.md) - Post-cleanup verification
- [Local Development Setup Pattern](./local-development-setup-pattern.md) - Initial environment setup

## Tags

`cleanup` `package-management` `pnpm` `cache` `maintenance` `devops`