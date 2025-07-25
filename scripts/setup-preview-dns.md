# DNS Configuration for Preview Environment

## Current Domain Setup
- **Domain**: moodovermuscle.com.au
- **Nameservers**: ns1.vdns.au, ns2.vdns.au
- **Current IP**: 216.198.79.1 (Vercel)

## Required DNS Record

Add this CNAME record to your DNS provider (vdns.au):

```
Type: CNAME
Name: preview
Value: cname.vercel-dns.com
TTL: 300
```

## Steps to Add DNS Record

1. **Log into your DNS provider** (likely through your domain registrar)
2. **Navigate to DNS management** for moodovermuscle.com.au
3. **Add new CNAME record**:
   - **Host/Name**: `preview`
   - **Points to/Value**: `cname.vercel-dns.com`
   - **TTL**: 300 seconds (or leave default)
4. **Save the record**

## Verification Commands

After adding the DNS record, you can verify it's working:

```bash
# Check if DNS record exists (may take time to propagate)
nslookup preview.moodovermuscle.com.au

# Check DNS propagation
dig preview.moodovermuscle.com.au CNAME

# Test HTTP response (after Vercel configuration)
curl -I https://preview.moodovermuscle.com.au
```

## Expected Results

Once configured correctly:
- `preview.moodovermuscle.com.au` should resolve to Vercel's servers
- The preview branch will automatically deploy to this URL
- SSL certificate will be automatically provisioned

## Next Steps

1. Add the DNS record as described above
2. Configure the custom domain in Vercel dashboard
3. Test the deployment workflow