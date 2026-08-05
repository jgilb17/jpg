# jpg

## Design stack

This repo carries a project-level design setup for Claude Code:

- `.claude/skills/ui-ux-pro-max/` - UI UX Pro Max design-intelligence skill (auto-activates on UI/UX work in any session on this repo).
- `.mcp.json` - project MCP config for Stitch, mcp-image (Nano Banana Pro), and 21st.dev Magic. Servers activate when the matching env vars are set: `STITCH_API_KEY`, `GEMINI_API_KEY`, `TWENTYFIRST_API_KEY`.
- `setup-design-stack.sh` - one-command setup for a local machine (installs everything user-globally so it works outside this repo too). Run: `bash setup-design-stack.sh`

API keys are never committed - they live in env vars or local Claude config only.
