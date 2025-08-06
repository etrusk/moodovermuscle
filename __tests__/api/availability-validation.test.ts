import { validateAvailabilityRequest } from '@/app/api/availability/functions/availability-validation'

describe('availability-validation', () => {
  describe('validateAvailabilityRequest', () => {
    it('should validate correct date parameter', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        date: '2024-12-25',
        time: null,
      })
      expect(result.error).toBeNull()
    })

    it('should validate correct date and time parameters', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')
      searchParams.set('time', '10:00')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        date: '2024-12-25',
        time: '10:00',
      })
      expect(result.error).toBeNull()
    })

    it('should reject missing date parameter', async () => {
      const searchParams = new URLSearchParams()

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('should reject invalid date format', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '25-12-2024') // Wrong format

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('should reject malformed date', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-13-32') // Invalid date

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('should handle time parameter as optional', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')
      // No time parameter

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data?.time).toBeNull()
    })

    it('should return proper error response structure', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', 'invalid-date')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)

      // Check error response content
      if (result.error) {
        const responseData = await result.error.json()
        expect(responseData).toHaveProperty('message')
        expect(responseData).toHaveProperty('errors')
      }
    })
  })
})
