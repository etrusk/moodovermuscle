#!/usr/bin/env bash
set -euo pipefail

echo "Validating accessibility compliance..."
lhci assert --config=lighthouserc.accessibility.js

if [ $? -eq 0 ]; then
  echo "✅ Accessibility compliance passed."
  exit 0
else
  echo "🚫 Accessibility compliance failed."
  exit 1
fi