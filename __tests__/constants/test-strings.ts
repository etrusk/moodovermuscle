export const TEST_STRINGS = {
  BOOKING: {
    FORM_TITLE: /let's get to know you/i,
  },
  LABELS: {
    NAME: /name/i,
    EMAIL: /email/i,
  },
  BUTTONS: {
    PRIMARY: 'Click me',
    DISABLED: 'Disabled',
    LINK: 'Link',
  },
} as const

describe('Test Strings', () => {
  it('should have the correct test strings', () => {
    expect(TEST_STRINGS.BUTTONS.PRIMARY).toBe('Click me')
  })
})
