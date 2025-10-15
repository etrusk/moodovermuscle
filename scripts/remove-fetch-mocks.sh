#!/bin/bash

# Script to remove direct fetch mocking from test files
# These tests should rely on MSW handlers instead

FILES=(
  "__tests__/components/admin/bookings/bookings-actions.test.tsx"
  "__tests__/components/admin/bookings/bookings-display.test.tsx"
  "__tests__/components/admin/dashboard.test.tsx"
  "__tests__/integration/admin-components/admin-workflow.integration.test.tsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Remove mockFetch declaration and global.fetch assignment
  sed -i '/^\/\/ Mock fetch globally$/d' "$file"
  sed -i '/^const mockFetch = vi\.fn()$/d' "$file"
  sed -i '/^global\.fetch = mockFetch$/d' "$file"
  
  # Remove mockFetch setup in beforeEach
  sed -i '/mockFetch\.mockResolvedValue/d' "$file"
  sed -i '/mockFetch\.mockRejectedValue/d' "$file"
  
  # Remove mockFetch assertions
  sed -i '/expect(mockFetch)/d' "$file"
  
  echo "✓ Cleaned $file"
done

echo ""
echo "All files processed. Tests will now use MSW handlers instead of direct fetch mocking."