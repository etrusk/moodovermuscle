# Monitoring and Observability Guide

## Overview

This comprehensive guide covers the monitoring and observability setup for the MoodOverMuscle fitness website, including application performance monitoring, error tracking, security monitoring, and business metrics tracking.

## Monitoring Architecture

### Three Pillars of Observability

1. **Metrics**: Numerical measurements over time
2. **Logs**: Discrete events with context
3. **Traces**: Request flow through the system

### Monitoring Stack

| Component | Purpose | Tool | Configuration |
|-----------|---------|------|---------------|
| **APM** | Application performance | Vercel Analytics | Built-in |
| **Error Tracking** | Error monitoring | Sentry | Optional integration |
| **Performance** | Core Web Vitals | Lighthouse CI | GitHub Actions |
| **Uptime** | Availability monitoring | Vercel Status | Built-in |
| **Security** | Security monitoring | Dependabot | GitHub integration |
| **Business** | Key business metrics | Custom dashboards | Vercel Analytics |

## Application Performance Monitoring (APM)

### Vercel Analytics Configuration

#### Built-in Analytics
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Speed Insights
```javascript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Performance Metrics Dashboard

#### Core Web Vitals Monitoring
```javascript
// lib/monitoring/web-vitals.ts
export function reportWebVitals(metric: any) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    console.log(metric)
  }
}
```

#### Custom Performance Tracking
```javascript
// lib/monitoring/performance.ts
export const trackPerformance = {
  pageLoad: () => {
    // Track page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    // Send to analytics
  },
  
  apiResponse: (endpoint: string, duration: number) => {
    // Track API response times
    // Send to analytics
  }
}
```

## Error Tracking and Alerting

### Error Monitoring Setup

#### Vercel Error Monitoring
- **Automatic**: Built-in error tracking
- **Real-time**: Immediate error notifications
- **Context**: Request details and stack traces

#### Custom Error Handling
```javascript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error to monitoring service
  console.error('Application error:', error)
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

#### Global Error Handler
```javascript
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Send error to monitoring service
  console.error('Global error:', error)
  
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

### Alerting Configuration

#### Vercel Alerts
- **Error Rate**: > 1% for 5 minutes
- **Response Time**: > 3 seconds
- **Uptime**: < 99.9%

#### Custom Alert Rules
```javascript
// scripts/alert-rules.js
const alertRules = {
  errorRate: {
    threshold: 0.01,
    duration: 300, // 5 minutes
    severity: 'critical'
  },
  responseTime: {
    threshold: 3000, // 3 seconds
    duration: 300,
    severity: 'warning'
  },
  uptime: {
    threshold: 0.999,
    duration: 60,
    severity: 'critical'
  }
}
```

## Security Monitoring

### Security Headers Monitoring
```javascript
// lib/security/headers.ts
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

### Vulnerability Scanning
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/super-linter@v5
      - uses: snyk/actions/node@master
```

### Dependency Monitoring
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## Business Metrics Tracking

### Key Business Metrics

#### User Engagement
- **Page Views**: Daily/weekly/monthly
- **Session Duration**: Average time on site
- **Bounce Rate**: Single-page session percentage
- **Conversion Rate**: Booking completion rate

#### Booking Metrics
- **Total Bookings**: Daily/weekly/monthly
- **Booking Success Rate**: Successful vs failed bookings
- **Popular Classes**: Most booked classes
- **Peak Hours**: High-traffic periods

### Custom Analytics Dashboard

#### Google Analytics 4 Setup
```javascript
// lib/analytics/google-analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: any) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

#### Custom Event Tracking
```javascript
// lib/analytics/events.ts
export const trackBooking = {
  started: (classId: string) => {
    // Track booking start
  },
  completed: (classId: string, price: number) => {
    // Track successful booking
  },
  failed: (classId: string, error: string) => {
    // Track failed booking
  }
}
```

## Infrastructure Monitoring

