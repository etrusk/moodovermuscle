# Admin UI Fixes

## Task Description
Fix three UI issues in the admin dashboard:
1. Replace mock data in Recent Activity section with real booking data
2. Fix navigation highlight to respond to current pathname
3. Remove duplicate month navigation buttons from calendar page

## Implementation Scope
- **Files to modify**: 
  - `app/admin/dashboard/page.tsx` - fetch and display real recent activity
  - `app/admin/layout.tsx` - dynamic navigation highlighting
  - `app/admin/calendar/page.tsx` - remove duplicate navigation buttons

## Roadmap
- [ ] Fetch recent bookings sorted by updatedAt/createdAt in dashboard
- [ ] Display latest 3 booking activities instead of mock data
- [ ] Use pathname to determine active navigation link
- [ ] Remove month navigation buttons from top-right of calendar card (keep only in header)

## Acceptance Criteria
- Recent Activity shows real booking data with accurate timestamps
- Navigation highlight switches correctly between Dashboard/Bookings/Calendar
- Calendar page has only one set of month navigation buttons (in card header)