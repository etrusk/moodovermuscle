import {
  sendCustomerConfirmation,
  sendAdminNotification,
} from '../../../../lib/email'
import type { Booking } from '../../../../lib/generated/prisma'

export function sendBookingNotifications(booking: Booking): void {
  const { name, email, service, date, time, goals, experience } = booking

  // Send emails without awaiting them to avoid blocking the response
  sendCustomerConfirmation({
    customerName: name,
    customerEmail: email,
    sessionType: service,
    sessionDate: date.toLocaleDateString('en-AU'),
    sessionTime: time,
    goals: goals ?? '',
    experience: experience ?? '',
  })
    .then((res) => {
      if (!res.success) {
        console.error(
          'Failed to send customer confirmation email:',
          res.error
        )
      }
    })
    .catch((err) => {
      console.error('Error in sendCustomerConfirmation:', err)
    })

  sendAdminNotification({
    customerName: name,
    customerEmail: email,
    sessionType: service,
    sessionDate: date.toLocaleDateString('en-AU'),
    sessionTime: time,
    goals: goals ?? '',
    experience: experience ?? '',
  })
    .then((res) => {
      if (!res.success) {
        console.error('Failed to send admin notification email:', res.error)
      }
    })
    .catch((err) => {
      console.error('Error in sendAdminNotification:', err)
    })
}