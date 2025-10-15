# Fix Calendar Duplicate Navigation Buttons

## Task Description
Remove duplicate month navigation buttons from the admin calendar page. Currently there are two sets of ChevronLeft/ChevronRight buttons:
1. Built-in navigation from the Calendar component (react-day-picker)
2. Custom navigation buttons in the CardHeader (lines 260-275)

## Implementation Scope
- **Files to modify**: 
  - `app/admin/calendar/page.tsx` - Remove custom navigation buttons from CardHeader OR disable built-in Calendar navigation

## Solution Options
1. **Keep custom buttons, hide Calendar built-in nav**: Add CSS to hide the Calendar component's navigation buttons
2. **Remove custom buttons**: Delete lines 260-275 and rely on Calendar component's built-in navigation

## Roadmap
- [ ] Decide which navigation to keep (custom vs built-in)
- [ ] Either remove custom buttons OR hide Calendar component nav via CSS/props
- [ ] Test that month navigation still works correctly

## Acceptance Criteria
- Only one set of month navigation buttons visible on calendar page
- Month navigation functionality remains intact
- No duplicate ChevronLeft/ChevronRight buttons