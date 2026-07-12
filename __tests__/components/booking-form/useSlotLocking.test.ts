import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { UseFormReturn } from 'react-hook-form'

import { useSlotLocking } from '@/components/booking-form/steps/scheduling/useSlotLocking'
import type { BookingFormData } from '@/components/booking-form/bookingFormLogic'

function makeForm() {
  return { setValue: vi.fn() } as unknown as UseFormReturn<BookingFormData>
}

const date = new Date('2026-08-01T00:00:00.000Z')

function stubAvailability(times: string[], ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, json: async () => ({ availableTimes: times }) })
  )
}

describe('useSlotLocking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('starts with no conflict', () => {
    stubAvailability(['10:00 AM'])
    const { result } = renderHook(() => useSlotLocking(date, '10:00 AM', makeForm()))

    expect(result.current.lockConflict).toBe(false)
    expect(result.current.lockWarning).toBeNull()
  })

  it('clears the previously selected time when the date changes', () => {
    stubAvailability(['10:00 AM'])
    const form = makeForm()
    renderHook(() => useSlotLocking(date, '10:00 AM', form))

    expect(form.setValue).toHaveBeenCalledWith('time', '')
  })

  it('raises a conflict when the polled slot is no longer available', async () => {
    stubAvailability(['11:00 AM']) // selected 10:00 AM is gone
    const form = makeForm()
    const { result } = renderHook(() => useSlotLocking(date, '10:00 AM', form))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })

    expect(result.current.lockConflict).toBe(true)
    expect(result.current.lockWarning).toMatch(/just been booked by someone else/i)
  })

  it('does not raise a conflict while the slot remains available', async () => {
    stubAvailability(['10:00 AM'])
    const form = makeForm()
    const { result } = renderHook(() => useSlotLocking(date, '10:00 AM', form))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })

    expect(result.current.lockConflict).toBe(false)
  })

  it('swallows polling errors without raising a conflict', async () => {
    stubAvailability([], false) // res.ok === false -> throws internally
    const form = makeForm()
    const { result } = renderHook(() => useSlotLocking(date, '10:00 AM', form))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })

    expect(result.current.lockConflict).toBe(false)
    expect(result.current.lockWarning).toBeNull()
  })

  it('does not poll when date or time is missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderHook(() => useSlotLocking(undefined, '10:00 AM', makeForm()))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
