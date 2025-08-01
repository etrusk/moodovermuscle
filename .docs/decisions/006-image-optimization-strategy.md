# Decision: Image Optimization Strategy for Performance

**Date**: 2025-08-01
**Status**: Decided
**Context**: Address performance debt and improve Core Web Vitals through comprehensive image optimization

## Problem

Image optimization is identified as top priority technical debt with significant impact on mobile performance and Core Web Vitals. Current implementation issues:

- Hero section uses CSS background-image instead of optimized Next.js Image
- No modern format support (WebP/AVIF)
- Fixed image sizes don't adapt to mobile viewports
- Missing priority loading for above-the-fold images
- Large image payload impacting LCP performance

## Options Considered

### Option A: Basic Next.js Image Migration

- Convert existing `<img>` and CSS backgrounds to Next.js Image
- Keep current sizing and loading strategies
- **Pros**: Minimal changes, automatic WebP generation
- **Cons**: Misses responsive sizing and loading optimizations

### Option B: Comprehensive Optimization Strategy

- Full Next.js Image implementation with responsive sizing
- Strategic loading priorities (priority vs lazy)
- Modern format adoption with fallbacks
- Performance monitoring integration
- **Pros**: Maximum performance impact, future-proof approach
- **Cons**: More implementation effort, requires testing

### Option C: Third-party Image CDN

- Use service like Cloudinary or ImageKit
- **Pros**: Advanced optimization features, minimal config
- **Cons**: Additional cost, external dependency, privacy concerns

## Decision

**Chosen: Option B - Comprehensive Optimization Strategy**

Rationale:

- Aligns with project's FLOSS/free tool preference
- Leverages Next.js built-in capabilities (no external dependencies)
- Addresses all identified performance issues comprehensively
- Supports mobile-first design principles
- Maintains functionality and simplicity requirements

## Implementation Strategy

### Format Optimization

```javascript
// next.config.mjs
images: {
  formats: ['image/webp', 'image/jpeg'],
  quality: 85,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
}
```

### Loading Strategy

- **Priority Loading**: Hero image, Emily portrait (above-the-fold)
- **Lazy Loading**: Gallery images, footer elements (below-the-fold)
- **Progressive Enhancement**: Blur-up placeholders for smooth UX

### Responsive Sizing

- Mobile (320-768px): 25-50% smaller images
- Tablet (768-1024px): 75% of desktop size
- Desktop (1024px+): Full resolution optimized images

## Technical Benefits

### Performance Impact

- **WebP Adoption**: 25-35% smaller file sizes vs JPEG
- **Responsive Loading**: Optimal image size per device
- **Priority Loading**: LCP optimization for above-the-fold content
- **Lazy Loading**: Reduced initial page load time

### Developer Experience

- **Type Safety**: Next.js Image component TypeScript support
- **Automatic Optimization**: No manual image processing needed
- **Layout Shift Prevention**: Built-in aspect ratio preservation
- **Performance Monitoring**: Integration with existing Lighthouse CI

## Implementation Notes

### Phase-by-Phase Approach

1. **Hero Section**: Critical LCP improvement
2. **Gallery Section**: Largest payload reduction opportunity
3. **Logos/Portraits**: Complete Next.js Image migration
4. **Configuration**: Advanced optimization features
5. **Testing**: Performance validation and cross-browser testing

### Quality Gates

- Maintain visual design fidelity
- Preserve hover effects and interactions
- Cross-browser compatibility (including Safari)
- Performance improvements measurable via Core Web Vitals

### Success Metrics

- 40-50% image payload reduction
- LCP under 2.5s on mobile
- CLS maintained under 0.1
- 90+ Lighthouse Performance score
- WebP adoption >85%

## Related Docs

- [.docs/current-task.md](../current-task.md): Detailed implementation roadmap
- [.docs/architecture.md#performance-monitoring](../architecture.md): Monitoring setup
- [.docs/debt.md#image-optimization](../debt.md): Technical debt tracking
- [.docs/workflows.md#performance-monitoring](../workflows.md): Lighthouse CI integration

## Risk Mitigation

### Visual Regression Prevention

- Comprehensive cross-browser testing
- Before/after screenshot comparison
- Hover effect and transition verification

### Performance Validation

- Lighthouse audit comparison
- Core Web Vitals monitoring via SpeedInsights
- Network throttling testing for mobile scenarios

### Fallback Strategy

- Automatic JPEG fallback for older browsers
- Graceful degradation for JavaScript-disabled environments
- Proper error handling for failed image loads

This decision supports the project's focus on functionality over complexity while delivering significant performance improvements for the target user base of busy mums accessing the site on mobile devices.
