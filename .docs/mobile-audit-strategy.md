# Mobile Experience Audit Strategy

## 1. Vision & Goals

**Vision**: Deliver a seamless, intuitive, and high-performing mobile booking experience for MoodOverMuscle that feels native to the device, builds trust with users, and drives conversions.

**Goals**:

- **Usability**: Ensure the booking flow is easy to navigate and complete on a variety of mobile devices.
- **Performance**: Achieve "Good" Core Web Vitals scores for all mobile users to minimize friction and abandonment.
- **Accessibility**: Guarantee WCAG 2.1 AA compliance for all mobile interactions, making the site usable for everyone.
- **Confidence**: Provide a polished and professional mobile presence that reflects the quality of the services offered.

## 2. Mobile Audit Checklist

This checklist provides a systematic framework for evaluating the mobile user experience. It is organized by key areas of focus and will be used to identify, prioritize, and track optimization tasks.

### 2.1. Layout & Responsiveness

- [ ] **Viewport Configuration**: Verify `<meta name="viewport" content="width=device-width, initial-scale=1">` is present and correctly configured.
- [ ] **Fluid Grid**: Confirm that the layout adapts smoothly to different screen sizes without horizontal scrolling.
- [ ] **Breakpoint Testing**: Test at standard mobile breakpoints (e.g., 320px, 375px, 425px) and tablet sizes (768px).
- [ ] **Orientation Change**: Ensure the layout adjusts correctly when switching between portrait and landscape modes.
- [ ] **Content Readability**: Check that text is legible, with appropriate font sizes (minimum 16px for body) and line heights.

### 2.2. Navigation & Interaction

- [ ] **Touch Target Size**: All interactive elements (buttons, links, form inputs) must have a minimum touch target of 44x44 CSS pixels.
- [ ] **Spacing**: Ensure adequate spacing between touch targets to prevent accidental taps.
- [ ] **Mobile Navigation**: Test the mobile navigation menu (e.g., hamburger menu) for clarity, ease of use, and accessibility.
- [ ] **Gestures**: Verify that standard mobile gestures (e.g., swipe, pinch-to-zoom on images) work as expected and don't interfere with usability.
- [ ] **Hover States**: Ensure that information revealed on hover is also accessible via a tap or other non-hover interaction.

### 2.3. Booking Form & Calendar Usability

- [ ] **Form Input Fields**: Confirm that all form fields are easy to tap and that the appropriate keyboard (e.g., `tel`, `email`, `numeric`) appears.
- [ ] **Labels & Placeholders**: Ensure labels are always visible and not obscured by the on-screen keyboard.
- [ ] **Multi-Step Wizard**:
  - [ ] Progress indicator is clear and visible on mobile.
  - [ ] "Continue" and "Back" buttons are easily accessible.
  - [ ] Form state is preserved when navigating between steps.
- [ ] **Calendar Component**:
  - [ ] The calendar is fully responsive and usable in a small viewport.
  - [ ] Date selection is easy with a finger tap.
  - [ ] Navigation between months is intuitive.
- [ ] **Validation & Error Handling**:
  - [ ] Error messages are clearly visible and associated with the correct field.
  - [ ] The page automatically scrolls to the first error to alert the user.

### 2.4. Performance

- [ ] **Core Web Vitals**:
  - [ ] **LCP (Largest Contentful Paint)**: Aim for < 2.5 seconds on a simulated 4G connection.
  - [ ] **FID (First Input Delay)** / **INP (Interaction to Next Paint)**: Aim for < 100ms.
  - [ ] **CLS (Cumulative Layout Shift)**: Aim for < 0.1.
- [ ] **Image Optimization**: Verify that all images are appropriately sized for mobile and served in modern formats (e.g., WebP).
- [ ] **Loading States**:
  - [ ] Skeletons or loaders are used to provide immediate feedback.
  - [ ] The UI remains interactive where possible during data fetching.
  - [ ] `aria-busy="true"` is used on elements that are loading content.
- [ ] **Bundle Size**: Analyze the JavaScript bundle to identify and remove unnecessary code for mobile users.

### 2.5. Accessibility (WCAG 2.1 AA)

- [ ] **Keyboard Accessibility**: Ensure all interactive elements are focusable and operable via a keyboard connected to the mobile device.
- [ ] **Screen Reader Support**: Test the entire booking flow with VoiceOver (iOS) and TalkBack (Android).
  - [ ] All controls are properly labeled (`aria-label`, `aria-labelledby`).
  - [ ] Dynamic content changes are announced to the user (`aria-live`).
  - [ ] Headings and landmarks are used correctly for navigation.
- [ ] **Color Contrast**: Verify that text and UI elements meet the minimum 4.5:1 contrast ratio.
- [ ] **Focus Management**: Ensure focus is managed logically, especially in modals, drawers, and the multi-step form.

## 3. Audit Process

