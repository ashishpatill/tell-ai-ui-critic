import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { DetectedPlan, SetupJob, SetupState } from "./setup-types";

/**
 * Local-only convenience runner: given a GitHub URL, clone the repo, read its
 * README + package.json to figure out how to run it, install deps, start the
 * dev server, and surface the localhost URL Tell can capture.
 *
 * SECURITY: this executes arbitrary code from the cloned repo (install +
 * dev scripts). It is intended strictly for a developer running Tell on their
 * own machine against repos they trust — never expose this route publicly.
 */

interface RunnerRegistry {
  jobs: Map<string, SetupJob>;
  child: ChildProcess | null;
  childJobId: string | null;
}

// Survive Next.js dev HMR by parking the registry on globalThis.
const g = globalThis as unknown as { __tellRunner?: RunnerRegistry };
const registry: RunnerRegistry =
  g.__tellRunner ?? (g.__tellRunner = { jobs: new Map(), child: null, childJobId: null });

const MAX_LOG_LINES = 200;
const LOCALHOST_RE = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::(\d+))?(?:\/[^\s"'`]*)?/i;

function nowId() {
  return `setup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function log(job: SetupJob, line: string) {
  const trimmed = line.replace(/\u001b\[[0-9;]*m/g, "").replace(/\s+$/g, "");
  if (!trimmed) return;
  job.logs.push(trimmed);
  if (job.logs.length > MAX_LOG_LINES) job.logs.splice(0, job.logs.length - MAX_LOG_LINES);
  job.updatedAt = Date.now();
}

function setState(job: SetupJob, state: SetupState, step: string) {
  job.state = state;
  job.step = step;
  job.updatedAt = Date.now();
}

/** github.com/owner/repo(/tree/..)?, owner/repo, or git@github.com:owner/repo → clone url + label */
export function normalizeRepoUrl(input: string): { cloneUrl: string; label: string } | null {
  let raw = input.trim();
  if (!raw) return null;

  // git@host:owner/repo(.git)
  const ssh = raw.match(/^git@([\w.-]+):([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (ssh) {
    return { cloneUrl: `https://${ssh[1]}/${ssh[2]}/${ssh[3]}.git`, label: `${ssh[2]}/${ssh[3]}` };
  }

  // owner/repo shorthand (two segments, owner is not a hostname)
  const shorthand = raw.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthand && !shorthand[1]!.includes(".")) {
    const repo = shorthand[2]!.replace(/\.git$/, "");
    return { cloneUrl: `https://github.com/${shorthand[1]}/${repo}.git`, label: `${shorthand[1]}/${repo}` };
  }

  // Accept scheme-less URLs like "github.com/owner/repo".
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0]!;
    const repo = parts[1]!.replace(/\.git$/, "");
    return { cloneUrl: `https://${url.hostname}/${owner}/${repo}.git`, label: `${owner}/${repo}` };
  } catch {
    return null;
  }
}

function augmentedEnv(port: number): NodeJS.ProcessEnv {
  const extraPath = ["/usr/local/bin", "/opt/homebrew/bin", "/usr/bin", "/bin", path.dirname(process.execPath)].join(":");
  return {
    ...process.env,
    PATH: `${extraPath}:${process.env.PATH ?? ""}`,
    PORT: String(port),
    BROWSER: "none",
    FORCE_COLOR: "0",
    NEXT_TELEMETRY_DISABLED: "1",
    npm_config_yes: "true",
  };
}

