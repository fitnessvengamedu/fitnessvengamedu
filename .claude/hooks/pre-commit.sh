#!/bin/bash
# Before EVERY commit: type check → lint → test
# If anything fails, commit is BLOCKED.

# Ensure git repository is initialized
if [ ! -d ".git" ]; then
  echo "Skipping git pre-commit checks: Not a git repository."
  exit 0
fi

echo "Running pre-commit hooks..."

# 1. Type check
echo "Type checking..."
npx tsc --noEmit || { echo "Type checking failed!"; exit 2; }

# 2. Lint modified files
echo "Linting..."
STAGED_FILES=$(git diff --cached --name-only | grep -E "\.(ts|tsx)$")
if [ -n "$STAGED_FILES" ]; then
  npx eslint $STAGED_FILES --quiet || { echo "Linting failed!"; exit 2; }
else
  echo "No staged TS/TSX files to lint."
fi

# 3. Run test suite
echo "Testing..."
npm test -- --silent || { echo "Tests failed!"; exit 2; }

echo "All checks passed!"
exit 0
