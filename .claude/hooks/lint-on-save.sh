#!/bin/bash
# Hook triggered after Edit/Write actions to run linter/formatter on the modified file(s).

FILE_TO_LINT=$1

if [ -n "$FILE_TO_LINT" ]; then
  # If a specific file is passed, check if it matches target extensions
  if [[ "$FILE_TO_LINT" =~ \.(ts|tsx|js|jsx)$ ]]; then
    echo "Running lint on save for: $FILE_TO_LINT"
    npx eslint "$FILE_TO_LINT" --quiet
    exit $?
  fi
else
  # If no argument, run on all unstaged/staged modified files
  MODIFIED_FILES=$(git status --porcelain 2>/dev/null | awk '{print $2}' | grep -E "\.(ts|tsx|js|jsx)$")
  if [ -n "$MODIFIED_FILES" ]; then
    echo "Running lint on saved files..."
    npx eslint $MODIFIED_FILES --quiet
    exit $?
  fi
fi

exit 0
