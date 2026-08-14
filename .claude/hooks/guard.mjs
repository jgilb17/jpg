#!/usr/bin/env node
/* PreToolUse guard, two-tier DENY, project-level (14 August 2026).

   Committed in each repo's .claude/ so it loads from the fresh git clone at the
   start of every cloud session. No environment cache, no canonical fetch, no
   seed, no degraded marker in the path to go stale: the file you see committed
   is the file that runs. Blocks with exit code 2, the documented unconditional
   PreToolUse stop; "ask" and a soft "deny" were both shown not to block an
   autonomous session.

   TIER ONE, blocked in EVERY mode: reading a .env, touching the guard files,
   the GitHub write tools, and DDL inside a Supabase query.

   TIER TWO, blocked only in AUTONOMOUS modes (permission_mode is not "default"
   and not "plan"): git push, rm, sudo, and bash-level drop/truncate/delete. An
   attended default-mode session defers these to the normal settings prompt so
   you can approve them yourself. */

let raw = ''
for await (const chunk of process.stdin) raw += chunk
let input
try { input = JSON.parse(raw) } catch { process.exit(0) }

const deny = reason => {
  process.stderr.write('BLOCKED by guard: ' + reason + '\n')
  process.exit(2)
}

const tool = String(input.tool_name || '')
const mode = String(input.permission_mode || 'default')
const AUTONOMOUS = mode !== 'default' && mode !== 'plan'

/* TIER ONE — every mode. */
const GH_WRITE = new Set([
  'mcp__github__push_files',
  'mcp__github__create_or_update_file',
  'mcp__github__delete_file',
  'mcp__github__merge_pull_request'
])
if (GH_WRITE.has(tool)) deny('a GitHub write tool commits over the API with no git command in sight; blocked in all modes, run it yourself if you mean it')

if (tool === 'Bash') {
  const cmd = String(input.tool_input?.command ?? '')
  if (/\.env\b/i.test(cmd)) deny('command touches a .env file; credentials never enter the transcript')
  if (/\.claude\/settings|guard\.mjs|obsidian-recall-safe\.sh|obsidian-session-end\.sh/i.test(cmd)) deny('command touches guardrail or authority-bearing hook files')
  /* TIER TWO — autonomous only. */
  if (AUTONOMOUS) {
    if (/\bgit\s+push\b/i.test(cmd)) deny('git push in an autonomous session is blocked; a deploy-branch push must be attended')
    if (/\brm\b/i.test(cmd)) deny('rm in an autonomous session is blocked')
    if (/\bsudo\b/i.test(cmd)) deny('sudo in an autonomous session is blocked')
    if (/\b(drop|truncate|delete)\b/i.test(cmd)) deny('drop, truncate or delete in an autonomous session is blocked')
  }
}

if (tool === 'mcp__Supabase__execute_sql') {
  const q = String(input.tool_input?.query ?? '')
  if (/\b(drop|truncate|delete|alter|grant)\b/i.test(q)) deny('SQL contains drop, truncate, delete, alter or grant')
}

process.exit(0)
