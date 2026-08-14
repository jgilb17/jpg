# jpg

Project registry lives in `PROJECTS.md`.

## Safety guard

A PreToolUse hook — `.claude/hooks/guard.mjs`, wired in `.claude/settings.json` and loaded fresh from this repo's clone at the start of every session — blocks with exit code 2 the reads and writes that must never happen unattended: reading any `.env`, editing the guard or settings files, the GitHub write tools, and DDL inside a Supabase query in **every** mode, plus `git push`, `rm`, `sudo`, and destructive SQL in **autonomous** sessions (any `permission_mode` other than `default` or `plan`).

To check it is live, run `cat .env` in a Bash call: if the guard is loaded you'll see `BLOCKED by guard:` on stderr and the command is stopped; if the command runs normally, the hook is not loading.