### Vercel Infrastructure Monitoring

#### Deployment Monitoring
```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/health-check",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Health Check Endpoints
```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  }
  
  return NextResponse.json(health)
}
```

### Database Monitoring (if applicable)
```javascript
// lib/monitoring/database.ts
export const trackDatabaseMetrics = {
  queryTime: (query: string, duration: number) => {
    // Track slow queries
  },
  connectionPool: (active: number, idle: number) => {
    // Track connection pool usage
  }
}
```

## Log Management

### Structured Logging
```javascript
// lib/logger/index.ts
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined
})

export default logger
```

### Log Levels and Usage
```javascript
// Usage examples
logger.info('User booking created', { userId, classId })
logger.warn('Slow API response', { endpoint, duration })
logger.error('Booking failed', { error, userId, classId })
```

## Alerting and Incident Response

### Alert Channels
- **Slack**: #alerts channel
- **Email**: alerts@moodovermuscle.com.au
- **SMS**: Critical incidents only

### Escalation Matrix
| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical | 5 minutes | On-call engineer |
| High | 15 minutes | Tech lead |
| Medium | 1 hour | Development team |
| Low | 24 hours | Weekly review |

### Incident Response Playbook
```markdown
## Incident Response Steps

1. **Detection**: Alert triggered
2. **Assessment**: Evaluate impact
3. **Communication**: Notify stakeholders
4. **Resolution**: Implement fix
5. **Verification**: Confirm resolution
6. **Post-mortem**: Document lessons learned
```

## Dashboard and Visualization

### Vercel Analytics Dashboard
- **Real-time**: Live traffic and performance
- **Performance**: Core Web Vitals trends
- **Audience**: User demographics and behavior
- **Acquisition**: Traffic sources and campaigns

### Custom Dashboards
```javascript
// lib/dashboards/business-metrics.ts
export const createBusinessDashboard = {
  dailyActiveUsers: () => {
    // Track daily active users
  },
  bookingConversionRate: () => {
    // Track booking conversion funnel
  },
  revenuePerUser: () => {
    // Track revenue metrics
  }
}
```

## Monitoring Best Practices

### Alert Fatigue Prevention
- **Relevant Alerts**: Only actionable alerts
- **Clear Thresholds**: Well-defined alert conditions
- **Escalation Rules**: Proper escalation procedures
- **Regular Review**: Monthly alert effectiveness review

### Data Retention
- **Metrics**: 90 days detailed, 2 years aggregated
- **Logs**: 30 days detailed, 1 year error logs
- **Traces**: 7 days detailed, 30 days sampled

### Privacy and Compliance
- **GDPR Compliance**: No PII in logs
- **Data Anonymization**: User ID hashing
- **Consent Management**: Cookie consent tracking
- **Right to be Forgotten**: Data deletion procedures

## Tools and Configuration

### Monitoring Stack Setup
```bash
# Install monitoring dependencies
pnpm add -D @vercel/analytics @vercel/speed-insights

# Configure environment variables
echo "NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id" >> .env.local
echo "NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=your-insights-id" >> .env.local
```

### Monitoring Scripts
```bash
# Health check
./scripts/health-check.js

# Performance audit
./scripts/performance-audit.js

# Security scan
./scripts/security-scan.js
```

## Troubleshooting Guide

### Common Monitoring Issues

#### High Error Rates
1. Check error logs for patterns
2. Review recent deployments
3. Verify third-party integrations
4. Check database performance

#### Performance Degradation
1. Analyze Core Web Vitals
2. Review bundle size changes
3. Check API response times
4. Verify CDN configuration

#### False Positive Alerts
1. Review alert thresholds
2. Check data quality
3. Verify alert conditions
4. Update alert rules

---

**Last Updated**: July 2025  
**Next Review**: October 2025  
**Monitoring Owner**: DevOps Team  
**Stakeholders**: Development, Product, Support