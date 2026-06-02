# Graph Report - .  (2026-05-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 31 nodes · 21 edges · 12 communities (5 shown, 7 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `Stitch Apex Elite` - 5 edges
2. `permissions` - 3 edges
3. `hooks` - 3 edges
4. `Code Reviewer` - 3 edges
5. `/claude` - 2 edges
6. `Frontend Architecture Rules` - 2 edges
7. `Global Rules` - 2 edges
8. `allow` - 1 edges
9. `deny` - 1 edges
10. `PreToolUse` - 1 edges

## Surprising Connections (you probably didn't know these)
- `/claude` --references--> `Stitch Apex Elite`  [EXTRACTED]
  .claude/commands/claude.md → CLAUDE.MD
- `Doc Writer` --references--> `Stitch Apex Elite`  [EXTRACTED]
  .claude/agents/doc-writer.md → CLAUDE.MD
- `/report` --implements--> `Global Rules`  [INFERRED]
  .claude/commands/report.md → .claude/rules/global.md
- `Frontend Architecture Rules` --conceptually_related_to--> `Frontend Design Skill`  [INFERRED]
  .claude/rules/frontend.md → .claude/skills/frontend-design/SKILL.md
- `Code Reviewer` --references--> `API Development Rules`  [EXTRACTED]
  .claude/agents/code-reviewer.md → .claude/rules/api.md

## Communities (12 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (5): autoMemoryEnabled, hooks, PostToolUse, PreToolUse, model

### Community 1 - "Community 1"
Cohesion: 0.40
Nodes (5): API Development Rules, Code Reviewer, Database Development Rules, Frontend Design Skill, Frontend Architecture Rules

### Community 2 - "Community 2"
Cohesion: 0.40
Nodes (5): Stitch Apex Elite, Next.js 14, Supabase, Zustand, Doc Writer

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (3): permissions, allow, deny

### Community 4 - "Community 4"
Cohesion: 0.67
Nodes (3): /claude, Global Rules, /report

## Knowledge Gaps
- **16 isolated node(s):** `allow`, `deny`, `PreToolUse`, `PostToolUse`, `model` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Stitch Apex Elite` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `permissions` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `allow`, `deny`, `PreToolUse` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._