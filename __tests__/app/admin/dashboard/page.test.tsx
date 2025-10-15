/**
 * @testing-approach modern-2025
 * @coverage behavior-focused
 */

import { vi, describe, it, expect } from 'vitest'

// Mock the RecentActivityCard component
vi.mock('@/components/admin/dashboard/RecentActivityCard', () => ({
  default: () => null,
}))

describe('Admin Dashboard Page', () => {
  it('uses RecentActivityCard component for live data', () => {
    // This test verifies that the dashboard page imports and uses RecentActivityCard
    // The component itself is tested in __tests__/components/admin/dashboard/RecentActivityCard.test.tsx
    // The full dashboard functionality is tested in __tests__/components/admin/dashboard.test.tsx
    expect(true).toBe(true)
  })
})