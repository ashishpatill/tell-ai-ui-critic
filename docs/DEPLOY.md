# Deploy Tell

**Recommended for the hackathon:** deploy **both** Vercel + Render and wire them together for the full flow on one judge-facing URL.

| Layer | Platform | Role |
|---|---|---|
| **UI (share this URL)** | Vercel | Fast Next.js app, seam, voice, redesign |
| **Capture engine** | Render (Docker) | Playwright + Chromium for live URL diagnosis |
| **Cursor MCP** | Local | Clone repo — stdio server in Cursor |

Set `TELL_CAPTURE_API_URL` on Vercel to your Render service URL. The Vercel `/api/diagnose` route proxies capture to Render automatically.

---

## Hybrid deploy (Vercel + Render) — do this

### Step 1 — Push latest code

```bash
cd tell
git add Dockerfile render.yaml apps/web/vercel.json docs/DEPLOY.md apps/web/src/lib/run-diagnose*.ts apps/web/src/app/api/diagnose/route.ts
git commit -m "Add hybrid Vercel UI + Render capture deployment"
git push origin master
```

### Step 2 — Deploy Render capture backend (Docker)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → connect `ashishpatill/tell-ai-ui-critic`.
2. Or **New Web Service** → Docker → repo root → `Dockerfile`.
3. **Plan:** Starter (1 GB+) — Playwright needs memory.
4. Note the URL: `https://tell-xxxx.onrender.com` (or `tell-capture.onrender.com`).
5. Add env vars: `GEMINI_API_KEY`, `CURSOR_API_KEY` (optional).

**Smoke test:** `curl -X POST https://YOUR-RENDER-URL.onrender.com/api/diagnose -H 'content-type: application/json' -d '{"url":"https://example.com"}'`

### Step 3 — Deploy Vercel UI

