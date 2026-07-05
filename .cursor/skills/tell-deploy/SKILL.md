---
name: tell-deploy
description: Deploys Tell for demo viewers on Vercel or Docker (Render/Railway). Use when working on vercel.json, Dockerfile, render.yaml, railway.toml, docs/DEPLOY.md, or production env vars.
---

# Tell deployment

## Paths

| Path | Best for |
|---|---|
| Vercel (`apps/web/vercel.json`) | Fast public URL; UI + offline fixture |
| Docker (`Dockerfile`, `render.yaml`, `railway.toml`) | Live Playwright URL capture |

## Pre-deploy checklist

1. Push to public GitHub
2. Set root directory correctly (`tell/apps/web` if monorepo nested)
3. Add env vars in dashboard — never commit secrets
4. Set `TELL_DISABLE_REPO_SETUP=1` in production
5. Verify offline fallback loads when capture unavailable

## Env vars

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Richer taste/voice (optional) |
| `CURSOR_API_KEY` | Cursor-SDK redesign drafts (optional) |
| `TELL_DISABLE_REPO_SETUP` | Required in prod |

## Render constraints

- Bind to `0.0.0.0:$PORT`
- Ephemeral filesystem — no persistent local writes
- Linux paths are case-sensitive

## Demo checklist

- Public URL loads Tell Report
- Fixture/offline report works without keys
- MCP instructions in README for local Cursor demo
- Record backup demo video

## Related

- Rule: `.cursor/rules/tell-deploy.mdc`
- Docs: `docs/DEPLOY.md`
