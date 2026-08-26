#!/usr/bin/env node
/* PreToolUse guard, two-tier DENY, project-level. Canonical reconciled build.

   Committed in each repo's .claude/ so it loads from the fresh git clone at the
   start of every cloud session. No environment cache, no canonical fetch, no
   seed, no degraded marker in the path to go stale: the file you see committed
   is the file that runs. Blocks with exit code 2, the documented unconditional
   PreToolUse stop; "ask" and a soft "deny" were both shown not to block an
   autonomous session.

   TIER ONE, blocked in EVERY mode: reading a .env, touching the guard files,
   the GitHub write tools, and DDL (drop/truncate/delete/alter/grant) inside a
   Supabase query.

   TIER TWO, blocked only in AUTONOMOUS modes (permission_mode is not "default"
   and not "plan"):
     - git push, EXCEPT an explicit `origin claude/<branch>` feature-branch push;
       a deploy-branch (main/master/HEAD) or force push stays blocked, and a bare
       or ambiguous push stays blocked.
     - rm, sudo, and destructive bash (drop/truncate table, delete from, rm -rf).
     - write SQL (insert/update/upsert/merge) through a Supabase query.
   An attended default-mode session defers these to the normal settings prompt so
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
  if (/(?<![A-Za-z0-9_])\.env\b/i.test(cmd)) deny('command touches a .env file; credentials never enter the transcript')
  if (/\.claude\/settings|guard\.mjs|obsidian-recall-safe\.sh|obsidian-session-end\.sh/i.test(cmd)) deny('command touches guardrail or authority-bearing hook files')
  /* TIER TWO — autonomous only; attended sessions defer to the settings prompt. */
  if (AUTONOMOUS) {
    /* PUSH: allow only an explicit `origin claude/<branch>` feature-branch push.
       The command must name origin and a claude/ branch and then END, so a bare
       `git push` stays blocked as ambiguous and `claude/x:master` fails because a
       colon is not in the branch character class. master, main and HEAD are
       refused wherever they appear, and force stays blocked. Cost of a false
       block is naming the branch; cost of a false allow is an unattended deploy. */
    if (/(^|[\s;&|(])git(\s+-{1,2}[^\s]+(\s+[^\s-][^\s]*)?)*\s+push\b/i.test(cmd)) {
      const SAFE = /\borigin\s+claude\/[A-Za-z0-9._\/-]+\s*$/
      const UNSAFE = /\b(master|main|HEAD)\b|(^|\s)(-f|--force|--force-with-lease)\b/i
      if (!SAFE.test(cmd.trim()) || UNSAFE.test(cmd))
        deny('a push in an autonomous session is limited to an explicit claude/* feature branch; a deploy-branch or force push must be attended')
    }
    if (/\brm\b/i.test(cmd)) deny('rm in an autonomous session is blocked')
    if (/\bsudo\b/i.test(cmd)) deny('sudo in an autonomous session is blocked')
    if (/\b(drop|truncate)\s+table\b|\bdelete\s+from\b|\brm\s+-rf\b/i.test(cmd)) deny('a destructive SQL or filesystem command in an autonomous session is blocked')
  }
}

if (/Supabase__(execute_sql|apply_migration)$/i.test(tool)) {
  const q = String(input.tool_input?.query ?? input.tool_input?.sql ?? '')
  if (/\b(drop|truncate|delete|alter|grant)\b/i.test(q)) deny('SQL contains drop, truncate, delete, alter or grant')
  if (AUTONOMOUS && /\b(insert|update|upsert|merge)\b/i.test(q)) deny('write SQL in an autonomous session must be attended')
}

process.exit(0)
