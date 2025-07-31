export function createTestBookingData(overrides = {}) {
  return {
    name: 'Integration Test User',
    email: `test-integration-${Date.now()}@example.com`,
    phone: '0412345678',
    service: '1-on-1 Personal Training',
    date: new Date('2024-12-01T10:00:00Z'),
    time: '10:00 AM',
    goals: 'community',
    experience: 'Beginner',
    message: 'Integration test booking',
    ...overrides,
  }
}