import { validateAvailabilityRequest } from '@/app/api/availability/functions/availability-validation'

describe('availability-validation', () => {
  describe('validateAvailabilityRequest', () => {
    it('validates correct date parameter', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data).toStrictEqual({
        date: '2024-12-25',
        time: null,
      })
      expect(result.error).toBeNull()
    })

    it('validates correct date and time parameters', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')
      searchParams.set('time', '10:00')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data).toStrictEqual({
        date: '2024-12-25',
        time: '10:00',
      })
      expect(result.error).toBeNull()
    })

    it('rejects missing date parameter', async () => {
      const searchParams = new URLSearchParams()

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('rejects invalid date format', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '25-12-2024')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('rejects malformed date', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-13-32')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)
    })

    it('handles time parameter as optional', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', '2024-12-25')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(true)
      expect(result.data?.time).toBeNull()
    })

    it('returns proper error response structure', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', 'invalid-date')

      const result = await validateAvailabilityRequest(searchParams)

      expect(result.success).toBe(false)
      expect(result.error).not.toBeNull()
      expect(result.error?.status).toBe(400)

      if (result.error) {
        const responseData = await result.error.json()
        expect(responseData).toHaveProperty('message')
        expect(responseData).toHaveProperty('errors')
      }
    })
  })
})
