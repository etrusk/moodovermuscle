#!/usr/bin/env node
/**
 * Script to fix MSW test configuration in calendar test files
 * Removes direct fetch mocking and fake timers that interfere with MSW
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  '__tests__/components/admin/calendar/calendar-interactions.test.tsx',
  '__tests__/components/admin/calendar/calendar-accessibility.test.tsx',
];

const oldImports = `import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { mockBookings, createMockResponse } from './calendar-test-setup'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch`;

const newImports = `import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/setup/server'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { mockBookings } from './calendar-test-setup'`;

const oldBeforeEach = `  beforeEach(() => {
    user = userEvent.setup({ delay: null })
    vi.clearAllMocks()
    
    mockSuccessResponse = createMockResponse({ bookings: mockBookings })
    mockFetch.mockResolvedValue(mockSuccessResponse)

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-08-10T12:00:00Z'))
  })`;

const newBeforeEach = `  beforeEach(() => {
    user = userEvent.setup({ delay: null })
    vi.clearAllMocks()

    const mockDate = new Date('2025-08-10T12:00:00Z')
    vi.setSystemTime(mockDate)
  })`;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace imports
  content = content.replace(oldImports, newImports);
  
  // Replace beforeEach
  content = content.replace(oldBeforeEach, newBeforeEach);
  
  // Remove mockSuccessResponse variable declaration
  content = content.replace(/\n  let mockSuccessResponse: any\n/, '\n');
  
  // Replace error handlers with MSW
  content = content.replace(
    /mockFetch\.mockRejectedValue\(new Error\('([^']+)'\)\)/g,
    `server.use(
        http.get('/api/admin/bookings', () => {
          return HttpResponse.json(
            { error: '$1' },
            { status: 500 }
          )
        })
      )`
  );
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✨ MSW test fixes complete!');