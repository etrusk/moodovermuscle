import { vi, describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useBookingFormLogic } from '@/components/booking-form/bookingFormLogic'
import type { BookingFormData } from '@/components/booking-form/bookingFormLogic'

const validData: BookingFormData = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '0400000000',
  service: 'personal-training',
  date: new Date('2026-08-01T00:00:00.000Z'),
  time: '10:00 AM',
  goals: 'strength',
}

function stubFetchSequence(responses: Array<{ ok: boolean; body: unknown }>) {
  const fn = vi.fn()
  responses.forEach(({ ok, body }) =>
    fn.mockResolvedValueOnce({ ok, json: async () => body })
  )
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('useBookingFormLogic', () => {
  const onClose = vi.fn()

  afterEach(() => {
    vi.unstubAllGlobals()
    onClose.mockClear()
  })

  it('submits successfully when the slot is available and the API accepts it', async () => {
    stubFetchSequence([
      { ok: true, body: { availableTimes: ['10:00 AM'] } }, // availability re-check
      { ok: true, body: { success: true, bookingId: 'bk_1' } }, // book-session
    ])
    const { result } = renderHook(() => useBookingFormLogic(onClose))

    let outcome: unknown
    await act(async () => {
      outcome = await result.current.submitForm(validData)
    })

    expect(outcome).toEqual({ success: true, bookingId: 'bk_1' })
    expect(result.current.isSubmitting).toBe(false)
  })

  it('aborts with an error when the slot is no longer available', async () => {
    stubFetchSequence([
      { ok: true, body: { availableTimes: ['11:00 AM'] } }, // 10:00 AM gone
    ])
    const { result } = renderHook(() => useBookingFormLogic(onClose))

    let outcome: unknown
    await act(async () => {
      outcome = await result.current.submitForm(validData)
    })

    expect(outcome).toEqual({
      error: 'Selected time slot is no longer available. Please choose another slot.',
    })
  })

  it('returns the API error when submission is rejected', async () => {
    stubFetchSequence([
      { ok: true, body: { availableTimes: ['10:00 AM'] } },
      { ok: false, body: { error: 'Time already booked' } },
    ])
    const { result } = renderHook(() => useBookingFormLogic(onClose))

    let outcome: unknown
    await act(async () => {
      outcome = await result.current.submitForm(validData)
    })

    expect(outcome).toEqual({ error: 'Time already booked' })
  })

  it('validateStep returns false for an unknown step (no fields)', async () => {
    const { result } = renderHook(() => useBookingFormLogic(onClose))

    let valid: boolean | undefined
    await act(async () => {
      valid = await result.current.validateStep(99)
    })

    expect(valid).toBe(false)
    expect(result.current.stepTransition).toBe(false)
  })

  it('validateStep fails an empty required step', async () => {
    const { result } = renderHook(() => useBookingFormLogic(onClose))

    let valid: boolean | undefined
    await act(async () => {
      valid = await result.current.validateStep(1)
    })

    expect(valid).toBe(false)
  })

  it('validateStep passes step 1 when the required fields are valid', async () => {
    const { result } = renderHook(() => useBookingFormLogic(onClose, validData))

    let valid: boolean | undefined
    await act(async () => {
      valid = await result.current.validateStep(1)
    })

    expect(valid).toBe(true)
    expect(result.current.fieldValidation.name).toBe(true)
  })

  it('exposes onClose and a working resetForm', () => {
    const { result } = renderHook(() => useBookingFormLogic(onClose))
    expect(result.current.onClose).toBe(onClose)
    act(() => {
      result.current.resetForm()
    })
    expect(result.current.formData.name).toBe('')
  })
})
