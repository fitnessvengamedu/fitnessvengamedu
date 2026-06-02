---
name: summary
description: Reads all the chats in the current conversation and generates a detailed summary.md file in the project directory.
---

Read all chats and generate a comprehensive `summary.md` in the project directory:

1. **Locate Chat Logs**:
   - The conversation logs are stored under the app data directory: `C:\Users\sk143\.gemini\antigravity\brain\<conversation-id>\.system_generated\logs\overview.txt`.
   
2. **Analyze Chats**:
   - Read the entire conversation history.
   - Extract:
     - The user's main objective and core requests.
     - The technical implementation details and choices made.
     - Completed tasks, modifications made to files, and verified functionality.
     - Any outstanding issues or pending questions.

3. **Generate summary.md**:
   - Write a detailed Markdown file named `summary.md` in the root of the project workspace (`c:\Users\sk143\Downloads\fitness app`).
   - Format:
     - Header: `# Conversation Summary`
     - Section: `## Project Objective` (User's primary goal)
     - Section: `## Technical Stack`
     - Section: `## Completed Work & Changes` (List of modified/created files and description of modifications)
     - Section: `## Custom Rules & Configurations` (Rules/skills implemented)
     - Section: `## Next Steps` (Any pending work or suggestions)

4. **Verify**:
   - Ensure the file is written to the root project directory and is properly formatted Markdown.
