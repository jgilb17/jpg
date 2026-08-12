# Projects registry

One entry per project. Each entry records what the project is, where the code
lives, where it runs, and which context files a new session must read before
touching anything. Facts below were verified against the repos and live
services on 12 August 2026.

## Project 1 — Desert Fire

Desert Fire Extinguisher Co, a fire protection company in Palm Springs / Palm
Desert, California. Owner: Joshua Gilbert. About 19 office staff and 37 field
technicians. The app is an internal caller-lookup and correspondence tool: a
phone rings and whoever answers needs to know in about three seconds who is
calling, what the company promised them, and whether anybody is already
dealing with it.

- Repo: jgilb17/df-correspondence (private). The durable copy of the source
  is ~/df-correspondence on Joshua's Mac; sandbox copies are disposable.
- Live: https://df-correspondence.onrender.com (Render, deploys from GitHub)
- Backend: Supabase project dexarltegljdoczyogtx (us-east-2)
- Context files, in reading order:
  1. PROJECT-INSTRUCTIONS.md — how to work on this project; read first
  2. DESERT-FIRE-PROJECT-MEMORY.md — full project memory. Treat as a strong
     prior, not truth; verify against the live repo and database before acting
  3. CLAUDE.md — session-facing rules, decisions with reasoning, and traps
     that have already cost sessions real time
- Vocabulary matches ServiceTrade exactly: Company, Location, Contact. Never
  site, account or client.

## Project 2 — APEK Rentals

APEK Rentals, a short-term-rental property management company. The app is APEK
Hub, the company's internal operating system: one page, ten tabs, used by
about 13 staff.

- Repo: jgilb17/apek-hub (private), deploys from the master branch
- Live: https://insights.apekrentals.com (Netlify, continuous deploy from
  GitHub; netlify.toml publishes only the built page so internal files are
  not publicly readable)
- Backend: Supabase project hddudyzvjncdwkyvfqej (us-east-2). The browser
  talks to Supabase directly with the anon key and Google OAuth; there is no
  server, no framework, no bundler.
- Context files, in reading order:
  1. CLAUDE.md — project memory: architecture, build pipeline, tech stack,
     and the rules below in full
  2. APEK_HUB_EOS_AUDIT.md — EOS module audit notes and deferred findings
- Trap: index.html is generated build output that happens to be committed.
  Never edit it by hand. Edit build_app.py (or eos_module.js for the EOS
  surface), regenerate, and copy; CLAUDE.md has the exact commands. The
  generator round-trips byte-identical to the committed index.html — keep it
  that way.
