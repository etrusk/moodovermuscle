import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import {
  validateAvailability,
  prepareSubmissionData,
  submitBookingRequest,
} from '@/components/booking-form/logic/formSubmission'
import type { BookingFormData } from '@/components/booking-form/bookingFormLogic'

function makeFetch(responses: Array<{ ok: boolean; body: unknown }>) {
  const fn = vi.fn()
  responses.forEach(({ ok, body }) =>
    fn.mockResolvedValueOnce({ ok, json: async () => body })
  )
  return fn
}

const baseData: BookingFormData = {
  name: 'Ada',
  email: 'ada@example.com',
  date: new Date('2026-08-01T00:00:00.000Z'),
  time: '10:00 AM',
}

describe('formSubmission', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('validateAvailability', () => {
    it('returns no error and does not fetch when date is missing', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const result = await validateAvailability({ ...baseData, date: undefined })

      expect(result).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns no error and does not fetch when time is missing', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const result = await validateAvailability({ ...baseData, time: undefined })

      expect(result).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('queries availability for the selected date (YYYY-MM-DD)', async () => {
      const fetchMock = makeFetch([{ ok: true, body: { availableTimes: ['10:00 AM'] } }])
      vi.stubGlobal('fetch', fetchMock)

      await validateAvailability(baseData)

      expect(fetchMock).toHaveBeenCalledWith('/api/availability?date=2026-08-01')
    })

    it('returns a retry error when the availability request fails', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: false, body: {} }]))

      const result = await validateAvailability(baseData)

      expect(result).toEqual({
        error: 'Failed to verify availability. Please try again.',
      })
    })

    it('returns a slot-taken error when the chosen time is no longer available', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: true, body: { availableTimes: ['11:00 AM'] } }]))

      const result = await validateAvailability(baseData)

      expect(result).toEqual({
        error: 'Selected time slot is no longer available. Please choose another slot.',
      })
    })

    it('returns no error when the chosen time is still available', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: true, body: { availableTimes: ['09:00 AM', '10:00 AM'] } }]))

      const result = await validateAvailability(baseData)

      expect(result).toEqual({})
    })
  })

  describe('prepareSubmissionData', () => {
    it('serialises the date to ISO and converts the time to 24-hour format', () => {
      const data = prepareSubmissionData({ ...baseData, time: '02:30 PM' })

      expect(data.date).toBe('2026-08-01T00:00:00.000Z')
      expect(data.time).toBe('14:30')
    })

    it('strips empty-string and undefined fields', () => {
      const data = prepareSubmissionData({
        ...baseData,
        phone: '',
        message: undefined,
        goals: 'strength',
      })

      expect(data).not.toHaveProperty('phone')
      expect(data).not.toHaveProperty('message')
      expect(data.goals).toBe('strength')
    })

    it('leaves date and time undefined-safe when absent', () => {
      const data = prepareSubmissionData({ ...baseData, date: undefined, time: undefined })

      expect(data).not.toHaveProperty('date')
      expect(data).not.toHaveProperty('time')
    })
  })

  describe('submitBookingRequest', () => {
    it('POSTs the payload as JSON to /api/book-session', async () => {
      const fetchMock = makeFetch([{ ok: true, body: { success: true, bookingId: 'b1' } }])
      vi.stubGlobal('fetch', fetchMock)

      await submitBookingRequest({ name: 'Ada' })

      expect(fetchMock).toHaveBeenCalledWith('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ada' }),
      })
    })

    it('returns the parsed result on success', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: true, body: { success: true, bookingId: 'b1' } }]))

      const result = await submitBookingRequest({ name: 'Ada' })

      expect(result).toEqual({ result: { success: true, bookingId: 'b1' } })
    })

    it('surfaces the server-provided error message on failure', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: false, body: { error: 'Time already booked' } }]))

      const result = await submitBookingRequest({ name: 'Ada' })

      expect(result).toEqual({ error: 'Time already booked' })
    })

    it('falls back to message, then a generic error, when no error field is present', async () => {
      vi.stubGlobal('fetch', makeFetch([{ ok: false, body: { message: 'Validation failed' } }]))
      expect(await submitBookingRequest({})).toEqual({ error: 'Validation failed' })

      vi.stubGlobal('fetch', makeFetch([{ ok: false, body: {} }]))
      expect(await submitBookingRequest({})).toEqual({
        error: 'Booking failed. Please try again.',
      })
    })
  })
})
