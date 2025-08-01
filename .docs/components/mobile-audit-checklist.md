# Mobile Experience Audit Checklist

## Quick Reference for Mobile Testing

### Device Matrix (Priority Testing)

| Device        | Viewport | Browser | Priority |
| ------------- | -------- | ------- | -------- |
| iPhone 14 Pro | 390x844  | Safari  | Critical |
| iPhone SE     | 375x667  | Safari  | High     |
| Pixel 7       | 412x915  | Chrome  | Critical |
| Galaxy S22    | 360x780  | Chrome  | High     |

### Core Web Vitals Targets (Mobile)

- **LCP**: <2.5s on Slow 4G
- **FID/INP**: <100ms
- **CLS**: <0.1

### Essential Checks

- [ ] Touch targets ≥44x44px
- [ ] Viewport meta tag configured
- [ ] Calendar component responsive
- [ ] Form inputs show correct keyboards
- [ ] Error messages visible without zoom
- [ ] WCAG 2.1 AA compliance verified

### Test Scenarios

1. **Complete Booking Flow**: Mobile viewport end-to-end
2. **Form Validation**: Error handling on mobile
3. **Network Simulation**: Slow 4G performance
4. **Accessibility**: VoiceOver/TalkBack navigation
5. **Orientation Changes**: Portrait/landscape testing

### Implementation Commands

```bash
# Automated mobile accessibility testing
pnpm test:e2e e2e/mobile-accessibility.spec.ts

# Lighthouse mobile audit
pnpm lighthouse --preset=mobile

# Device emulation testing
# Use Chrome DevTools device toolbar
```

---

**Usage**: Quick reference during mobile development and testing
**Full Strategy**: See [Mobile Audit Strategy](../mobile-audit-strategy.md) for complete methodology
