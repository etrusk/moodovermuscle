# Performance Optimization Guide

## Overview

This guide outlines performance optimization strategies for the Mood Over Muscle fitness website, ensuring fast load times, smooth interactions, and excellent user experience across all devices.

## Table of Contents

1. [Performance Targets](#performance-targets)
2. [Optimization Strategies](#optimization-strategies)
3. [Performance Checklist](#performance-checklist)
4. [Monitoring & Maintenance](#monitoring--maintenance)
5. [Performance Resources](#performance-resources)

---

**Document Information**
- **Last Updated**: 2025-07-27
- **Version**: 1.0
- **Owner**: Development Team
- **Review Schedule**: Quarterly

---

## Performance Targets

### Core Web Vitals

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 200ms

### User Experience Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Speed Index**: < 3.4s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms

## Optimization Strategies

### 1. Image Optimization

#### Next.js Image Component

```typescript
import Image from 'next/image'

// Optimized hero image
<Image
  src="/images/hero-emilia.jpg"
  alt="Emilia leading a fitness class"
  width={1920}
  height={1080}
  quality={85}
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>

// Responsive gallery images
<Image
  src="/images/gallery-1.jpg"
  alt="Mom fitness group"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={80}
  loading="lazy"
/>
```

#### Image Formats

- **WebP**: Primary format with fallbacks
- **AVIF**: Next-gen format for modern browsers
- **JPEG**: Fallback for older browsers
- **Responsive Images**: Multiple sizes for different screen densities

#### CDN Configuration

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['moodovermuscle.com.au'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 2. Code Splitting & Bundle Optimization

#### Dynamic Imports

```typescript
// Lazy load heavy components
const BookingForm = dynamic(() => import('@/components/booking-form'), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
  ssr: false
})

// Route-based code splitting
const ClassesPage = lazy(() => import('./classes/page'))
```

#### Bundle Analysis

```bash
# Analyze bundle size
pnpm analyze

# Check for duplicate dependencies
pnpm dedupe

# Bundle optimization
pnpm build --analyze
```

### 3. Font Optimization

#### Next.js Font System

```typescript
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
})
```

#### Font Loading Strategy

- **Preload critical fonts**: Above-the-fold content
- **Font-display: swap**: Prevent invisible text
- **Variable fonts**: Reduce font file sizes

### 4. Caching Strategy

#### Next.js Caching

```typescript
// Static Generation with ISR
export async function getStaticProps() {
  const classes = await getClasses()

  return {
    props: { classes },
    revalidate: 3600, // Revalidate every hour
  }
}

// API route caching
export async function GET(request: Request) {
  const data = await getData()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

### 5. Database Optimization

#### Query Optimization

```typescript
// Prisma query optimization
const classes = await prisma.class.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    instructor: {
      select: {
        name: true,
        image: true,
      },
    },
  },
  where: {
    isActive: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
})
```

### 6. CDN & Edge Optimization

#### Vercel Edge Network

- **Global CDN**: Automatic edge caching
- **Edge Functions**: Server-side rendering at edge
- **Image Optimization**: Automatic format conversion
- **Compression**: Brotli compression enabled

### 7. Monitoring & Analytics

#### Performance Monitoring

```typescript
// Next.js Analytics
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

#### Real User Monitoring

```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)

  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send to Google Analytics, Sentry, etc.
  }
}
```

### 8. Performance Budget

#### Bundle Size Limits

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }
    return config
  },
}
```

#### Performance Budget Configuration

```json
// budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 150
      },
      {
        "resourceType": "image",
        "budget": 500
      },
      {
        "resourceType": "stylesheet",
        "budget": 50
      }
    ]
  }
]
```

### 9. Development Tools

#### Performance Analysis

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# WebPageTest
npm install -g webpagetest-cli
webpagetest test https://moodovermuscle.com.au

# Bundle Analyzer
npm run build --analyze
```

### 10. Performance Testing

#### Load Testing

```javascript
// k6 performance test
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.1'],
  },
}

export default function () {
  const response = http.get('https://moodovermuscle.com.au/api/classes')

  check(response, {
    'status is 200': r => r.status === 200,
    'response time < 500ms': r => r.timings.duration < 500,
  })
}
```

## Performance Checklist

### Development Phase

- [ ] Images optimized and responsive
- [ ] Code splitting implemented
- [ ] Fonts optimized and preloaded
- [ ] Caching strategy configured
- [ ] Bundle size monitored
- [ ] Performance budgets set

### Testing Phase

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Load testing completed
- [ ] Cross-browser testing done
- [ ] Mobile performance verified

### Deployment Phase

- [ ] CDN configured
- [ ] Compression enabled
- [ ] Monitoring set up
- [ ] Performance budgets enforced
- [ ] Real user monitoring active

## Monitoring & Maintenance

### Performance Monitoring Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: Web vitals tracking
- **Sentry**: Performance monitoring and error tracking
- **Lighthouse CI**: Automated performance testing

### Regular Audits

- **Weekly**: Lighthouse scores review
- **Monthly**: Bundle size analysis
- **Quarterly**: Full performance audit
- **Annually**: Technology stack review

## Performance Resources

### Tools & Services

- **Google PageSpeed Insights**: Performance analysis
- **WebPageTest**: Detailed performance testing
- **Lighthouse**: Automated audits
- **Bundle Analyzer**: Bundle size visualization
- **SpeedCurve**: Real user monitoring

### Documentation

- [Next.js Performance Documentation](https://nextjs.org/docs/basic-features/performance)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Vercel Performance Best Practices](https://vercel.com/docs/concepts/edge-network/compression)
