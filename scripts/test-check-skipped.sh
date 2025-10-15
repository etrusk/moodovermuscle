#!/bin/bash
# Test script to verify skipped test detection

echo "Testing skipped test detection script..."
echo ""

# Run the check (this should fail because we have skipped tests)
node scripts/check-skipped-tests.js

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 1 ]; then
  echo ""
  echo "✅ TEST PASSED: Script correctly detected skipped tests and exited with code 1"
  exit 0
else
  echo ""
  echo "❌ TEST FAILED: Script did not detect skipped tests (exit code: $EXIT_CODE)"
  exit 1
fi