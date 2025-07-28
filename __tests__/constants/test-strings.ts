export const TEST_STRINGS = {
  BOOKING: {
    FORM_TITLE: /let's get to know you/i,
    SUCCESS_MESSAGE: 'Booking successful!',
  },
  LABELS: {
    NAME: /name/i,
    EMAIL: /email/i,
    PHONE: /phone/i,
  },
  BUTTONS: {
    PRIMARY: 'Click me',
    DISABLED: 'Disabled',
    LINK: 'Link',
    CONTINUE: /continue/i,
    SUBMIT: /submit/i,
  },
} as const

describe('Test Strings', () => {
  it('should have the correct test strings', () => {
    expect(TEST_STRINGS.BUTTONS.PRIMARY).toBe('Click me')
  })
})
