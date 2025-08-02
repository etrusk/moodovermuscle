#!/usr/bin/env bash

# scripts/lighthouse-accessibility-gates.sh
# Run Lighthouse CI accessibility audits with 95% threshold and zero-tolerance critical violations.

set -euo pipefail

# Build and start server on port 3001
echo "Building application..."
npm run build

echo "Starting server on port 3001..."
PORT=3001 npm run start &

SERVER_PID=$!
# Give server time to start
sleep 5

echo "Running Lighthouse CI for accessibility..."
# Run LHCI with accessibility-only config
lhci autorun \
  --config=lighthouserc.accessibility.js

EXIT_CODE=$?

# Cleanup server
echo "Stopping server..."
kill $SERVER_PID

if [ $EXIT_CODE -ne 0 ]; then
  echo "🚫 Accessibility quality gates failed."
  exit $EXIT_CODE
else
  echo "✅ Accessibility quality gates passed."
  exit 0
fi