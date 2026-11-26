// @vitest-environment node
import { vi, describe, it, expect } from 'vitest'

vi.unmock('nodemailer')

describe('booking email through the real nodemailer', () => {
  it('composes and sends the customer confirmation', async () => {
    vi.stubEnv('EMAIL_FROM_NAME', 'Studio Name')
    const nodemailer = (await import('nodemailer')).default
    const streamTransporter = nodemailer.createTransport({ streamTransport: true, buffer: true })
    const sendMail = vi.spyOn(streamTransporter, 'sendMail')
    const createTransport = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue(streamTransporter as unknown as ReturnType<typeof nodemailer.createTransport>)

    const { sendCustomerConfirmation } = await import('@/lib/email')
    const result = await sendCustomerConfirmation({
      customerName: 'Jane Citizen',
      customerEmail: 'jane@example.com',
      sessionType: 'Mums & Bubs',
      sessionDate: '2026-12-01',
      sessionTime: '09:00',
    })

    expect(result).toEqual({ success: true, messageId: expect.any(String) })
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 10_000 })
    )
    expect(sendMail).toHaveBeenCalledTimes(1)
    const info = await sendMail.mock.results[0]?.value
    const raw = info.message.toString()
    expect(raw).toContain('Subject: Booking Confirmation - MoodOverMuscle')
    expect(raw).toContain('To: jane@example.com')
    expect(raw).toContain(`From: Studio Name <${process.env.EMAIL_FROM}>`)
    expect(raw).toContain('Content-Type: multipart/alternative')
  })
})
