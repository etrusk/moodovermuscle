# Preview Branch Implementation Status

## ✅ Completed Steps

1. **Spec Updated**: Added preview branch requirements and design to dev-prod-environment-setup spec
2. **Preview Branch Created**: Created `preview` branch from `main` and pushed to GitHub
3. **Documentation Created**: Added setup guides and DNS configuration instructions
4. **Initial Deployment**: Pushed changes to preview branch to trigger Vercel deployment

## ⏳ Next Steps Required

### 1. Vercel Dashboard Configuration
You need to configure Vercel to deploy the preview branch to a custom domain:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `moodovermuscle` project
3. Go to **Settings → Domains**
4. Click **Add Domain**
5. Enter: `preview.moodovermuscle.com.au`
6. Configure it to deploy from the `preview` branch (not main)

### 2. DNS Configuration
Add this CNAME record to your DNS provider (vdns.au):

```
Type: CNAME
Name: preview
Value: cname.vercel-dns.com
TTL: 300
```

### 3. Verification
After completing steps 1 and 2:
- `preview.moodovermuscle.com.au` should resolve
- SSL certificate will be automatically provisioned
- Preview branch changes will deploy to this static URL

## 🔄 Workflow Once Complete

```
Development Flow:
feature/new-booking-form → preview → main
                        ↓         ↓
                preview.domain  production.domain
```

1. **Develop**: Create feature branches from `main`
2. **Test**: Merge features to `preview` branch
3. **Review**: Test on `preview.moodovermuscle.com.au`
4. **Deploy**: Merge `preview` to `main` when approved

## 📋 Current Branch Status

- **main**: Production branch → moodovermuscle.com.au
- **preview**: Staging branch → preview.moodovermuscle.com.au (pending DNS/Vercel config)
- **bugfix/typo**: Feature branch (can be merged to preview for testing)

## 🛠️ Commands for Daily Use

```bash
# Switch to preview for testing
git checkout preview

# Merge a feature to preview
git checkout preview
git merge feature/branch-name
git push origin preview

# Deploy to production (after preview testing)
git checkout main
git merge preview
git push origin main
```

The preview branch infrastructure is now ready - you just need to complete the Vercel and DNS configuration steps above!