# jpg

Project registry lives in `PROJECTS.md`.

## Safety guard

A PreToolUse hook blocks with exit code 2 the reads and writes that must
never happen unattended: reading any `.env`, editing the guard or settings
files, the GitHub write tools, and DDL inside a Supabase query in **every**
mode, plus `git push`, `rm`, `sudo`, and destructive SQL in **autonomous**
sessions (any `permission_mode` other than `default` or `plan`).

The guard is registered globally in `~/.claude/settings.json` and loads from
`~/projects/claude-guard/guard.mjs`. It is not part of this repo. This clone
has no `.claude/hooks/` directory, and the repo's own `.claude/settings.json`
carries an empty `hooks` block, so nothing here registers the guard and
nothing here needs to. A second global hook,
`~/.claude/hooks/sql-guard.mjs`, covers `execute_sql`: it allows reads and
asks on writes.

The repo's `.claude/settings.json` still contributes a static permission
layer of its own: `Read` denies on `.env` paths, and `ask` on `git push`,
`rm`, `sudo`, and `apply_migration`.

### Checking that it is live

`cat .env` no longer tests the hook. The global settings deny
`Bash(cat .env:*)` outright, so that command is stopped by the static
permission layer before any hook runs, and a block proves only that the
permission layer is working. Verify the hook by inspecting
`~/.claude/settings.json` and `~/projects/claude-guard/guard.mjs` directly,
outside an agent session.

Do not test the guard by reading the real `.env` through some other command.
A test whose failure mode is a leaked secret is not a test worth running.

### If the guard blocks you, stop

If the guard blocks a command, stop and ask the user. Never rephrase,
re-route, or use an alternate invocation — a different git option form, a
glob, a directory path, a renamed file, a reworded commit message — to
achieve the same effect. Working around the guard is a more serious error
than failing the task.
