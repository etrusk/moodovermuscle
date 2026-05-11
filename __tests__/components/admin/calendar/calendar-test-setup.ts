/**
 * Shared test setup for calendar component tests
 */

import { vi } from 'vitest'
import { buildMockBookings } from '@/__tests__/fixtures/bookings'

export const mockUser = {
  id: '1',
  name: 'Emilia',
  email: 'emily@moodovermuscle.com.au'
}

export const mockBookings = buildMockBookings({ lisaDate: '2025-08-11' })

export const createMockResponse = (data: any) => ({
  ok: true,
  json: vi.fn(() => Promise.resolve(data)),
  clone: vi.fn().mockReturnThis(),
  status: 200,
  statusText: 'OK'
})

export const createMockErrorResponse = (error: string) => ({
  ok: false,
  statusText: 'Internal Server Error',
  json: vi.fn(() => Promise.resolve({ error })),
  clone: vi.fn().mockReturnThis()
})