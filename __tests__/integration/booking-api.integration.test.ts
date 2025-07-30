/**
 * @jest-environment node
 */
import { POST } from '@/app/api/book-session/route'
import { NextRequest } from 'next/server'
import { testDb, setupIntegrationTest, teardownIntegrationTest, createTestBookingData, waitFor } from '../setup/test-db'
jest.setTimeout(15000);

// Mock the prisma client to use the test database
jest.mock('@/lib/prisma', () => {
  const { testDb } = require('../setup/test-db')
  return { prisma: testDb }
})
// Mock the prisma client
// Mock email functions for integration tests
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' }),
}))

function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

describe('Booking API Integration Tests', () => {
  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  describe('POST /api/book-session', () => {
    it.skip('should create a booking in the database with valid data', async () => {
      const testData = createTestBookingData()
      const req = makeJsonRequest(testData)
      
      const response = await POST(req)
      expect(response.status).toBe(201)
      
      const responseData = await response.json()
      expect(responseData.message).toBe('Booking submitted successfully!')
      expect(responseData.data).toHaveProperty('id')
      
      // Verify booking was actually created in database
      const createdBooking = (await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data.id },
        })
      )) as any
      
      expect(createdBooking).toBeTruthy()
      expect(createdBooking?.name).toBe(testData.name)
      expect(createdBooking?.email).toBe(testData.email)
      expect(createdBooking?.service).toBe(testData.service)
      expect(createdBooking?.goals).toBe(testData.goals)
      expect(createdBooking?.experience).toBe(testData.experience)
    })

    it('should handle database constraint violations', async () => {
      const testData = createTestBookingData({
        email: 'invalid-email' // This should fail validation
      })
      const req = makeJsonRequest(testData)
      
      const response = await POST(req)
      expect(response.status).toBe(400)
      
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'Test User',
        // Missing required fields
      }
      const req = makeJsonRequest(incompleteData)
      
      const response = await POST(req)
      expect(response.status).toBe(400)
      
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it.skip('should create multiple bookings without conflicts', async () => {
      const testData1 = createTestBookingData({ name: 'User 1' })
      const testData2 = createTestBookingData({ name: 'User 2' })
      
      const req1 = makeJsonRequest(testData1)
      const req2 = makeJsonRequest(testData2)
      
      const response1 = await POST(req1)
      const response2 = await POST(req2)
      
      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.data.id).not.toBe(data2.data.id)
      
      // Verify both bookings exist in database
      const booking1 = (await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: data1.data.id },
        })
      )) as any
      const booking2 = (await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: data2.data.id },
        })
      )) as any
      
      expect(booking1?.name).toBe('User 1')
      expect(booking2?.name).toBe('User 2')
    })

    it.skip('should handle date and time fields correctly', async () => {
      const futureDate = new Date('2024-12-25T14:30:00Z')
      const testData = createTestBookingData({
        date: futureDate.toISOString(),
        time: '2:30 PM'
      })
      
      const req = makeJsonRequest(testData)
      const response = await POST(req)
      
      expect(response.status).toBe(201)
      
      const responseData = await response.json()
      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data.id },
        })
      )
      
      expect(createdBooking?.time).toBe('2:30 PM')
      expect(createdBooking?.date).toEqual(futureDate)
    })

    it.skip('should handle optional fields correctly', async () => {
      const testData = createTestBookingData({
        phone: undefined,
        message: undefined
      })
      
      const req = makeJsonRequest(testData)
      const response = await POST(req)
      
      expect(response.status).toBe(201)
      
      const responseData = await response.json()
      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data.id },
        })
      )
      
      expect(createdBooking?.phone).toBeNull()
      expect(createdBooking?.message).toBeNull()
    })

    it('should validate service types', async () => {
      const testData = createTestBookingData({
        service: 'Invalid Service Type'
      })
      
      const req = makeJsonRequest(testData)
      const response = await POST(req)
      
      expect(response.status).toBe(400)
      
      const responseData = await response.json()
      expect(responseData.message).toBe('Invalid form data.')
      expect(responseData.errors).toBeDefined()
    })

    it.skip('should validate goals and experience fields', async () => {
      const validData = createTestBookingData({
        goals: 'strength',
        experience: 'Intermediate'
      })
      
      const req = makeJsonRequest(validData)
      const response = await POST(req)
      
      expect(response.status).toBe(201)
      
      const responseData = await response.json()
      const createdBooking = await waitFor(() =>
        testDb.booking.findUnique({
          where: { id: responseData.data.id },
        })
      )
      
      expect(createdBooking?.goals).toBe('strength')
      expect(createdBooking?.experience).toBe('Intermediate')
    })
  })
})