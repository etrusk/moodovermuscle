// Email template functions extracted to separate file
/* eslint-disable max-lines-per-function */
export const createCustomerConfirmationHtmlTemplate = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
    .booking-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d; }
    h1 { color: #2c3e50; margin: 0; }
    h2 { color: #34495e; }
    .highlight { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Mood Over Muscle</h1>
    <p>Your booking has been confirmed!</p>
  </div>
  
  <div class="content">
    <h2>Hi ${booking.customerName},</h2>
    
    <p>Thank you for booking a session with Mood Over Muscle! We're excited to help you on your fitness journey.</p>
    
    <div class="booking-details">
      <h3>Booking Details:</h3>
      <p><strong>Session Type:</strong> ${booking.sessionType}</p>
      <p><strong>Date:</strong> ${booking.sessionDate}</p>
      <p><strong>Time:</strong> ${booking.sessionTime}</p>
      <p><strong>Customer:</strong> ${booking.customerName}</p>
      <p><strong>Email:</strong> ${booking.customerEmail}</p>
      ${booking.goals ? `<p><strong>Goals:</strong> ${booking.goals}</p>` : ''}
      ${booking.experience ? `<p><strong>Experience Level:</strong> ${booking.experience}</p>` : ''}
    </div>
    
    <p><strong>What's Next?</strong></p>
    <ul>
      <li>Emily will contact you within 24 hours to confirm details</li>
      <li>Please arrive 5-10 minutes early for your session</li>
      <li>Bring comfortable workout clothes and a water bottle</li>
      <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
    </ul>
    
    <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
    
    <p>Looking forward to seeing you soon!</p>
    
    <p>Best regards,<br>
    <strong>Emily & the Mood Over Muscle Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated confirmation email. Please do not reply to this email.</p>
    <p>For questions or changes, please contact us directly.</p>
  </div>
</body>
</html>
`

export const createCustomerConfirmationTextTemplate = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): string => `
Mood Over Muscle - Booking Confirmation

Hi ${booking.customerName},

Thank you for booking a session with Mood Over Muscle! We're excited to help you on your fitness journey.

Booking Details:
- Session Type: ${booking.sessionType}
- Date: ${booking.sessionDate}
- Time: ${booking.sessionTime}
- Customer: ${booking.customerName}
- Email: ${booking.customerEmail}
${booking.goals ? `- Goals: ${booking.goals}` : ''}
${booking.experience ? `- Experience Level: ${booking.experience}` : ''}

What's Next?
- Emily will contact you within 24 hours to confirm details
- Please arrive 5-10 minutes early for your session
- Bring comfortable workout clothes and a water bottle
- If you need to reschedule, please contact us at least 24 hours in advance

If you have any questions or need to make changes to your booking, please don't hesitate to contact us.

Looking forward to seeing you soon!

Best regards,
Emily & the Mood Over Muscle Team

---
This is an automated confirmation email. Please do not reply to this email.
For questions or changes, please contact us directly.
`

/* eslint-disable max-lines-per-function */
export const createAdminNotificationHtmlTemplate = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
    .booking-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .action-required { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    h1 { margin: 0; }
    h2 { color: #34495e; }
    .highlight { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 New Booking Alert!</h1>
    <p>You have a new session booking</p>
  </div>
  
  <div class="content">
    <h2>Hi Emily,</h2>
    
    <p>You have received a new booking through your website!</p>
    
    <div class="booking-details">
      <h3>Customer Details:</h3>
      <p><strong>Name:</strong> ${booking.customerName}</p>
      <p><strong>Email:</strong> ${booking.customerEmail}</p>
      <p><strong>Session Type:</strong> ${booking.sessionType}</p>
      <p><strong>Preferred Date:</strong> ${booking.sessionDate}</p>
      <p><strong>Preferred Time:</strong> ${booking.sessionTime}</p>
      ${booking.goals ? `<p><strong>Goals:</strong> ${booking.goals}</p>` : ''}
      ${booking.experience ? `<p><strong>Experience Level:</strong> ${booking.experience}</p>` : ''}
    </div>
    
    <div class="action-required">
      <h3>⚡ Action Required:</h3>
      <ul>
        <li>Contact ${booking.customerName} within 24 hours to confirm the session</li>
        <li>Verify availability for ${booking.sessionDate} at ${booking.sessionTime}</li>
        <li>Discuss any specific requirements based on their goals and experience</li>
        <li>Send location details and preparation instructions</li>
      </ul>
    </div>
    
    <p><strong>Customer Contact:</strong> ${booking.customerEmail}</p>
    
    <p>The customer has already received an automated confirmation email letting them know you'll be in touch within 24 hours.</p>
  </div>
</body>
</html>
`

export const createAdminNotificationTextTemplate = (booking: {
  customerName: string
  customerEmail: string
  sessionType: string
  sessionDate: string
  sessionTime: string
  goals?: string
  experience?: string
}): string => `
New Booking Alert - Mood Over Muscle

Hi Emily,

You have received a new booking through your website!

Customer Details:
- Name: ${booking.customerName}
- Email: ${booking.customerEmail}
- Session Type: ${booking.sessionType}
- Preferred Date: ${booking.sessionDate}
- Preferred Time: ${booking.sessionTime}
${booking.goals ? `- Goals: ${booking.goals}` : ''}
${booking.experience ? `- Experience Level: ${booking.experience}` : ''}

Action Required:
- Contact ${booking.customerName} within 24 hours to confirm the session
- Verify availability for ${booking.sessionDate} at ${booking.sessionTime}
- Discuss any specific requirements based on their goals and experience
- Send location details and preparation instructions

Customer Contact: ${booking.customerEmail}

The customer has already received an automated confirmation email letting them know you'll be in touch within 24 hours.
`
