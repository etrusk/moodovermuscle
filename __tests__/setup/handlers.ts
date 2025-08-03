import { http, HttpResponse } from 'msw'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'

interface BookingRequestBody {
  email: string
}

export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    let body: BookingRequestBody
    try {
      body = (await request.json()) as BookingRequestBody
    } catch (e) {
      const error = e as Error
      // Handle cases where the request body is not valid JSON
      return HttpResponse.json({ message: error.message }, { status: 400 })
    }

    if (body.email === 'fail@example.com') {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      )
    }

    if (body.email === 'network@example.com') {
      return HttpResponse.error()
    }

    if (body.email === 'validation@example.com') {
      return HttpResponse.json(
        {
          message: 'Invalid data',
          errors: { email: ['Invalid email format'] },
        },
        { status: 400 }
      )
    }

    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 250))
    return HttpResponse.json(
      { message: TEST_STRINGS.BOOKING.SUCCESS_MESSAGE },
      { status: 201 }
    )
  }),
  http.get('/api/availability', () => {
    return HttpResponse.json({
      availableTimes: ['09:00', '10:00'],
      bookedTimes: [],
    })
  }),
]