export function createTestBookingData(overrides = {}): Record<string, unknown> {
  return {
    name: 'Integration Test User',
    email: `test-integration-${Date.now()}@example.com`,
    phone: '0412345678',
    service: '1-on-1 Personal Training',
    date: new Date(Date.now() + 30 * 864e5), // dynamic future date — a literal here rots into the past
    time: '10:00',
    goals: 'Community', // Fix capitalization to match component
    experience: 'Beginner',
    message: 'Integration test booking',
    ...overrides,
  }
}
