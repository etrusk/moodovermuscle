# Emergency Runbook

**Quick reference for critical production issues and emergency procedures.**

## Hotfix Workflow

When production is broken and needs immediate fix:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue-description

# 2. Minimal fix only (no scope creep)
# ... implement fix ...

# 3. Pre-commit gates still required (no bypass)
git add -A
git commit -m "fix(critical): description"

# 4. Fast-track review and merge
git push origin hotfix/critical-issue-description
# Get single reviewer approval
# Merge to main

# 5. Document for post-mortem
# Add to .docs/debt.md
```

**Critical Rules:**
- ⚠️ Pre-commit hooks MUST pass (no `--no-verify`)
- ⚠️ Minimal fix only - no feature additions
- ⚠️ Document in `.docs/debt.md` immediately after deployment

## Rollback Procedures

### Vercel Rollback (Immediate - <30s)

**When:** Production is broken, need instant rollback

1. Open Vercel dashboard
2. Navigate to Deployments
3. Select previous stable deployment
4. Click "Promote to Production"
5. Traffic routes to stable version in <30 seconds

### Git Rollback

**Revert Specific Commit:**
```bash
# Identify bad commit
git log --oneline

# Revert (creates new commit)
git revert [commit-hash]
git push origin main
```

**Emergency Reset (Use Cautiously):**
```bash
# Reset to last known good commit
git reset --hard [last-good-commit]

# Force push (requires force-with-lease)
git push --force-with-lease origin main
```

⚠️ **Force push coordination:**
- Notify all team members before force push
- Ensure no one has unpushed work
- Document in team chat

## Post-Rollback Actions

**MANDATORY after any rollback:**

1. **Verify functionality:**
   ```bash
   npm run test:critical
   npm run test:integration
   ```

2. **Check critical user journeys:**
   - User can log in
   - Booking creation works
   - Admin dashboard accessible
   - Email notifications sending

3. **Document incident:**
   - Create entry in `.docs/investigations/index.md`
   - Include: timestamp, issue, rollback action, root cause (if known)
   - Plan for proper fix

4. **Create fix plan:**
   - Schedule proper investigation
   - Define acceptance criteria
   - Assign to investigation mode

## Pre-Commit Bypass (Last Resort)

**ONLY use in absolute emergency:**

```bash
# Bypass pre-commit (emergency only)
git commit --no-verify -m "fix(critical): emergency bypass - [reason]"
```

**MANDATORY after bypass:**
1. Document reason in commit message
2. Create issue in `.docs/debt.md`
3. Fix violations in next commit
4. Never make bypass a habit

## Common Emergency Scenarios

### Database Connection Lost

**Symptoms:** All API requests failing, Prisma errors

**Quick Fix:**
1. Check database connection string in Vercel environment variables
2. Verify database is running (check hosting provider dashboard)
3. Restart database if necessary
4. If connection string changed, update Vercel env vars and redeploy

### Build Failures Blocking Deployment

**Symptoms:** Vercel build fails, deployment blocked

**Quick Fix:**
1. Check build logs in Vercel dashboard
2. Common causes:
   - TypeScript errors → Fix locally and push
   - Missing environment variables → Add in Vercel settings
   - Dependency issues → Check package.json and pnpm-lock.yaml
3. If critical, consider temporary rollback while fixing

### API Rate Limiting Issues

**Symptoms:** Users getting 429 errors, rate limit exceeded

**Quick Fix:**
1. Check rate limiter configuration in `/lib/rate-limit.ts`
2. Temporarily increase limits if legitimate traffic spike
3. Deploy with higher limits
4. Monitor for abuse patterns
5. Revert to normal limits after spike

### Email Notifications Not Sending

**Symptoms:** Users not receiving booking confirmations

**Quick Fix:**
1. Check email service status (e.g., SendGrid dashboard)
2. Verify environment variables: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
3. Check logs for email sending errors
4. If service down, queue notifications for retry when restored

### Authentication Issues

**Symptoms:** Users can't log in, JWT errors

**Quick Fix:**
1. Check `JWT_SECRET` environment variable
2. Verify token expiration settings
3. Check for clock skew issues (server time vs. token time)
4. If JWT_SECRET changed accidentally, revert to previous value

## Emergency Contacts

**Critical Services:**
- **Hosting:** Vercel (check status.vercel.com)
- **Database:** [Your database provider] (check their status page)
- **Email:** [Your email service] (check their status page)

**Escalation Path:**
1. Check service status pages
2. Review recent deployments in Vercel
3. Check `.docs/investigations/index.md` for similar past issues
4. If still stuck, contact service provider support

## Prevention

**To minimize emergencies:**
- ✅ Always use preview deployments for functionality changes
- ✅ Get client approval before merging to production
- ✅ Run full test suite before deployment
- ✅ Monitor error rates after deployment
- ✅ Keep `.docs/investigations/index.md` updated with known issues

## Post-Incident Actions

**After resolving any emergency:**

1. **Document incident:**
   ```markdown
   # Add to .docs/investigations/index.md
   
   ## [Date] - [Brief Description]
   - **Problem:** What went wrong
   - **Root Cause:** Why it happened
   - **Emergency Fix:** What was done immediately
   - **Permanent Solution:** Long-term fix implemented/planned
   - **Prevention:** How to avoid in future
   ```

2. **Technical debt assessment:**
   - If shortcuts were taken, document in `.docs/debt.md`
   - Schedule proper fix within 1 week
   - Never let emergency bypasses become permanent

3. **Process improvements:**
   - Update this runbook if procedures were unclear
   - Add monitoring/alerting if issue could have been detected earlier
   - Update pre-deployment checklist if preventable

---

**Remember:** Pre-commit automation prevents most emergencies. Trust the automation, don't bypass it except in true production-down scenarios.