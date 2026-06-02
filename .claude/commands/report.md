---
name: report
description: Consolidates the current state into the .agents/progress.md file.
---

Consolidate the current workspace and execution state into the `.agents/progress.md` file:

1. **Information Gathering**:
   - Retrieve the current implementation plan from the active plan file (e.g. `C:\Users\sk143\.gemini\antigravity\brain\<conversation-id>\implementation_plan.md` or from system memory).
   - Get the task list and check the status of completed versus pending tasks from the active task list file (e.g. `C:\Users\sk143\.gemini\antigravity\brain\<conversation-id>\task.md` or from system memory).
   - Collect any custom skills or rules currently defined in the workspace (e.g. rules under `.claude/rules/` and skills under `.claude/skills/`).

2. **Generate progress.md**:
   - Write the consolidated information to a file named `.agents/progress.md` inside the project workspace (ensure the `.agents/` directory is created in the root: `c:\Users\sk143\Downloads\fitness app\.agents\progress.md`).
   - Format:
     - Header: `# Project Progress & State`
     - Section: `## Current Implementation Plan` (Direct import or summary of the implementation plan)
     - Section: `## Tasks Checklist` (Table or list of Completed vs. Pending tasks)
     - Section: `## Custom Rules & Skills` (Detailed description of the active rules, custom commands, and custom skills defined in the project)

3. **Verify**:
   - Ensure the file is written to `.agents/progress.md` and contains the accurate status.
