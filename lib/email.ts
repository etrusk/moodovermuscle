import nodemailer from 'nodemailer'

if (process.env.NODE_ENV === 'test') {
  const requiredEnvVars = [
    'EMAIL_FROM',
    'ADMIN_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ]
  requiredEnvVars.forEach(name => {
    if (!process.env[name]) {
      throw new Error(`Missing environment variable for email service: ${name}`)
    }
  })
}

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig)

// Email templates
import {
  createCustomerConfirmationHtmlTemplate,
  createCustomerConfirmationTextTemplate,
  createAdminNotificationHtmlTemplate,
  createAdminNotificationTextTemplate,
} from './email-templates'

export const createCustomerConfirmationEmail = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): { subject: string; html: string; text: string } => {
  const subject = 'Booking Confirmation - Mood Over Muscle'
  const html = createCustomerConfirmationHtmlTemplate(booking)
  const text = createCustomerConfirmationTextTemplate(booking)

  return { subject, html, text }
}

export const createAdminNotificationEmail = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): { subject: string; html: string; text: string } => {
  const subject = `New Booking: ${booking.customerName} - ${booking.sessionType}`
  const html = createAdminNotificationHtmlTemplate(booking)
  const text = createAdminNotificationTextTemplate(booking)

  return { subject, html, text }
}

// Email sending functions
export const sendCustomerConfirmation = async (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { subject, html, text } = createCustomerConfirmationEmail(booking)

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME ?? 'Mood Over Muscle'}" <${process.env.EMAIL_FROM}>`,
      to: booking.customerEmail,
      subject,
      text,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Customer confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending customer confirmation email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const sendAdminNotification = async (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { subject, html, text } = createAdminNotificationEmail(booking)

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME ?? 'Mood Over Muscle'}" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      text,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Admin notification email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Test email connection
export const testEmailConnection = async (): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await transporter.verify()
    console.log('Email server connection verified')
    return { success: true }
  } catch (error) {
    console.error('Email server connection failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
