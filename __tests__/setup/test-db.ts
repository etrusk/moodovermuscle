import { PrismaClient } from '@/lib/generated/prisma'

// Create a separate Prisma client for integration tests
// Uses Neon PostgreSQL connection string format
// Format: postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require
export const testDb = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      // Prefer test-specific DATABASE_URL_TEST for isolated testing
      // Falls back to main DATABASE_URL (Neon production) if test DB not configured
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
    }
  }
})

// Helper to clean up test data
export async function cleanupTestData() {
  try {
    // Delete all test bookings (we'll use a test email pattern)
    await testDb.booking.deleteMany({
      where: {
        email: {
          contains: 'test-integration'
        }
      }
    })
  } catch (error) {
    console.warn('Cleanup failed:', error)
  }
}

// Helper to create test booking data
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
    ...overrides
  }
}

// Setup and teardown helpers
export async function setupIntegrationTest() {
  await cleanupTestData()
}

export async function teardownIntegrationTest() {
  await cleanupTestData()
  await testDb.$disconnect()
}
export async function waitFor<T>(fn: () => Promise<T>, { timeout = 15000, interval = 100 } = {}): Promise<T> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch (e) {
      // Ignore errors and retry
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('Timed out waiting for condition.')
}