---
name: claude
description: Copies the entire .claude configuration folder, CLAUDE.MD file, and GEMINI.MD file from the source project directory to the current working directory.
---

Copy the entire `.claude/` directory, `CLAUDE.MD` file, and `GEMINI.MD` file from the source template directory to the current project directory:

1. **Source Paths**:
   - Source directory: `c:\Users\sk143\Downloads\fitness app\.claude`
   - Source files:
     - `c:\Users\sk143\Downloads\fitness app\CLAUDE.MD`
     - `c:\Users\sk143\Downloads\fitness app\GEMINI.MD`

2. **Target Paths**:
   - Target directory: `./.claude`
   - Target files:
     - `./CLAUDE.MD`
     - `./GEMINI.MD`

3. **Replication Process**:
   - Copy the `.claude` folder and all of its nested files (including rules, commands, hooks, agents, and skills) to the target directory `./.claude/`.
   - Copy `CLAUDE.MD` and `GEMINI.MD` to the current working directory.
   - On Windows shell (PowerShell), this can be performed using:
     ```powershell
     Copy-Item -Path "c:\Users\sk143\Downloads\fitness app\.claude" -Destination "./" -Recurse -Force
     Copy-Item -Path "c:\Users\sk143\Downloads\fitness app\CLAUDE.MD" -Destination "./" -Force
     Copy-Item -Path "c:\Users\sk143\Downloads\fitness app\GEMINI.MD" -Destination "./" -Force
     ```
   - Alternatively, use the agent's file system tools (like `write_to_file` or run shell commands) to copy all items recursively, overwriting any pre-existing files in the target directory.

4. **User Revision Prompt**:
   - Immediately after replication, prompt the user for:
     - The current project's specific directory details, stack choice, features, and requirements.
     - Feature implementation priorities and enhancements.
   - Based on the user's responses, revise and rewrite the newly copied `.claude` configuration files (such as agents, rules, and commands) to align precisely with their needs.

5. **Configure Gitignore**:
   - Ensure the current directory has a `.gitignore` file.
   - Add/verify rules to ignore local runtime environment configs, summary reports, and progress files:
     - `.env` and `.env.*`
     - `.agents/`
     - `summary.md`
     - `node_modules/`
     - `.next/`

6. **Verify**:
   - Ensure the folders are copied correctly, configs are updated, and `.gitignore` matches required ignore rules.
