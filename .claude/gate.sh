#!/usr/bin/env bash
# The global Stop hook runs this when the working tree changed. A failure blocks turn-end once,
# and again after any change. Put the project's full quality gate here, nothing else.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# eslint caps only app, components, lib and middleware.ts. The lockfile is generated.
skip=pnpm-lock.yaml
while IFS= read -rd '' f; do
  [ "$f" = "$skip" ] && continue
  if [ -f "$f" ] && grep -Iq . "$f" && [ "$(wc -l < "$f")" -gt 1000 ]; then
    echo "over 1000 lines: $f"
    bad=1
  fi
done < <(git ls-files -z --cached --others --exclude-standard)
[ -z "${bad:-}" ] || exit 1
pnpm run lint
pnpm run type-check
pnpm run test:critical
