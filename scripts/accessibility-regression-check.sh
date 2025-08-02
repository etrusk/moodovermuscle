#!/usr/bin/env bash

# scripts/accessibility-regression-check.sh
# Compare current accessibility metrics against baseline to detect regressions.

set -euo pipefail

BASELINE_FILE=".accessibility-baseline.json"
REPORT_FILE="accessibility-report.json"

# Generate new report
npm run test:accessibility:all

# Ensure baseline exists
if [ ! -f "$BASELINE_FILE" ]; then
  echo "Baseline not found. Creating baseline at $BASELINE_FILE"
  cp "$REPORT_FILE" "$BASELINE_FILE"
  exit 0
fi

# Compare reports
diff <(jq -S . "$BASELINE_FILE") <(jq -S . "$REPORT_FILE") > /dev/null || {
  echo "🚫 Accessibility regressions detected. Please review the differences."
  exit 1
}

echo "✅ No accessibility regressions detected."