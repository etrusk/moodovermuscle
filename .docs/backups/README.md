# Backup Recovery Procedures

## Overview
This directory contains timestamped backups of critical project configurations and documentation following a 3-backup retention policy.

## Current Backups

### 1. Custom Roles Backup (20250808-070944)
**Contents**: Complete custom role implementation artifacts
- Configuration files: `.roomodes`, `.roomodes.json` 
- Documentation: Implementation plans, migration guides, comprehensive guides
- Handoff templates: Role-specific transition documentation
- Scripts: Quality gates, performance validation, workflow automation
- Rule definitions: All 6 custom role specifications

**Recovery Use**: Restore custom role system in case of configuration corruption

### 2. Roo Legacy Backup (20250808-084630) 
**Contents**: Original Roo framework documentation and role instructions
- Legacy role instructions for built-in modes
- Historical documentation from roo-backup directory
- Reference materials for understanding evolution of role system

**Recovery Use**: Reference legacy configuration or restore pre-custom role state

## 3-Backup Retention Policy

**Active Policy**: Maintain exactly 3 timestamped backups at all times
- **Latest**: Current custom role implementation
- **Previous**: Legacy/reference materials  
- **Emergency**: Space reserved for critical system state backups

**Rotation Process**:
1. When creating new backup, ensure total count stays ≤ 3
2. Remove oldest backup if creating 4th backup
3. Prioritize functional diversity (different backup types/purposes)
4. Always preserve at least one working configuration backup

## Recovery Procedures

### Full System Recovery
```bash
# 1. Identify target backup
cd .docs/backups/
ls -la  # Choose appropriate backup by timestamp and purpose

# 2. Stop any running processes
# (Review current system state first)

# 3. Backup current state (if recoverable)
mkdir -p .docs/backups/emergency-backup-$(date +%Y%m%d-%H%M%S)/
cp -r relevant-files .docs/backups/emergency-backup-*/

# 4. Restore from backup
cp -r .docs/backups/[target-backup]/.roomodes ./
cp -r .docs/backups/[target-backup]/scripts/* ./scripts/
# etc. (restore relevant files based on issue)

# 5. Validate restoration
npm run quality-gates  # Ensure system is functional
```

### Partial Recovery (Specific Components)

**Custom Role Configuration Recovery**:
```bash
# Restore role definitions
cp .docs/backups/custom-roles-backup-*/. roomodes ./

# Restore scripts
cp .docs/backups/custom-roles-backup-*/scripts/* ./scripts/

# Validate
pnpm run lint && pnpm run type-check
```

**Documentation Recovery**:
```bash
# Restore specific documentation
cp .docs/backups/[backup-name]/[specific-file] .docs/path/to/location/

# Validate cross-references
grep -r "relative-path" .docs/ # Check for broken links
```

### Investigation Recovery
```bash
# If institutional memory corrupted
cp .docs/backups/custom-roles-backup-*/[memory-files] .docs/memory/

# If handoff templates corrupted  
cp .docs/backups/custom-roles-backup-*/[handoff-files] .docs/handoffs/
```

## Recovery Validation

After any recovery operation:

1. **System Integrity Check**:
   ```bash
   npm run lint                 # Code standards
   npm run type-check          # TypeScript compilation  
   npm run test:critical       # Essential functionality
   npm run build:verify        # Build processes
   ```

2. **Cross-Reference Validation**:
   ```bash
   # Check institutional memory links
   grep -r "patterns/index.md" .docs/
   grep -r "investigations/index.md" .docs/
   grep -r "memory/index.md" .docs/
   ```

3. **Custom Role Functionality**:
   ```bash
   # Verify role configurations
   cat .roomodes  # Check role definitions
   # Test mode switching (requires user interaction)
   ```

## Backup Creation Guidelines

**When to Create Backups**:
- Before major system changes
- After successful complex implementations  
- Before risky experimental modifications
- When institutional memory reaches new stability point

**Backup Naming Convention**:
`[purpose]-backup-[YYYYMMDD-HHMMSS]`

**Examples**:
- `custom-roles-backup-20250808-070944`
- `roo-legacy-backup-20250808-084630`  
- `emergency-backup-20250809-120000`

## Backup Health Monitoring

**Monthly Review**:
- Verify 3-backup limit maintained
- Test recovery procedures on non-critical files
- Validate backup timestamps and contents
- Review backup diversity (different purposes represented)

**Quality Indicators**:
- ✅ Total backup count ≤ 3
- ✅ Most recent backup < 30 days old
- ✅ Backup purposes clearly documented
- ✅ Recovery procedures tested and validated
- ✅ Cross-reference integrity maintained

## Emergency Contacts

**System Recovery**: Check `.docs/handoffs/emergency-escalation.md`
**Security Issues**: Check `.docs/handoffs/security-issue-escalation.md`  
**Institutional Memory**: Reference `.docs/memory/index.md` for historical context

---

**Last Updated**: 2025-08-08
**Next Review**: 2025-09-08
**Backup Policy Version**: 1.0