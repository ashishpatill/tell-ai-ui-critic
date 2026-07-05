---
name: tell-github-setup
description: Implements Tell GitHub repo setup flow — clone, install, detect dev command, spawn localhost, auto-capture. Use when working on repo-runner.ts, setup-guard.ts, /api/setup routes, or Priya's "Set up & run" journey.
---

# Tell GitHub setup

## Scope

- `apps/web/src/lib/repo-runner.ts`
- `apps/web/src/lib/setup-guard.ts`
- `apps/web/src/app/api/setup/start|status|stop/route.ts`

## User journey

Priya pastes `github.com/owner/repo` → Tell clones, reads README + `package.json`, installs deps, starts dev server on a free port, waits for reachable URL, then captures localhost.

## Security

- Local dev only unless explicitly guarded
- Production/deploy must set `TELL_DISABLE_REPO_SETUP=1`
- Executes arbitrary install/dev scripts from cloned repos — never expose publicly

## UI requirements

- Block duplicate clicks while job is active
- Hide stale capture preview during setup/capture
- Show job state progression and logs in plain language
- On failure: show detected commands and offer manual URL paste (`needs-manual`)

## Job states

`cloning` → `installing` → `detecting` → `starting` → `waiting` → `ready` | `needs-manual` | `error`

## DoD

- Successful clone → install → reachable localhost → auto-capture
- Failure paths are understandable without reading server logs
- Setup disabled when guard env var is set
