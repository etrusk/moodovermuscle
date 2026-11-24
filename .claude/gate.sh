#!/usr/bin/env bash
# The global Stop hook runs this when the working tree changed. A failure blocks turn-end once,
# and again after any change. Put the project's full quality gate here, nothing else.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
pnpm run lint
pnpm run type-check
pnpm run test:critical
