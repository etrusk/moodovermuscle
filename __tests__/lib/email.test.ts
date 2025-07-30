import nodemailer from 'nodemailer'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

jest.mock('nodemailer')

const mockSendMail = jest.fn()

beforeAll(() => {
  // @ts-expect-error mock createTransport return type intentional
  nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail })
})

beforeEach(() => {
  mockSendMail.mockReset()
})

describe('sendCustomerConfirmation', () => {
  it('resolves with success when sendMail succeeds', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'abc123' })
    const result = await sendCustomerConfirmation({
      customerName: 'Alice',
      customerEmail: 'alice@example.com',
      sessionType: 'Yoga',
      sessionDate: '2025-08-01',
      sessionTime: '10:00 AM',
      goals: 'Flexibility',
      experience: 'Beginner',
    })
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'alice@example.com',
      subject: expect.stringContaining('Booking Confirmation'),
      html: expect.any(String),
      text: expect.any(String),
    }))
    expect(result).toEqual({ success: true, messageId: 'abc123' })
  })

  it('returns error when sendMail throws', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP error'))
    const result = await sendCustomerConfirmation({
      customerName: 'Bob',
      customerEmail: 'bob@example.com',
      sessionType: 'Training',
      sessionDate: '2025-08-02',
      sessionTime: '2:00 PM',
    })
    expect(result).toEqual({ success: false, error: 'SMTP error' })
  })
})

describe('sendAdminNotification', () => {
  it('resolves with success when sendMail succeeds', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'def456' })
    const result = await sendAdminNotification({
      customerName: 'Charlie',
      customerEmail: 'charlie@example.com',
      sessionType: 'Pilates',
      sessionDate: '2025-08-03',
      sessionTime: '3:00 PM',
      goals: 'Strength',
      experience: 'Intermediate',
    })
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: process.env.ADMIN_EMAIL,
      subject: expect.stringContaining('New Booking:'),
      html: expect.any(String),
      text: expect.any(String),
    }))
    expect(result).toEqual({ success: true, messageId: 'def456' })
  })

  it('returns error when sendMail throws', async () => {
    mockSendMail.mockRejectedValue(new Error('Auth failed'))
    const result = await sendAdminNotification({
      customerName: 'Dana',
      customerEmail: 'dana@example.com',
      sessionType: 'Cardio',
      sessionDate: '2025-08-04',
      sessionTime: '4:00 PM',
    })
    expect(result).toEqual({ success: false, error: 'Auth failed' })
  })
})