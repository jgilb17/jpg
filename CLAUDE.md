# Project Knowledge

## Structure Template Reference

This project follows the documentation pattern from [relaxedstays621/structure-template](https://github.com/relaxedstays621/structure-template).

### What It Is
A canonical, model-agnostic documentation scaffold for projects that use LLMs as development agents. The `structure/` folder is the human-facing layer — copy it into any repo and customize.

### Folder Layers

| Folder | Purpose |
|---|---|
| `Purpose/` | LLM boot layer — roles, model assignments, delegation contracts, handoff templates |
| `User_Guide/` | Getting started, setup procedures |
| `Development/` | Coding principles, structure conventions, roadmap, release strategy |
| `System Guide/` | Architecture, system boundaries, stack |
| `Deployment/` | Deploy procedures, runbooks |

### Key Concepts

**Two roles only:**
- `Development Agent` — implements and changes
- `Audit Agent` — reviews and verifies
- Roles and models are separate; any model can hold any role

**Control plane** (`Purpose/control-plane.md`): routing table for model-to-role assignment.
Precedence: explicit user assignment > handoff request > active assignment table > model profile default > role defaults.

**Delegation contract**: structured task packets with Role, Model, Task, Scope, Out of scope, Success criteria, Verification, and Handoff artifact. Designed to work without requiring prior conversation state.

**Boot protocol** (`Purpose/boot-protocol.md`): 6-step load order so an LLM orients itself on any project quickly.

### Core Rules
1. `structure/` stays human-facing and model-agnostic — useful even if model, runtime, or deployment target changes
2. No duplication — one authority per concept (config, schema, integration boundaries, routing rules, state definitions)
3. Boilerplate must be generic — no named individuals, company assumptions, or machine-specific paths
4. Evidence-first auditing — findings cite concrete files/lines/logs before summary; no fixes without reassignment
5. Orthogonal design — keep concerns independent so changes stay local

### Commit Convention
Subsystem-prefixed commits: `[subsystem] message` (e.g. `[runtime] fix audit labels`)
Non-functional changes marked separately from behavior changes (NFC discipline).

### Quick Start (for new repos)
1. Copy `structure/` folder into repo
2. Read `structure/HOW_TO_USE.md`
3. Replace placeholders in `Purpose/README.md`
4. Fill in shortest setup path in `User_Guide/getting-started.md`
5. Add durable system shape in `System Guide/architecture.md`
6. Add project-specific files only after defaults are clear
