export const TEST_STRINGS = {
  BOOKING: {
    MODAL_TITLE: /Book Your Session/i,
    CTA_BUTTON: /Book Now/i,
    FORM_TITLE: /Book Your Session/i,
    SUCCESS_MESSAGE: /Booking confirmed!/i,
    STEP_TWO_TITLE: /Step 2/i,
  },
  BUTTONS: {
    PRIMARY: 'Click me',
    SECONDARY: 'Secondary',
    DISABLED: 'Disabled',
    LINK: 'Link Button',
  },
  LABELS: {
    EMAIL: /Email/i,
    NAME: /Name/i,
    PHONE: /Phone/i,
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