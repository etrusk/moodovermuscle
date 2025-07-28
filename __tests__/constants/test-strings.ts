export const TEST_STRINGS = {
  BOOKING: {
    MODAL_TITLE: /Book Your FREE Session/i,
    CTA_BUTTON: /Continue/i,
    FORM_TITLE: /Book Your FREE Session/i,
    SUCCESS_MESSAGE: /Booking confirmed!/i,
    STEP_TWO_TITLE: /What Would You Like to Try/i,
  },
  BUTTONS: {
    PRIMARY: 'Click me',
    SECONDARY: 'Secondary',
    DISABLED: 'Disabled',
    LINK: 'Link Button',
    CONTINUE: /Continue/i,
    SUBMIT: /Book My FREE Session/i,
  },
  LABELS: {
    EMAIL: /Email Address/i,
    NAME: /What should we call you/i,
    PHONE: /Phone Number/i,
  },
  VALIDATION: {
    REQUIRED: /This field is required/i,
    EMAIL: /Please enter a valid email/i,
  },
  GENERIC: {
    LOADING: /Loading/i,
    ERROR: /Error/i,
    SUCCESS: /Success/i,
  },
} as const
