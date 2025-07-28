export const TEST_STRINGS = {
  BOOKING: {
    FORM_TITLE: /book your free session/i,
    SUCCESS_MESSAGE: 'Booking successful!',
  },
  LABELS: {
    NAME: /what should we call you/i,
    EMAIL: /email address/i,
    PHONE: /phone number/i,
  },
  BUTTONS: {
    PRIMARY: 'Click me',
    DISABLED: 'Disabled',
    LINK: 'Link',
    CONTINUE: /continue/i,
    SUBMIT: /book my free session/i,
  },
} as const

describe('Test Strings', () => {
  it('should have the correct test strings', () => {
    expect(TEST_STRINGS.BUTTONS.PRIMARY).toBe('Click me')
  })
})
