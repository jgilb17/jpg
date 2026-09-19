# jpg

Project registry lives in `PROJECTS.md`.

## Safety guard

A PreToolUse hook blocks with exit code 2 the reads and writes that must
never happen unattended: reading any `.env`, editing the guard or settings
files, the GitHub write tools, and DDL inside a Supabase query in **every**
mode, plus `git push`, `rm`, `sudo`, and destructive SQL in **autonomous**
sessions (any `permission_mode` other than `default` or `plan`).

The guard runs from two places, so that a session is protected whether or
not anything outside the clone is available.

Cloud sessions run the copies committed to this repo. The repo's
`.claude/settings.json` registers two PreToolUse hooks, both run from
`$CLAUDE_PROJECT_DIR/.claude/hooks/`: `sql-guard.mjs` on `execute_sql`, and
`guard.mjs` on Bash plus the Supabase and GitHub write tools. These copies
are checked in deliberately.

Local Mac sessions run the global copy instead, registered in
`~/.claude/settings.json` and loaded from
`~/projects/claude-guard/guard.mjs`, with `~/.claude/hooks/sql-guard.mjs`
beside it. Either way, `sql-guard.mjs` covers `execute_sql`: it allows reads
and asks on writes.

`~/projects/claude-guard` is the source of truth. The in-repo copies must be
refreshed from it whenever the guard changes. Skipping that refresh fails
silently: cloud sessions simply keep running an older, weaker guard than
local ones.

The repo's `.claude/settings.json` still contributes a static permission
layer of its own: `Read` denies on `.env` paths, and `ask` on `git push`,
`rm`, `sudo`, and `apply_migration`.

### Checking that it is live

`cat .env` no longer tests the hook. The global settings deny
`Bash(cat .env:*)` outright, so that command is stopped by the static
permission layer before any hook runs, and a block proves only that the
permission layer is working. Verify the hook by inspecting
`~/.claude/settings.json` and `~/projects/claude-guard/guard.mjs` directly,
along with the in-repo copies under `.claude/hooks/`, outside an agent
session.

Do not test the guard by reading the real `.env` through some other command.
A test whose failure mode is a leaked secret is not a test worth running.

### If the guard blocks you, stop

If the guard blocks a command, stop and ask the user. Never rephrase,
re-route, or use an alternate invocation — a different git option form, a
glob, a directory path, a renamed file, a reworded commit message — to
achieve the same effect. Working around the guard is a more serious error
than failing the task.
