paths:
- "**/*"
---

# Global Rules

Ensure all agent actions, commands, and file updates comply with these mandatory global rules:

1. **Comet Browser**: Always use the Comet Browser for all browser tasks or external visual validation.
2. **Terminal Access**: Complete, unrestricted access is granted to execute terminal commands and modify files without requiring step-by-step user approval.
3. **Execution Guard**: Before executing any code changes, always draft and confirm the proposed changes in an `implementation_plan.md` artifact. The model must receive a "proceed" or "yes" from the user before executing.
4. **Token Limits & Rate Limiting Alert**: Track token usage. A simulated notification bar alert must warn the user if token consumption hits 90%. If it reaches 90%, it must automatically execute Rule 6 (running the `/report` command).
5. **Command `/summary`**: Reads all conversation chat logs from the app logs and outputs a detailed `summary.md` file in the project directory.
6. **Command `/report`**: Consolidates the current implementation plan, list of completed vs. pending tasks, and custom rules/skills into `.agents/progress.md`.
7. **Token Renewal Information**: Show token renewal time in the Antigravity system indicators.
8. **Command `/claude`**: Replicates the entire `.claude/` configuration folder (including all nested subfolders, `.md` files, and `.sh` files), the `CLAUDE.MD` file, and the `.gemini.md` file from this project to the current working directory. After replication, the agent must ask the user for current directory details, project requirements, and feature enhancements, revise and rewrite the configurations accordingly, and ensure `.gitignore` contains all ignore rules for local environment, summaries, and agent progress.
9. **Command `/graphify`**: Automatically checks if the `graphify` repository is cloned and installed in the project root (`graphify/`). If not, it clones `https://github.com/safishamsi/graphify.git`, installs it locally via `pip install -e .` with Gemini dependencies (`pip install "graphifyy[gemini]"`), updates `.gitignore`, registers the Antigravity skill, and then executes the graph-building pipeline for the target directory.


