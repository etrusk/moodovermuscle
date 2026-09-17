import {
  sendCustomerConfirmation,
  sendAdminNotification,
} from '../../../../lib/email'
import type { Booking } from '../../../../lib/generated/prisma/client'

// Nodemailer's timeouts are per-phase and its socket timer resets on every
// server response, so a slow-but-responsive host can outlast vercel.json's
// maxDuration of 30s. That would 504 a booking already written to the database,
// and the customer would see a network error and resubmit into a 409 on their
// own slot. One overall deadline keeps the 201 going out.
const NOTIFICATION_DEADLINE_MS = 8_000

type EmailOutcome = PromiseSettledResult<
  Awaited<ReturnType<typeof sendCustomerConfirmation>>
>

function withDeadline<T>(work: Promise<T>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), NOTIFICATION_DEADLINE_MS)
  })
  return Promise.race([work, deadline]).finally(() => clearTimeout(timer))
}

function succeeded(
  outcome: EmailOutcome,
  rejectionLabel: string,
  failureLabel: string
): boolean {
  if (outcome.status === 'rejected') {
    console.error(rejectionLabel, outcome.reason)
    return false
  }
  if (!outcome.value.success) {
    console.error(failureLabel, outcome.value.error)
    return false
  }
  return true
}

export async function sendBookingNotifications(
  booking: Booking
): Promise<boolean> {
  const { name, email, service, date, time, goals, experience } = booking

  const emailPayload = {
    customerName: name,
    customerEmail: email,
    sessionType: service,
    sessionDate: date.toLocaleDateString('en-AU'),
    sessionTime: time,
    goals: goals ?? '',
    experience: experience ?? '',
  }

  const outcomes = await withDeadline(
    Promise.allSettled([
      sendCustomerConfirmation(emailPayload),
      sendAdminNotification(emailPayload),
    ])
  )

  if (!outcomes) {
    console.error(
      'Booking notifications exceeded the send deadline (ms):',
      NOTIFICATION_DEADLINE_MS
    )
    return false
  }

  const [customer, admin] = outcomes

  const customerSent = succeeded(
    customer,
    'Error in sendCustomerConfirmation:',
    'Failed to send customer confirmation email:'
  )
  const adminSent = succeeded(
    admin,
    'Error in sendAdminNotification:',
    'Failed to send admin notification email:'
  )

  return customerSent && adminSent
}