function findFreePort(start = 4300): Promise<number> {
  return new Promise((resolve) => {
    const tryPort = (p: number) => {
      const srv = createServer();
      srv.once("error", () => tryPort(p + 1));
      // Listen without a host so the check reserves both IPv4 and IPv6 (dual-stack),
      // avoiding the case where a dev server grabs ::1:PORT that we thought was free.
      srv.once("listening", () => srv.close(() => resolve(p)));
      srv.listen(p);
    };
    tryPort(start);
  });
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Run a short-lived command to completion, streaming output into the job log. */
function runToCompletion(
  job: SetupJob,
  cmd: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, detached: true });
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      killTree(child);
      reject(new Error(`${cmd} ${args.join(" ")} timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);
    child.stdout?.on("data", (b: Buffer) => b.toString().split("\n").forEach((l) => log(job, l)));
    child.stderr?.on("data", (b: Buffer) => b.toString().split("\n").forEach((l) => log(job, l)));
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(code ?? 0);
    });
  });
}

const LOCKFILES = ["pnpm-lock.yaml", "yarn.lock", "bun.lockb", "package-lock.json"];

function hasLockfile(files: Set<string>): boolean {
  return LOCKFILES.some((f) => files.has(f));
}

function detectPackageManager(files: Set<string>): string {
  if (files.has("pnpm-lock.yaml")) return "pnpm";
  if (files.has("yarn.lock")) return "yarn";
  if (files.has("bun.lockb")) return "bun";
  if (files.has("package-lock.json")) return "npm";
  return "npm";
}

function installArgs(pm: string): string[] {
  if (pm === "yarn") return ["install"];
  if (pm === "bun") return ["install"];
  return ["install"]; // npm/pnpm
}

function runScriptArgs(pm: string, script: string): string[] {
  if (pm === "yarn") return [script];
  return ["run", script]; // npm, pnpm, bun
}

// Frameworks whose dev server ignores the PORT env var and needs an explicit
// --port flag (Vite-family). Everything else honors PORT, so we set it in env.
const PORT_FLAG_FRAMEWORKS = new Set(["Vite", "SvelteKit", "Astro", "Angular"]);

/**
 * Build the full run invocation, forcing the app onto `port` so it never
 * collides with Tell (3000) or the fixture (3001).
 */
function buildRunArgs(pm: string, script: string, framework: string | null, port: number): string[] {
  const base = runScriptArgs(pm, script);
  if (!PORT_FLAG_FRAMEWORKS.has(framework ?? "")) return base; // honors PORT env
  const flag = ["--port", String(port)];
  // yarn forwards trailing args to the script directly; others need `--`.
  return pm === "yarn" ? [...base, ...flag] : [...base, "--", ...flag];
}

const RUN_SCRIPT_PRIORITY = ["dev", "develop", "start", "serve", "preview", "start:dev"];

function detectFramework(pkg: Record<string, unknown>): string | null {
  const deps = { ...(pkg.dependencies as object), ...(pkg.devDependencies as object) } as Record<string, string>;
  if (deps.next) return "Next.js";
  if (deps.vite) return "Vite";
  if (deps["react-scripts"]) return "Create React App";
  if (deps.astro) return "Astro";
  if (deps["@remix-run/dev"] || deps["@remix-run/react"]) return "Remix";
  if (deps.nuxt || deps.nuxt3) return "Nuxt";
  if (deps["@sveltejs/kit"]) return "SvelteKit";
  if (deps.gatsby) return "Gatsby";
  if (deps["@angular/core"]) return "Angular";
  return null;
}

function guessPortForFramework(framework: string | null): number | null {
  switch (framework) {
    case "Next.js":
    case "Create React App":
    case "Gatsby":
    case "Remix":
      return 3000;
    case "Vite":
    case "SvelteKit":
      return 5173;
    case "Astro":
      return 4321;
    case "Nuxt":
      return 3000;
    case "Angular":
      return 4200;
    default:
      return null;
  }
}

/** Pull the "how to run" gist out of a README for the manual-fallback panel. */
function extractReadmeInstructions(readme: string): string[] {
  if (!readme) return [];
  const lines = readme.split("\n");
  const out: string[] = [];
  const runRe = /\b(npm|pnpm|yarn|bun|npx)\b.*\b(install|i|ci|run|dev|start|serve|build|preview)\b|localhost:\d+|127\.0\.0\.1:\d+/i;
  for (const raw of lines) {
    const line = raw.replace(/^[#>`\s*-]+/, "").trim();
    if (!line) continue;
    if (runRe.test(line) && !line.startsWith("//")) {
      const clean = line.replace(/`/g, "").trim();
      if (clean.length <= 120 && !out.includes(clean)) out.push(clean);
    }
    if (out.length >= 8) break;
  }
  return out;
}

function portFromInstructions(instructions: string[]): number | null {
  for (const line of instructions) {
    const m = line.match(/(?:localhost|127\.0\.0\.1):(\d+)/i);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Candidate app directories for repos that keep the web app in a subfolder. */
const APP_DIR_CANDIDATES = ["", "frontend", "web", "app", "client", "site", "www", "apps/web", "packages/web", "example", "examples"];

export async function detectPlan(repoDir: string): Promise<DetectedPlan | { error: string }> {
  const rootFiles = new Set(await fs.readdir(repoDir).catch(() => [] as string[]));
  let readme = "";
  for (const name of Array.from(rootFiles)) {
    if (/^readme(\.md|\.markdown|\.txt)?$/i.test(name)) {
      readme = await fs.readFile(path.join(repoDir, name), "utf8").catch(() => "");
      if (readme) break;
    }
  }
  const readmeInstructions = extractReadmeInstructions(readme);

  for (const rel of APP_DIR_CANDIDATES) {
    const dir = path.join(repoDir, rel);
    const pkgPath = path.join(dir, "package.json");
    if (!(await pathExists(pkgPath))) continue;
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    } catch {
      continue;
    }
    const scripts = (pkg.scripts as Record<string, string>) ?? {};
    const scriptName = RUN_SCRIPT_PRIORITY.find((s) => typeof scripts[s] === "string") ?? null;
    const dirFiles = new Set(await fs.readdir(dir).catch(() => [] as string[]));
    // Prefer a lockfile in the app dir; fall back to the repo root (monorepos).
    const pm = detectPackageManager(hasLockfile(dirFiles) ? dirFiles : rootFiles);
    const framework = detectFramework(pkg);
    const guessedPort = portFromInstructions(readmeInstructions) ?? guessPortForFramework(framework);
    return {
      packageManager: pm,
      installCmd: `${pm} ${installArgs(pm).join(" ")}`,
      runCmd: scriptName ? `${pm} ${runScriptArgs(pm, scriptName).join(" ")}` : null,
      scriptName,
      appDir: rel,
      framework,
      readmeInstructions,
      guessedPort,
    };
  }

  return { error: "No package.json with a runnable dev/start script was found in this repo." };
}

/** Start the dev server; resolve with the detected localhost URL or reject. */
function startDevServer(job: SetupJob, appDir: string, pm: string, args: string[], port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = augmentedEnv(port);
    // detached → its own process group, so killTree can take down the whole
    // dev server tree (npm → node → vite), not just the npm wrapper.
    const child = spawn(pm, args, { cwd: appDir, env, detached: true });
    killPrevious();
    registry.child = child;
    registry.childJobId = job.id;

    let resolved = false;
    const timeout = setTimeout(() => {
      if (resolved) return;
      reject(new Error("Dev server started but never printed a localhost URL within 100s."));
    }, 100_000);

    const scan = (buf: Buffer) => {
      const text = buf.toString();
      text.split("\n").forEach((l) => log(job, l));
      if (resolved) return;
      const m = text.match(LOCALHOST_RE);
      if (m) {
        const found = m[0].replace(/127\.0\.0\.1|0\.0\.0\.0/, "localhost").replace(/[).,'"`]+$/, "");
        resolved = true;
        clearTimeout(timeout);
        // Give the server a beat to finish its first compile before capture.
        setTimeout(() => resolve(found), 1500);
      }
    };

    child.stdout?.on("data", scan);
    child.stderr?.on("data", scan);
    child.on("error", (err) => {
      if (resolved) return;
      clearTimeout(timeout);
      reject(err);
    });
    child.on("close", (code) => {
      if (resolved) return;
      clearTimeout(timeout);
      reject(new Error(`Dev server exited early (code ${code ?? "?"}). Check the logs above.`));
    });
  });
}