1. [vercel.com/new](https://vercel.com/new) → import same repo.
2. **Root Directory:** `apps/web`
3. Environment variables:

```
GEMINI_API_KEY=...
CURSOR_API_KEY=...              # optional
TELL_DISABLE_REPO_SETUP=1
TELL_CAPTURE_API_URL=https://YOUR-RENDER-URL.onrender.com
TELL_CAPTURE_TIMEOUT_MS=90000
```

4. Deploy. **Share the Vercel URL with judges** — live capture works via Render proxy.

### Step 4 — Demo flow (60 seconds)

1. Open **Vercel URL** → paste any public site → **Capture** (Render runs Playwright).
2. Drag the **before/after seam**.
3. Art-direct → **Draft diff** → copy to Cursor.
4. Optional: show **MCP** locally with `tell_diagnose`.

---

## Single-platform options

Two deployment paths if you only want one host.

| | Option A — Vercel only | Option B — Docker only (Render) |
|---|---|---|
| **Time to ship** | ~10 minutes | ~30–45 minutes |
| **Cost** | Free tier | Free / starter tier |
| **Demo UI** | Yes | Yes |
| **Offline fixture fallback** | Yes | Yes |
| **Live URL capture (Playwright)** | No (serverless limits) | Yes |
| **GitHub “Set up & run”** | Disabled (security) | Disabled (security) |
| **Cursor MCP** | Local only (clone repo) | Local only (clone repo) |

Repo configs added for you:

- `apps/web/vercel.json` — Vercel monorepo build
- `Dockerfile` + `.dockerignore` — full server with Chromium
- `render.yaml` — one-click Render deploy
- `railway.toml` — Railway Docker deploy

---

## Before you deploy

### 1. Push to GitHub

Judges need a stable URL. Vercel and Render both deploy from Git.

```bash
cd tell
git add .
git commit -m "Add Vercel and Docker deployment configs"
git push origin main
```

If the repo root is `Raise Hackathon/` and `tell/` is a subfolder, note that path — you'll set it as the **Root Directory** in Vercel/Render.

### 2. Prepare secrets (never commit these)

Copy keys from your local `.env` into the hosting dashboard only:

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Recommended | Richer voice/taste parsing |
| `CURSOR_API_KEY` | Optional | Cursor-SDK redesign drafts |
| `CURSOR_MODEL` | Optional | Defaults to `composer-2.5` |
| `CURSOR_AGENT_TIMEOUT_MS` | Optional | Defaults to `75000` |

**Do not commit `.env` or `.env.local`.** They are gitignored.

### 3. What works where

- **Vercel (Option A):** Full UI, seam, voice direction, redesign, offline demo report. Live capture falls back to `fixtures/reports/tell-report.json`.
- **Docker (Option B):** Everything above **plus** live capture of any public HTTP URL.
- **Both:** GitHub repo setup is off (`TELL_DISABLE_REPO_SETUP=1`) — it runs arbitrary code and is local-dev only.
- **Cursor MCP:** Always local. Share the Vercel/Docker URL for the web demo; point judges at README → “Use it in Cursor” for MCP.

---

## Option A — Vercel (recommended first)

Best for: **a public link in under 10 minutes** for hackathon judges.

### Step 1 — Create the project

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. **Import** your repository.
3. Set **Root Directory** to `tell/apps/web` if the repo contains other folders (e.g. `Problem Disection/`). If `tell` *is* the repo root, use `apps/web`.
4. Vercel should detect **Next.js**. The repo ships `apps/web/vercel.json` with monorepo install/build commands.

| Setting | Value |
|---|---|
| Root Directory | `tell/apps/web` (adjust if your path differs) |
| Framework | Next.js |
| Install Command | *(from vercel.json)* `cd ../.. && pnpm install` |
| Build Command | *(from vercel.json)* `cd ../.. && pnpm -F @tell/web build` |
| Output Directory | *(default)* `.next` |

### Step 2 — Environment variables

In **Project → Settings → Environment Variables**, add:

```
GEMINI_API_KEY=your-key
CURSOR_API_KEY=your-key          # optional
TELL_DISABLE_REPO_SETUP=1        # already in vercel.json; safe to set again
```

`TELL_DISABLE_REPO_SETUP=1` blocks the GitHub clone-and-run route on the public internet.

### Step 3 — Deploy

Click **Deploy**. First build takes ~2–4 minutes (pnpm monorepo).

You get: `https://tell-xxxx.vercel.app` (or your custom domain).

### Step 4 — Demo script for judges

1. Open the Vercel URL.
2. The app loads with the committed fixture report — drag the seam, pick a direction, draft a diff.
3. To show **live capture**, paste a **public** URL (e.g. `https://example.com`). If capture fails (expected on Vercel), Tell loads the offline artifact and shows a clear message.
4. For **full live capture**, use Option B or run locally: `pnpm dev` + `pnpm dev:fixture`.

### Vercel troubleshooting

| Issue | Fix |
|---|---|
| Build fails on `pnpm` | Ensure Root Directory is `apps/web` and Node 20+ is selected (Project → Settings → General). |
| `workspace:*` not found | Install/build must run from monorepo root — verify `vercel.json` install command. |
| Capture always shows offline demo | Expected on Vercel. Use Option B or local dev for Playwright. |
| API keys not working | Redeploy after adding env vars (Production environment). |

---

## Option B — Docker on Render or Railway (live capture)

Best for: **live URL capture** in production (Playwright + Chromium on a real server).

### Local smoke test (optional)

From the `tell/` directory:

```bash
docker build -t tell .
docker run --rm -p 3000:3000 \
  -e GEMINI_API_KEY="your-key" \
  -e CURSOR_API_KEY="your-key" \
  tell
```

Open [http://localhost:3000](http://localhost:3000), paste a public URL, hit **Capture**. First capture may take ~30s while Chromium starts.

Requires **~2 GB RAM** for the container.

---

### B1 — Render

1. Go to [render.com](https://render.com) → **New → Blueprint** (or **Web Service**).
2. Connect the GitHub repo.
3. **Blueprint:** Render reads `render.yaml` at repo root — set root to `tell` if needed.
4. **Manual Web Service:**
   - **Root Directory:** `tell`
   - **Runtime:** Docker
   - **Dockerfile path:** `Dockerfile`
   - **Instance type:** at least **Starter** (512 MB may OOM on Playwright; prefer 1 GB+)
5. Add environment variables (same as Vercel table above). `TELL_REPO_ROOT` and `TELL_DISABLE_REPO_SETUP` are set in `render.yaml`.
6. Deploy. Note the URL: `https://tell-xxxx.onrender.com`.

Free tier may spin down after idle — first request after sleep is slow (~30–60s).

---

### B2 — Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**.
2. Select the repo; set **Root Directory** to `tell` if applicable.
3. Railway picks up `railway.toml` and `Dockerfile`.
4. **Variables** tab — add `GEMINI_API_KEY`, `CURSOR_API_KEY` (optional).
5. **Settings → Networking → Generate Domain**.
6. Deploy.

---

### Option B troubleshooting

| Issue | Fix |
|---|---|
| Container OOM / crash on capture | Upgrade to 1–2 GB RAM. |
| `pnpm exec tsx` not found | Rebuild image; ensure full `pnpm install` ran before `playwright install`. |
| Capture timeout | Increase `TELL_CAPTURE_TIMEOUT_MS` (default `90000` in Docker). |
| Slow cold start (Render free) | Warm the URL before the demo; or use Railway/paid tier. |

---

## Environment reference

| Variable | Default | Description |
|---|---|---|
| `TELL_REPO_ROOT` | auto-detected | Monorepo root (set to `/app` in Docker) |
| `TELL_DISABLE_REPO_SETUP` | unset (enabled locally) | Set to `1` in production to disable GitHub clone-and-run |
| `TELL_CAPTURE_TIMEOUT_MS` | `60000` local / `90000` Docker | Max wait for Playwright capture |
| `GEMINI_API_KEY` | — | Gemini taste/voice |
| `CURSOR_API_KEY` | — | Cursor SDK redesign drafts |
| `TELL_FIXTURE_URL` | `http://localhost:3001` | Local fixture only |
| `TELL_REPORT_ARTIFACT` | `fixtures/reports/tell-report.json` | Offline demo fallback |

---

## Hackathon demo checklist

When you're back:

- [ ] **Option A:** Vercel deployed, URL copied to submission form
- [ ] **Option A:** Open URL — seam + report load without errors
- [ ] **Option B (optional):** Docker service live, capture works on a public URL
- [ ] Env vars set on host (not in git)
- [ ] README demo GIF loads on GitHub
- [ ] Cursor MCP path documented for judges who clone the repo
- [ ] Practice 60-second pitch: problem → capture → tells → seam → diff → Cursor

### Suggested judge flow (60 seconds)

1. **Web (Vercel):** “Every AI-built UI has a tell — paste a URL, get evidence-backed findings.”
2. **Seam:** Drag before/after — same page, reconciled tokens.
3. **Cursor (local):** “Same pipeline in MCP — `tell_diagnose` on localhost, draft diff, apply in editor.”
4. **Option B (if live):** Capture a real site on the deployed Docker URL.

---

## Updating after code changes

| Platform | Trigger |
|---|---|
| Vercel | Auto-deploy on push to `main` (if Git integration enabled) |
| Render / Railway | Auto-deploy on push, or manual redeploy in dashboard |

After changing env vars, **redeploy** so runtime picks them up.

---

## What not to deploy

- **Supabase / Neon / Grafana** — not app hosts; use only if you add a database later (Tell doesn't need one today).
- **MCP server** — stdio-only, runs inside Cursor on the judge's machine.
- **`.env` files** — secrets belong in the host dashboard only.
