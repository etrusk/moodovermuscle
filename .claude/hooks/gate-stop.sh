#!/usr/bin/env bash
set -euo pipefail
# Stop hook — v7 quality gate. Blocks turn-end until the gate is green.
#
# Runs the gate ONLY when the working tree has uncommitted changes, so pure discussion/read
# turns don't trigger it. (An always-firing gate gets switched off, which kills the one
# mechanism that matters.) Claude Code overrides the block after 8 consecutive blocks.
#
# Wire to the Stop event in .claude/settings.json — see settings-v7.json.

# Fast turn-end gate: lint + types + the critical test suite — the project's own blocking bar
# (same as husky pre-commit/pre-push, quality:gates, and the CI test-critical job). The heavy
# checks (security:scan, security:semgrep, build:verify) run in husky + CI, not here — too slow
# for an every-turn gate. test:critical is mock-based (jsdom, no DB/Neon, no session env), so it
# behaves the same in this non-interactive hook shell as in a terminal.
run_gate() {
  pnpm run lint && pnpm run type-check && pnpm run test:critical
}

# Skip when the working tree is clean — nothing to verify. Uses `git status --porcelain` (not
# `git diff`) so NEW untracked files — a fresh module + its test — also count; `git diff` alone
# misses them and would skip the gate on exactly the greenfield-TDD turns that most need it.
# (Respects .gitignore, so build artifacts don't trigger it.)
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

if run_gate; then
  exit 0
else
  # Block via exit 2, not a JSON decision on stdout: Claude Code honors {"decision":"block"} only
  # when stdout is *only* that JSON, but run_gate's lint/test logs fill stdout (and exceed the
  # 10K-char cap), so the JSON is dropped and the turn proceeds. Exit 2 feeds stderr back to Claude
  # and reliably prevents the stop.
  echo "Quality gate failed — fix the root cause and re-run. Do not weaken tests, skip them, or suppress errors." >&2
  exit 2
fi
