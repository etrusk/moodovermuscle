import { http, HttpResponse } from 'msw'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'

interface BookingRequestBody {
  email: string
}

export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody

    if (body.email === 'fail@example.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Internal Server Error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new HttpResponse(
      JSON.stringify({ message: TEST_STRINGS.BOOKING.SUCCESS_MESSAGE }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }),
  // Simulate network failure for specific test email
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody
    if (body.email === 'network@example.com') {
      throw new Error('Network error: failed to connect')
    }
    // Fallback to success if not network scenario
    return new HttpResponse(
      JSON.stringify({ message: TEST_STRINGS.BOOKING.SUCCESS_MESSAGE }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }),
]