/** Kill a child and its whole process group (dev servers fork sub-processes). */
function killTree(child: ChildProcess | null) {
  if (!child || child.killed) return;
  try {
    if (typeof child.pid === "number") process.kill(-child.pid, "SIGKILL"); // negative pid → process group
    else child.kill("SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

function killPrevious() {
  killTree(registry.child);
  registry.child = null;
  registry.childJobId = null;
}

async function runPipeline(job: SetupJob, cloneUrl: string) {
  try {
    const baseDir = path.join(os.tmpdir(), "tell-repos");
    await fs.mkdir(baseDir, { recursive: true });
    const slug = job.repoLabel.replace(/[^\w.-]+/g, "-");
    const repoDir = path.join(baseDir, slug);
    // Run the cloned app on a *free* port so it never collides with Tell (3000)
    // or the fixture (3001). We still parse the real URL from the server's stdout.
    const freePort = await findFreePort(4300);
    const env = augmentedEnv(freePort);

    // 1. Clone (reuse an existing checkout for fast repeat demos).
    if (await pathExists(path.join(repoDir, ".git"))) {
      log(job, `Reusing existing checkout at ${repoDir}`);
    } else {
      // Clear any partial/broken leftover before a fresh clone.
      if (await pathExists(repoDir)) await fs.rm(repoDir, { recursive: true, force: true });
      setState(job, "cloning", `Cloning ${job.repoLabel}…`);
      log(job, `$ git clone --depth 1 ${cloneUrl}`);
      await runToCompletion(job, "git", ["clone", "--depth", "1", cloneUrl, repoDir], baseDir, env, 120_000);
    }

    // 2. Detect how to run it.
    setState(job, "detecting", "Reading README and package.json…");
    const plan = await detectPlan(repoDir);
    if ("error" in plan) {
      job.detected = null;
      job.needsManual = true;
      setState(job, "needs-manual", plan.error);
      return;
    }
    job.detected = plan;
    const appDir = path.join(repoDir, plan.appDir);

    if (!plan.runCmd || !plan.scriptName) {
      job.needsManual = true;
      setState(job, "needs-manual", "Couldn't find a dev/start script. Start the app yourself and paste its URL.");
      return;
    }

    // 3. Install dependencies (skip if already installed for this checkout).
    const hasModules = await pathExists(path.join(appDir, "node_modules"));
    if (!hasModules) {
      setState(job, "installing", `Installing dependencies with ${plan.packageManager}… (this can take a minute)`);
      log(job, `$ ${plan.installCmd}`);
      const code = await runToCompletion(job, plan.packageManager, installArgs(plan.packageManager), appDir, env, 300_000);
      if (code !== 0) {
        job.needsManual = true;
        setState(job, "needs-manual", `Install exited with code ${code}. Try running it manually, then paste the URL.`);
        return;
      }
    } else {
      log(job, "Dependencies already installed — skipping install.");
    }

    // 4. Start the dev server on a forced free port and wait for its URL.
    const runArgs = buildRunArgs(plan.packageManager, plan.scriptName, plan.framework, freePort);
    setState(job, "starting", `Starting the app — ${plan.runCmd}`);
    log(job, `$ ${plan.packageManager} ${runArgs.join(" ")}  (PORT=${freePort})`);
    setState(job, "waiting", "Waiting for the dev server to come up…");
    const url = await startDevServer(job, appDir, plan.packageManager, runArgs, freePort);
    job.url = url;
    setState(job, "ready", `${job.repoLabel} is running at ${url}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(job, `ERROR: ${message}`);
    job.error = message;
    job.needsManual = true;
    setState(job, "needs-manual", "Automatic setup hit a snag — run the app yourself and paste its URL below.");
  }
}

export function startSetup(repoUrlInput: string): SetupJob | { error: string } {
  const normalized = normalizeRepoUrl(repoUrlInput);
  if (!normalized) return { error: "That doesn't look like a GitHub repo URL (try github.com/owner/repo)." };

  killPrevious();
  const job: SetupJob = {
    id: nowId(),
    repoUrl: normalized.cloneUrl,
    repoLabel: normalized.label,
    state: "cloning",
    step: "Queued…",
    logs: [],
    url: null,
    detected: null,
    needsManual: false,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  registry.jobs.set(job.id, job);
  // Prune old jobs to keep the map small.
  if (registry.jobs.size > 12) {
    const sorted = Array.from(registry.jobs.values()).sort((a, b) => a.createdAt - b.createdAt);
    for (const stale of sorted.slice(0, sorted.length - 12)) registry.jobs.delete(stale.id);
  }
  void runPipeline(job, normalized.cloneUrl);
  return job;
}

export function getJob(id: string): SetupJob | undefined {
  return registry.jobs.get(id);
}

export function stopRunningApp(): { stopped: boolean } {
  const wasRunning = Boolean(registry.child);
  killPrevious();
  return { stopped: wasRunning };
}
