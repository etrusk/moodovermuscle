#!/usr/bin/env bash

# scripts/generate-accessibility-report.sh
# Generate HTML accessibility report from the latest Playwright JSON report.

set -euo pipefail

REPORT_DIR="playwright-report"
ACCESSIBILITY_REPORT="accessibility-report.json"

# Check for JSON report
if [ ! -f "$ACCESSIBILITY_REPORT" ]; then
  echo "No accessibility-report.json found. Run accessibility tests first."
  exit 1
fi

echo "Generating HTML accessibility report..."
npx playwright show-report --reporter=html

echo "✅ Accessibility report generated in $REPORT_DIR"