1. **Tooling Setup**: Configure browser developer tools (for device emulation) and physical devices for testing.
2. **Checklist Execution**: Systematically go through each item in the checklist for the key user flows.
3. **Issue Logging**: Document all identified issues with screenshots, steps to reproduce, and severity ratings (Critical, High, Medium, Low).
4. **Prioritization**: Prioritize issues based on their impact on the user experience and conversion funnel.
5. **Implementation Plan**: Create a detailed technical plan for addressing the prioritized issues.

## 4. Testing Methodology

### 4.1. Device &amp; Browser Matrix

Testing will be conducted on a combination of emulated devices and real physical devices to ensure broad coverage.

| Device Category    | Device/OS          | Browser | Viewport Size | Testing Type  | Priority |
| ------------------ | ------------------ | ------- | ------------- | ------------- | -------- |
| **iOS (High)**     | iPhone 14 Pro      | Safari  | 390x844       | Real/Emulated | Critical |
|                    | iPhone SE (2022)   | Safari  | 375x667       | Emulated      | High     |
| **Android (High)** | Google Pixel 7     | Chrome  | 412x915       | Real/Emulated | Critical |
|                    | Samsung Galaxy S22 | Chrome  | 360x780       | Emulated      | High     |
| **Tablet**         | iPad Air           | Safari  | 820x1180      | Emulated      | Medium   |
|                    | Samsung Galaxy Tab | Chrome  | 712x1138      | Emulated      | Medium   |

### 4.2. Key User Scenarios

These scenarios represent the critical paths a user will take on their mobile device.

1.  **Homepage Exploration &amp; CTA**:
    - **Goal**: User lands on the homepage, understands the value proposition, and initiates the booking process.
    - **Steps**:
      1. Land on the homepage.
      2. Scroll through all sections.
      3. Click the main "Book a Free Session" CTA in the hero section.
      4. Verify the booking form opens correctly.

2.  **Complete Booking Flow (Happy Path)**:
    - **Goal**: A new user successfully completes the 3-step booking wizard without errors.
    - **Steps**:
      1. Fill out the "Personal Info" step with valid data.
      2. Select a service in the "Service Selection" step.
      3. Choose a date and time from the calendar.
      4. Submit the form and see the success confirmation.

3.  **Form Validation &amp; Error Recovery**:
    - **Goal**: Test the form's resilience to invalid input and guide the user to correct errors.
    - **Steps**:
      1. Attempt to submit the form with empty required fields.
      2. Enter an invalid email format.
      3. Enter an invalid phone number format.
      4. Verify that clear, inline error messages are displayed for each case.
      5. Correct the errors and successfully submit the form.

4.  **Accessibility &amp; Keyboard Navigation**:
    - **Goal**: Ensure the site is fully usable with assistive technologies.
    - **Steps**:
      1. Navigate the entire site using only the keyboard.
      2. Complete the booking form using a screen reader (VoiceOver/TalkBack).
      3. Check for logical focus order and clear announcements.

5.  **Performance Under Load**:
    - **Goal**: Simulate a user on a slower network to test loading states and perceived performance.
    - **Steps**:
      1. Throttle the network connection to "Slow 4G" in browser dev tools.
      2. Load the homepage and navigate through the booking flow.
      3. Observe loading indicators, layout shifts, and overall responsiveness.

## 5. Performance &amp; Accessibility Criteria

### 5.1. Mobile Performance Targets

These targets are based on Google's Core Web Vitals and are essential for a good user experience. Performance will be measured using Lighthouse and Vercel Speed Insights, simulating a "Slow 4G" network.

| Metric                              | Target           | Priority | Tool                |
| ----------------------------------- | ---------------- | -------- | ------------------- |
| **Largest Contentful Paint (LCP)**  | &lt; 2.5 seconds | Critical | Lighthouse / Vercel |
| **Interaction to Next Paint (INP)** | &lt; 100 ms      | Critical | Vercel              |
| **Cumulative Layout Shift (CLS)**   | &lt; 0.1         | Critical | Lighthouse / Vercel |
| **First Contentful Paint (FCP)**    | &lt; 1.8 seconds | High     | Lighthouse / Vercel |
| **Time to Interactive (TTI)**       | &lt; 3.8 seconds | High     | Lighthouse          |
| **Total Blocking Time (TBT)**       | &lt; 200 ms      | High     | Lighthouse          |

### 5.2. Mobile Accessibility Standards (WCAG 2.1 AA)

Accessibility is non-negotiable. All mobile components and interactions must comply with WCAG 2.1 Level AA.

