export function createTestBookingData(overrides = {}) {
  return {
    name: 'Integration Test User',
    email: `test-integration-${Date.now()}@example.com`,
    phone: '0412345678',
    service: '1-on-1 Personal Training',
    date: new Date('2025-12-01T10:00:00Z'), // Use future date
    time: '10:00',
    goals: 'Community', // Fix capitalization to match component
    experience: 'Beginner',
    message: 'Integration test booking',
    ...overrides,
  }
}
