// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.unmock('nodemailer')

describe('booking email through the real nodemailer', () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('falls back to the default SMTP host and port when they are set but blank', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_PORT', '')
    const nodemailer = (await import('nodemailer')).default
    const createTransport = vi.spyOn(nodemailer, 'createTransport')

    await import('@/lib/email')

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.gmail.com', port: 587 })
    )
  })

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
