# Projects

Registry of projects connected to this workspace. Each entry names the project, points at its repository, and says how to attach it to a session.

## Project 1: Desert Fire

- Name: Desert Fire
- Repository: [`jgilb17/df-correspondence`](https://github.com/jgilb17/df-correspondence)
- What it is: Internal caller-lookup and correspondence tool for Desert Fire Extinguisher Co., a fire protection company in Palm Springs (~19 office staff, 37 technicians). Built so that when the phone rings, staff know in three seconds who is calling and what was promised to them.

### Connecting in a session

1. Attach the repo with `add_repo` (owner `jgilb17`, repo `df-correspondence`), then clone it:

   ```
   git clone --depth 1 https://github.com/jgilb17/df-correspondence /workspace/df-correspondence
   ```

2. Before doing any work in the project, read these files from the repo, in this order:
   - `PROJECT-INSTRUCTIONS.md` — how to work on this project (working style, guardrails).
   - `DESERT-FIRE-PROJECT-MEMORY.md` — architecture, business rules, known traps, current state. Treat as a strong prior, not truth; verify against the actual code and production before acting.
   - `CLAUDE.md` — project-level agent instructions.

### Standing rules (from the project's own instructions)

- Never modify anything in `src/` — the sync scripts work.
- Never write secrets, keys, tokens, or passwords into files or chat.
- Additive database changes (create table, add column, add index) are fine without asking; destructive changes (drop table, alter column type, delete rows) require explicit approval first.
- Never invent a dollar figure; print the count and say why there is no value.
- Vocabulary matches ServiceTrade exactly: Company, Location, Contact — never site, account, or client.
- Prove it, don't describe it: load real data, show the rendered page, run the query.