| Guideline          | Requirement                                                   | Priority | Testing Tool           |
| ------------------ | ------------------------------------------------------------- | -------- | ---------------------- |
| **Perceivable**    | Provide text alternatives for non-text content.               | Critical | Axe / Screen Reader    |
|                    | Ensure content is adaptable without losing information.       | Critical | Axe / Manual           |
|                    | Use sufficient color contrast (4.5:1 for normal text).        | Critical | Axe / Contrast Checker |
| **Operable**       | All functionality is available from a keyboard.               | Critical | Manual (Keyboard)      |
|                    | Provide users enough time to read and use content.            | High     | Manual                 |
|                    | Do not use content that causes seizures (no flashing).        | Critical | Manual                 |
|                    | Help users navigate and find content (landmarks, headings).   | Critical | Axe / Screen Reader    |
| **Understandable** | Make text content readable and understandable.                | Critical | Manual                 |
|                    | Make content appear and operate in predictable ways.          | High     | Manual                 |
|                    | Help users avoid and correct mistakes (clear error messages). | Critical | Manual                 |
| **Robust**         | Maximize compatibility with current and future user agents.   | High     | Axe / W3C Validator    |

## 6. Implementation Plan for Code Mode

This plan provides a step-by-step guide for the `Code` mode to execute the mobile experience audit and implement the necessary optimizations.

### Phase 1: Automated Audit &amp; Tooling Setup

**Goal**: Run automated checks to gather baseline data and identify low-hanging fruit.

1.  **Run Lighthouse Audit**:
    - **Action**: Execute Lighthouse in Chrome DevTools against the homepage and the booking form URL.
    - **Configuration**: Use the "Mobile" device preset and run the "Performance" and "Accessibility" audits.
    - **Output**: Save the JSON reports to a new `.reports` directory (e.g., `.reports/lighthouse-mobile-initial.json`).

2.  **Run Playwright Accessibility Tests**:
    - **Action**: Create a new Playwright test file `e2e/mobile-accessibility.spec.ts`.
    - **Content**: Write a test that navigates to the homepage and the booking form at a mobile viewport size (e.g., 390x844) and uses `jest-axe` to check for accessibility violations.
    - **Command**: `pnpm test:e2e e2e/mobile-accessibility.spec.ts`

### Phase 2: Manual Audit &amp; Issue Identification

**Goal**: Manually test the key user scenarios on emulated and real devices to identify UX issues that automated tools miss.

1.  **Execute Manual Test Scenarios**:
    - **Action**: Follow the "Key User Scenarios" defined in the Testing Methodology section.
    - **Process**: Use Chrome DevTools for device emulation and a physical iPhone/Android device if available.
    - **Documentation**: For each issue found, create a detailed entry in a new markdown file: `.docs/mobile-audit-findings.md`. Each entry should include:
      - A description of the issue.
      - The device/viewport where it occurred.
      - Steps to reproduce.
      - A screenshot.
      - A suggested fix.

### Phase 3: Implementation &amp; Optimization

**Goal**: Address the issues identified in the audit, starting with the highest priority items.

1.  **Increase Touch Target Sizes**:
    - **File**: [`components/ui/button.tsx`](components/ui/button.tsx) and other relevant UI components.
    - **Action**: Ensure all buttons and interactive elements have a `min-height` and `min-width` of `44px` using Tailwind CSS classes (e.g., `min-h-11 min-w-11`).
    - **Verification**: Manually inspect the elements in DevTools to confirm their size.

2.  **Optimize the Calendar Component**:
    - **File**: [`components/ui/calendar.tsx`](components/ui/calendar.tsx)
    - **Action**:
      - Review the component's styles and structure to ensure it is fully responsive.
      - Use media queries in CSS to adjust padding, font sizes, and layout for smaller screens.
      - Ensure the date cells are large enough to be easily tapped.
    - **Verification**: Test the calendar on a 320px wide viewport.

3.  **Improve Form Usability**:
    - **File**: [`components/booking-form.tsx`](components/booking-form.tsx)
    - **Action**:
      - For each `<Input />` component, set the `type` attribute appropriately (e.g., `type="email"`, `type="tel"`).
      - Ensure that `FormLabel` components are always visible and correctly associated with their inputs using `htmlFor`.
    - **Verification**: Test the form on a mobile device to confirm the correct keyboards appear.

4.  **Implement Responsive Images**:
    - **Files**: [`components/sections/gallery-section.tsx`](components/sections/gallery-section.tsx) and other sections with images.
    - **Action**:
      - Use the Next.js `<Image />` component for all images to leverage automatic image optimization.
      - Ensure the `sizes` attribute is correctly configured to serve appropriately sized images based on the viewport.
    - **Verification**: Use the Network tab in DevTools to check the size of the images being loaded on mobile viewports.

### Phase 4: Validation &amp; Reporting

**Goal**: Verify that all fixes have been implemented correctly and that the mobile experience has improved.

1.  **Re-run Audits**:
    - **Action**: Execute the Lighthouse and Playwright accessibility audits again.
    - **Comparison**: Compare the new reports with the initial ones to measure improvement.

2.  **Final Manual Review**:
    - **Action**: Conduct a final pass of the manual test scenarios to ensure all reported issues have been resolved.

3.  **Update Documentation**:
    - **File**: [`docs/mobile-audit-strategy.md`](.docs/mobile-audit-strategy.md)
    - **Action**: Update the document with a summary of the findings and the improvements made.
