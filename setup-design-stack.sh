#!/usr/bin/env bash
# One-shot local setup for the Claude Code design stack:
#   1. Stitch MCP        (UI mockups        - key from Stitch settings at stitch.withgoogle.com)
#   2. mcp-image         (Gemini image gen  - key from aistudio.google.com/apikey)
#   3. UI UX Pro Max     (design skill      - no key needed)
#   4. 21st.dev Magic    (component library - key from 21st.dev Magic console)
#
# Run this ON YOUR OWN MACHINE (not in a cloud session):
#   bash setup-design-stack.sh
#
# Keys can be pre-set as env vars (STITCH_API_KEY, GEMINI_API_KEY,
# TWENTYFIRST_API_KEY) or entered at the prompts. Any component can be
# skipped by leaving its key blank; re-run the script later to add it.
set -u

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' not found. $2"; exit 1; }; }

need node "Install Node.js 22+ from nodejs.org first."
need claude "Install Claude Code first: npm install -g @anthropic-ai/claude-code"

node_major=$(node -p 'process.versions.node.split(".")[0]')
if [ "$node_major" -lt 22 ]; then
  echo "ERROR: Node 22+ required (found $(node -v))."
  exit 1
fi

say "1/4 UI UX Pro Max skill (global, no key needed)"
npm install -g uipro-cli && uipro init --ai claude --global

say "2/4 Stitch MCP (UI mockups)"
STITCH_API_KEY="${STITCH_API_KEY:-}"
if [ -z "$STITCH_API_KEY" ]; then
  printf 'Stitch API key (from stitch.withgoogle.com > profile > Settings), or Enter to skip: '
  read -r STITCH_API_KEY
fi
if [ -n "$STITCH_API_KEY" ]; then
  claude mcp add stitch --scope user --env STITCH_API_KEY="$STITCH_API_KEY" -- npx -y @_davideast/stitch-mcp proxy
else
  echo "Skipped. (Or run the guided wizard yourself: npx @_davideast/stitch-mcp init)"
fi

say "3/4 mcp-image / Nano Banana Pro (reference imagery)"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
if [ -z "$GEMINI_API_KEY" ]; then
  printf 'Gemini API key (from aistudio.google.com/apikey), or Enter to skip: '
  read -r GEMINI_API_KEY
fi
if [ -n "$GEMINI_API_KEY" ]; then
  img_dir="$HOME/claude-design-images"
  mkdir -p "$img_dir"
  claude mcp add mcp-image --scope user \
    --env GEMINI_API_KEY="$GEMINI_API_KEY" \
    --env IMAGE_QUALITY=quality \
    --env IMAGE_OUTPUT_DIR="$img_dir" \
    -- npx -y mcp-image
else
  echo "Skipped."
fi

say "4/4 21st.dev Magic (component library)"
TWENTYFIRST_API_KEY="${TWENTYFIRST_API_KEY:-}"
if [ -z "$TWENTYFIRST_API_KEY" ]; then
  printf '21st.dev Magic API key (from 21st.dev > Magic), or Enter to skip: '
  read -r TWENTYFIRST_API_KEY
fi
if [ -n "$TWENTYFIRST_API_KEY" ]; then
  npx -y @21st-dev/cli@latest install claude --api-key "$TWENTYFIRST_API_KEY"
else
  echo "Skipped."
fi

say "Done. Restart Claude Code, then run /mcp to confirm the servers loaded."
echo "Never commit API keys to git - they live only in your local Claude config."
