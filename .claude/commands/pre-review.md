---
name: pre-review
description: Runs all compilation, linting, and testing suites to prepare changes for review.
---

Perform pre-review code verification:

1. **Static Typechecking**:
   - Run the TypeScript compiler check: `npx tsc --noEmit`.
   - Verify that there are no type errors or compiler configuration warnings.

2. **Linting and Code Style**:
   - Run the linter: `npm run lint`.
   - Ensure there are no code style, syntax, or quality warnings.
   - Run code formatting if style issues are present: `npx prettier --write .`.

3. **Running Tests**:
   - Run the test suite: `npm test` or `npm run test`.
   - Verify that all unit, integration, and E2E tests pass ("all green").

4. **Diff Verification**:
   - Review the modified files list: `git status` or checking the staging area.
   - Run `git diff` to double check the code changes for stray debugging code, console logs, or commented-out sections.
