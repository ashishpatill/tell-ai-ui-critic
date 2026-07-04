"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  ExternalLink,
  Eye,
  Github,
  Layers,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Split,
  Square,
  TerminalSquare,
  Wand2,
} from "lucide-react";
import type { Reconciliation, RedesignProposal, TellReport, Verdict } from "@tell/schema";
import { parseDirection } from "@tell/taste";
import { RECONCILE_DIRECTIONS, buildOverridesPatch, reconcile, resolveDirection } from "@tell/redesign";
import { demoReport } from "@/lib/demo-report";
import { BeforeAfterSeam } from "@/components/BeforeAfterSeam";
import { useVoice } from "@/lib/use-voice";
import { SETUP_ACTIVE_STATES, type SetupJob } from "@/lib/setup-types";
import { discoverRoutes, routeFromInput, type DiscoveredRoute } from "@/lib/discover-routes";

const badgeStyles: Record<Verdict, string> = {
  generic: "border-accent/40 bg-accent/10 text-accent",
  drift: "border-drift/40 bg-drift/10 text-drift",
  intentional: "border-ok/40 bg-ok/10 text-ok",
  uncertain: "border-muted/40 bg-muted/10 text-muted",
};

const PRESET_CHIPS: { key: string; label: string }[] = [
  { key: "editorial", label: "Editorial" },
  { key: "precision", label: "Precision instrument" },
  { key: "warm-minimal", label: "Warm minimal" },
  { key: "bold-contrast", label: "Bold contrast" },
];

type CaptureState = "idle" | "capturing" | "done";
type DraftState = "idle" | "drafting" | "ready" | "copied" | "error";
type CaptureMeta = { live: boolean; requestedUrl: string; capturedUrl: string; error?: string };

function isGitHubRepoUrl(url: string) {
  let raw = url.trim();
  if (/^git@[\w.-]+:[\w.-]+\/[\w.-]+/.test(raw)) return true; // ssh
  const shorthand = raw.match(/^([\w.-]+)\/([\w.-]+)$/); // owner/repo (owner not a host)
  if (shorthand && !shorthand[1]!.includes(".")) return true;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const parsed = new URL(raw);
    return /(^|\.)(github|gitlab|bitbucket)\.com$/.test(parsed.hostname) && parsed.pathname.split("/").filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

function siteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "this page";
  }
}

const DEFAULT_CAPTURE_URL = "https://superlearnai.com";

export default function HomePage() {
  const [report, setReport] = useState<TellReport>(demoReport);
  const [inputUrl, setInputUrl] = useState(DEFAULT_CAPTURE_URL);
  const [captureMeta, setCaptureMeta] = useState<CaptureMeta | null>(null);
  const [selectedId, setSelectedId] = useState(demoReport.findings[0]?.id ?? "");
  const [seam, setSeam] = useState(50);
  const [directionId, setDirectionId] = useState("editorial");
  const [captureState, setCaptureState] = useState<CaptureState>("done");
  const [captureNote, setCaptureNote] = useState("");
  const [proposal, setProposal] = useState<RedesignProposal | null>(null);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [draftError, setDraftError] = useState("");

  // ── GitHub repo setup ──
  const [setupJob, setSetupJob] = useState<SetupJob | null>(null);
  const [setupError, setSetupError] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCapturedRef = useRef<string | null>(null);

  // ── Multi-page scanning ──
  const [pages, setPages] = useState<DiscoveredRoute[]>([]);
  const [pageInput, setPageInput] = useState("");
  const [scanningAll, setScanningAll] = useState(false);

  const reconciliation = useMemo(
    () => reconcile(report.capture, report.fingerprint, report.findings, directionId),
    [report, directionId],
  );

  const verdictOf = useCallback(
    (id: string): Verdict => report.verdicts.find((v) => v.findingId === id)?.verdict ?? "uncertain",
    [report],
  );

  const applyTranscript = useCallback((text: string) => {
    if (text.trim().length < 2) return;
    setDirectionId(resolveDirection(parseDirection(text).id).id);
  }, []);

  const voice = useVoice(applyTranscript);

  const selectedFinding = report.findings.find((f) => f.id === selectedId) ?? report.findings[0];
  const verdict = report.verdicts.find((v) => v.findingId === selectedFinding?.id);
  const s = report.score;
  const scoreLine = `${s.total} findings · ${s.generic} generic · ${s.drift} drift · ${s.intentional} intentional`;

  const dirMeta = RECONCILE_DIRECTIONS[directionId] ?? RECONCILE_DIRECTIONS.editorial!;

  const runCapture = useCallback(
    async (url: string) => {
      const target = url.trim();
      if (!target) return;
      setCaptureState("capturing");
      setCaptureNote(`Launching headless browser for ${siteLabel(target)}…`);
      setDraftError("");
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const payload = (await res.json()) as { report: TellReport; meta: CaptureMeta };
        setCaptureNote(payload.meta.live ? "Reconciling the rendered surface…" : "Capture failed — loaded offline demo.");
        setReport(payload.report);
        setCaptureMeta(payload.meta);
        setSelectedId(payload.report.findings[0]?.id ?? "");
        setProposal(null);
        setDraftState("idle");
        setSeam(50);
        setCaptureState("done");
        if (payload.meta.live) {
          setPages(discoverRoutes(payload.report.capture.snapshotHtml, payload.report.capture.url));
        }
        if (!payload.meta.live) {
          setDraftError(payload.meta.error ?? "Live capture failed. Fix Playwright or paste a reachable URL.");
        }
      } catch {
        setCaptureNote("Capture failed — showing the last committed report.");
        setCaptureState("done");
        setDraftError("Network error while capturing. Is the dev server running?");
      }
    },
    [],
  );

  const pollSetup = useCallback(
    (id: string) => {
      if (pollRef.current) clearTimeout(pollRef.current);
      const tick = async () => {
        try {
          const res = await fetch(`/api/setup/status?id=${encodeURIComponent(id)}`);
          const data = await res.json();
          if (res.ok && data.job) {
            const job = data.job as SetupJob;
            setSetupJob(job);
            if (job.state === "ready" && job.url && autoCapturedRef.current !== job.url) {
              autoCapturedRef.current = job.url;
              void runCapture(job.url);
              return;
            }
            if (SETUP_ACTIVE_STATES.includes(job.state)) {
              pollRef.current = setTimeout(tick, 1200);
            }
          } else {
            pollRef.current = setTimeout(tick, 2000);
          }
        } catch {
          pollRef.current = setTimeout(tick, 2000);
        }
      };
      void tick();
    },
    [runCapture],
  );

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const startSetup = useCallback(
    async (repoUrl: string) => {
      setSetupError("");
      autoCapturedRef.current = null;
      try {
        const res = await fetch("/api/setup/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSetupError(data.error ?? "Could not start setup.");
          return;
        }
        setSetupJob(data.job as SetupJob);
        pollSetup((data.job as SetupJob).id);
      } catch {
        setSetupError("Network error starting setup. Is the dev server running?");
      }
    },
    [pollSetup],
  );

  const stopApp = useCallback(async () => {
    try {
      await fetch("/api/setup/stop", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSetupJob(null);
  }, []);

  const isRepo = isGitHubRepoUrl(inputUrl);
  const setupActive = Boolean(setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state));

  function onPrimary() {
    if (isRepo) void startSetup(inputUrl);
    else void runCapture(inputUrl);
  }

  const liveCapture = captureMeta?.live === true && Boolean(report.capture.snapshotHtml || report.capture.screenshotBase64);
  const scannedSite = captureMeta?.live ? siteLabel(report.capture.url) : null;
  const needsRecapture = Boolean(
    captureMeta?.live && !isRepo && inputUrl.trim() && inputUrl.trim() !== captureMeta.requestedUrl,
  );

  function addPage() {
    const url = routeFromInput(pageInput, report.capture.url);
    if (!url) return;
    setPages((prev) => (prev.some((p) => p.url === url) ? prev : [...prev, { url, path: new URL(url).pathname }]));
    setPageInput("");
    void runCapture(url);
  }

  async function scanAllPages() {
    setScanningAll(true);
    for (const p of pages.slice(0, 8)) {
      // eslint-disable-next-line no-await-in-loop
      await runCapture(p.url);
    }
    setScanningAll(false);
  }

  function draftFix() {
    setDraftState("drafting");
    setDraftError("");
    try {
      const files = buildOverridesPatch(reconciliation, report.capture.url);
      setProposal({
        findingId: selectedFinding?.id,
        direction: {
          id: reconciliation.directionId,
          label: reconciliation.label,
          keywords: [],
          tokenOverrides: { "--tell-accent": reconciliation.accentAfter, "--tell-paper": reconciliation.surfaceAfter },
          summary: reconciliation.summary,
        },
        reconciliation,
        files,
      });
      setDraftState("ready");
    } catch {
      setProposal(null);
      setDraftError("Could not build a patch from this capture. Try recapturing.");
      setDraftState("error");
    }
  }

  async function copyPatch(applyIntent = false) {
    if (!proposal) return;
    const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
    try {
      await navigator.clipboard.writeText(patch);
      setDraftState("copied");
      setDraftError(applyIntent ? "Patch copied. Paste it into Cursor and ask the Agent to apply it." : "");
    } catch {
      setDraftError("Clipboard access was blocked. Select and copy the patch manually.");
      setDraftState("error");
    }
  }

  return (
    <main className="min-h-screen px-6 py-5 text-text">
      <header className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-accent/50 bg-accent/10 font-mono text-accent">⊕</div>
          <div>
            <p className="font-display text-3xl leading-none">Tell</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-secondary">Every AI-built UI has a tell</p>
          </div>
        </div>
        <label className="ml-auto flex min-w-[320px] flex-1 items-center gap-2 rounded-card border border-border bg-surface px-3 py-2 font-mono text-sm text-secondary">
          {isRepo ? <Github className="h-4 w-4 shrink-0 text-accent" /> : <span className="text-muted">url</span>}
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !setupActive && captureState !== "capturing") onPrimary(); }}
            spellCheck={false}
            aria-label="URL to capture or GitHub repo to run"
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted"
            placeholder="https://your-app.com  ·  or  github.com/owner/repo"
          />
        </label>
        <button
          onClick={onPrimary}
          disabled={setupActive || captureState === "capturing"}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
        >
          {setupActive ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Setting up…</>
          ) : captureState === "capturing" ? (
            "Capturing…"
          ) : isRepo ? (
            <><Github className="h-4 w-4" /> Set up &amp; run</>
          ) : (
            "Capture"
          )}
        </button>
        <span className={`rounded-full border px-3 py-2 font-mono text-xs ${captureMeta?.live ? "border-ok/40 bg-ok/10 text-ok" : "border-drift/40 bg-drift/10 text-drift"}`}>
          {captureMeta?.live ? "● Live capture" : captureMeta ? "● Offline fallback" : "● Demo loaded"}
        </span>
      </header>

      {isRepo && !setupJob ? (
        <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-secondary">
          <Github className="h-3.5 w-3.5 text-accent" />
          Tell will clone this repo, read its README to find the run command, start it, and capture the localhost URL for you.
        </p>
      ) : null}

      {setupError ? (
        <div className="mt-4 rounded-card border border-drift/40 bg-drift/10 px-4 py-3 text-sm text-drift">{setupError}</div>
      ) : null}

      {setupJob ? <SetupPanel job={setupJob} onRetry={() => startSetup(setupJob.repoUrl)} onStop={stopApp} onCaptureManual={(u) => { setInputUrl(u); void runCapture(u); }} /> : null}

      {needsRecapture ? (
        <div className="mt-4 rounded-card border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-secondary">
          URL changed to <span className="font-mono text-text">{inputUrl.trim()}</span> — click <strong className="text-text">Capture</strong> to rescan. The report below is still from{" "}
          <span className="font-mono text-text">{captureMeta?.requestedUrl}</span>.
        </div>
      ) : null}

      {captureMeta?.live && report.capture.url ? (
        <p className="mt-3 font-mono text-[11px] text-muted">
          Scanned {report.capture.styles.length} elements · snapshot {Math.round((report.capture.snapshotHtml.length || 0) / 1024)}KB ·{" "}
          <span className="text-text">{report.capture.url}</span>
          {captureMeta.requestedUrl !== report.capture.url ? (
            <span className="text-drift"> · requested {captureMeta.requestedUrl}</span>
          ) : null}
        </p>
      ) : null}

      <section className="grid gap-6 py-8 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Rendered surface</p>
            <h1 className="mt-2 max-w-3xl font-display text-6xl leading-[0.95] text-text">
              {scannedSite ? (
                <>
                  {scannedSite} has tells.
                  <span className="block text-4xl text-secondary">Tell names them — and restyles the real page you can ship.</span>
                </>
              ) : (
                <>You shipped fast. Tell shows why it still feels generic.</>
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-secondary">
              {liveCapture
                ? "The seam wipes between your captured page and a real reconciliation of it — same content, restyled from your own detected tokens. Draft fix ships that as a patch."
                : "Paste a live URL — or a GitHub repo and let Tell run it — capture the rendered UI, name the tells, and see the page restyled in place, then draft the patch for Cursor."}
            </p>
          </div>

          {liveCapture ? (
            <PagesStrip
              pages={pages}
              activeUrl={report.capture.url}
              capturing={captureState === "capturing"}
              scanningAll={scanningAll}
              pageInput={pageInput}
              setPageInput={setPageInput}
              onSelect={(u) => runCapture(u)}
              onAdd={addPage}
              onScanAll={scanAllPages}
            />
          ) : null}

          <section className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary" aria-live="polite">
                {captureState === "capturing" ? captureNote : scoreLine}
              </p>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                direction: {dirMeta.id}
              </span>
            </div>
            <BeforeAfterSeam
              seam={seam}
              setSeam={setSeam}
              findings={report.findings}
              reconciliation={reconciliation}
              selectedId={selectedId}
              onSelectFinding={setSelectedId}
              snapshotHtml={report.capture.snapshotHtml || undefined}
              screenshotBase64={report.capture.screenshotBase64 || undefined}
            />
            <p className="mt-2 font-mono text-[11px] text-muted">
              {liveCapture
                ? "Drag the seam · ←/→ to nudge · double-click to reset · switch directions below to re-reconcile the live page"
                : "Drag the seam · ←/→ to nudge · double-click to reset · click a proof mark to inspect its finding"}
            </p>
          </section>

          <ReconciliationTable reconciliation={reconciliation} live={liveCapture} />

          <section className="rounded-card border border-border bg-surface p-4">
            <div className="mb-4 flex items-center gap-2">
              <Mic className="h-4 w-4 text-accent" />
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Voice director</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-md border border-border bg-bg px-4 py-3 text-secondary">
                {voice.supported ? (
                  <button
                    onClick={voice.listening ? voice.stop : voice.start}
                    aria-label={voice.listening ? "Stop listening" : "Start voice direction"}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${
                      voice.listening ? "animate-pulse border-accent bg-accent/20 text-accent" : "border-border text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {voice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                ) : null}
                <span className="truncate">
                  {voice.transcript || (voice.listening ? "Listening…" : "Describe the direction — warmer, more editorial, precision instrument…")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_CHIPS.map((chip) => {
                  const active = directionId === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => { setDirectionId(chip.key); setProposal(null); setDraftState("idle"); }}
                      className={`rounded-full border px-3 py-2 font-mono text-xs transition ${
                        active ? "border-accent bg-accent/10 text-accent" : "border-border text-secondary hover:border-accent hover:text-accent"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {!voice.supported ? (
              <p className="mt-2 font-mono text-[11px] text-muted">Voice input needs a Chromium browser — use the presets as the text equivalent.</p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-secondary">Findings</p>
            <div className="space-y-2">
              {report.findings.map((finding) => {
                const itemVerdict = verdictOf(finding.id);
                return (
                  <button
                    key={finding.id}
                    onClick={() => setSelectedId(finding.id)}
                    className={`w-full rounded-md border p-3 text-left transition hover:border-accent ${
                      selectedId === finding.id ? "border-accent bg-accent/10" : "border-border bg-bg/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm">{finding.detector}</span>
                      <VerdictBadge verdict={itemVerdict} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-secondary">
                      {report.verdicts.find((v) => v.findingId === finding.id)?.rationale}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedFinding && verdict ? (
            <section className="rounded-card border border-accent/40 bg-surface-raised p-5 shadow-signal">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-mono text-lg">{selectedFinding.detector}</h2>
                <VerdictBadge verdict={verdict.verdict} />
              </div>
              <ConfidenceMeter value={verdict.confidence} />
              <p className="mt-4 text-secondary">{verdict.rationale}</p>
              <div className="mt-5 rounded-md border border-border bg-bg p-4">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Evidence</p>
                {selectedFinding.evidence.map((evidence) => (
                  <p key={`${evidence.label}-${evidence.value}`} className="mt-2 font-mono text-sm text-secondary">
                    <span className="text-accent">⊕</span> {evidence.label}: {evidence.value}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={draftFix}
                  disabled={draftState === "drafting"}
                  className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
                >
                  <Wand2 className="h-4 w-4" /> {draftState === "drafting" ? "Drafting…" : "Draft fix"}
                </button>
                <button className="rounded-md border border-border px-4 py-2 text-secondary transition hover:text-text">Mark intentional</button>
              </div>
              {draftError ? <p className="mt-3 font-mono text-xs text-drift">{draftError}</p> : null}
              {proposal ? <DiffViewer proposal={proposal} draftState={draftState} onCopy={() => copyPatch()} onApply={() => copyPatch(true)} /> : null}
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

const STATE_LABEL: Record<SetupJob["state"], string> = {
  cloning: "Cloning",
  installing: "Installing",
  detecting: "Detecting",
  starting: "Starting",
  waiting: "Waiting",
  ready: "Running",
  "needs-manual": "Needs a hand",
  error: "Error",
};

function SetupPanel({
  job,
  onRetry,
  onStop,
  onCaptureManual,
}: {
  job: SetupJob;
  onRetry: () => void;
  onStop: () => void;
  onCaptureManual: (url: string) => void;
}) {
  const [manualUrl, setManualUrl] = useState("");
  const active = SETUP_ACTIVE_STATES.includes(job.state);
  const ready = job.state === "ready";
  const manual = job.state === "needs-manual";
  const tone = ready ? "border-ok/40 bg-ok/5" : manual || job.state === "error" ? "border-drift/40 bg-drift/5" : "border-accent/40 bg-accent/5";

  const guessUrl = job.detected?.guessedPort ? `http://localhost:${job.detected.guessedPort}` : "";

  return (
    <div className={`mt-4 rounded-card border px-4 py-4 ${tone}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-bg">
          {active ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : ready ? <Check className="h-4 w-4 text-ok" /> : <AlertTriangle className="h-4 w-4 text-drift" />}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-sm text-text">
            <span className="text-secondary">{STATE_LABEL[job.state]}</span> · {job.repoLabel}
          </p>
          <p className="truncate text-sm text-secondary">{job.step}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {job.detected?.framework ? (
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-secondary">{job.detected.framework}</span>
          ) : null}
          {job.detected?.runCmd ? (
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-secondary">{job.detected.runCmd}</span>
          ) : null}
          {ready && job.url ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-ok/40 bg-ok/10 px-2.5 py-1 font-mono text-[11px] text-ok">
              <ExternalLink className="h-3 w-3" /> {job.url}
            </a>
          ) : null}
          {ready ? (
            <button onClick={onStop} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-secondary transition hover:text-text">
              <Square className="h-3 w-3" /> Stop app
            </button>
          ) : null}
          {(manual || job.state === "error") ? (
            <button onClick={onRetry} className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-secondary transition hover:text-text">Retry</button>
          ) : null}
        </div>
      </div>

      {job.logs.length ? (
        <details className="mt-3" open={active || job.state === "error"}>
          <summary className="flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <TerminalSquare className="h-3.5 w-3.5" /> Setup log
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-[11px] leading-relaxed text-secondary">
            <code>{job.logs.slice(-24).join("\n")}</code>
          </pre>
        </details>
      ) : null}

      {manual ? (
        <div className="mt-3 rounded-md border border-drift/30 bg-bg/60 p-3">
          <p className="text-sm text-secondary">
            Tell couldn&apos;t auto-run this repo. Start it yourself, then paste the localhost URL — Tell captures it the same way.
          </p>
          {job.detected?.readmeInstructions?.length ? (
            <div className="mt-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">From the README</p>
              <ul className="mt-1 space-y-1">
                {job.detected.readmeInstructions.map((line) => (
                  <li key={line} className="font-mono text-[12px] text-secondary">$ {line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && manualUrl.trim()) onCaptureManual(manualUrl.trim()); }}
              placeholder={guessUrl || "http://localhost:3000"}
              spellCheck={false}
              className="min-w-[220px] flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-muted"
            />
            <button
              onClick={() => onCaptureManual((manualUrl.trim() || guessUrl))}
              disabled={!manualUrl.trim() && !guessUrl}
              className="rounded-md bg-accent px-3 py-2 font-mono text-xs font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              Capture this URL
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PagesStrip({
  pages,
  activeUrl,
  capturing,
  scanningAll,
  pageInput,
  setPageInput,
  onSelect,
  onAdd,
  onScanAll,
}: {
  pages: DiscoveredRoute[];
  activeUrl: string;
  capturing: boolean;
  scanningAll: boolean;
  pageInput: string;
  setPageInput: (v: string) => void;
  onSelect: (url: string) => void;
  onAdd: () => void;
  onScanAll: () => void;
}) {
  const activePath = (() => {
    try {
      return new URL(activeUrl).pathname + new URL(activeUrl).search;
    } catch {
      return activeUrl;
    }
  })();

  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-secondary">
          <Layers className="h-4 w-4 text-accent" /> Pages · {pages.length} discovered
        </p>
        {pages.length > 1 ? (
          <button
            onClick={onScanAll}
            disabled={scanningAll || capturing}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[11px] text-secondary transition hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {scanningAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {scanningAll ? "Scanning all…" : "Scan all pages"}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => {
          const active = (p.path || "/") === (activePath || "/");
          return (
            <button
              key={p.url}
              onClick={() => onSelect(p.url)}
              disabled={capturing || scanningAll}
              title={p.url}
              className={`max-w-[240px] truncate rounded-full border px-3 py-1.5 font-mono text-xs transition disabled:opacity-50 ${
                active ? "border-accent bg-accent/10 text-accent" : "border-border text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {p.path || "/"}
            </button>
          );
        })}
        <div className="flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5">
          <input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }}
            placeholder="/pricing"
            spellCheck={false}
            className="w-24 bg-transparent px-1 py-1 font-mono text-xs text-text outline-none placeholder:text-muted"
          />
          <button onClick={onAdd} aria-label="Add page" className="grid h-6 w-6 place-items-center rounded-full text-secondary transition hover:text-accent">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted">
        Scan each route to catch drift that only shows on some pages. The drafted patch is a site-wide stylesheet — one apply covers every page here.
      </p>
    </section>
  );
}

function ReconciliationTable({ reconciliation, live }: { reconciliation: Reconciliation; live: boolean }) {
  if (!reconciliation) return null;
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Reconciliation · {reconciliation.label}</p>
        <span className="font-mono text-[11px] text-muted">{live ? "grounded in your captured tokens" : "capture a page to ground this"}</span>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-bg/60 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-2 font-normal">Token</th>
              <th className="px-3 py-2 font-normal">Before</th>
              <th className="px-3 py-2 font-normal">After</th>
            </tr>
          </thead>
          <tbody>
            {reconciliation.rows.map((row) => (
              <tr key={row.key} className="border-t border-border align-top">
                <td className="px-3 py-2.5">
                  <p className="text-text">{row.label}</p>
                  {row.note ? <p className="mt-0.5 text-[11px] text-muted">{row.note}</p> : null}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-[13px] text-secondary">
                    {row.swatchBefore ? <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: row.swatchBefore }} /> : null}
                    {row.before}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-[13px] text-text">
                    {row.swatchAfter ? <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: row.swatchAfter }} /> : null}
                    {row.after}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DiffViewer({
  proposal,
  draftState,
  onCopy,
  onApply,
}: {
  proposal: RedesignProposal;
  draftState: DraftState;
  onCopy: () => void;
  onApply: () => void;
}) {
  const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");

  return (
    <section className="mt-5 overflow-hidden rounded-md border border-border bg-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Cursor patch · {proposal.files[0]?.file}</p>
          <p className="mt-1 text-sm text-secondary">{proposal.files[0]?.summary}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-xs text-secondary transition hover:text-text">
            <Clipboard className="h-3.5 w-3.5" /> {draftState === "copied" ? "Copied" : "Copy patch"}
          </button>
          <button onClick={onApply} className="rounded-md bg-accent px-3 py-2 font-mono text-xs font-semibold text-white transition hover:bg-accent-hover">
            Apply in Cursor
          </button>
        </div>
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-left font-mono text-[11px] leading-relaxed text-secondary">
        <code>{patch}</code>
      </pre>
    </section>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const icon = verdict === "intentional" ? <Check className="h-3 w-3" /> : verdict === "drift" ? <Split className="h-3 w-3" /> : <Eye className="h-3 w-3" />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${badgeStyles[verdict]}`}>
      {icon}
      {verdict}
    </span>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">confidence</span>
      <div className="flex gap-1" aria-label={`Confidence ${Math.round(value * 100)}%`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-2 w-4 rounded-sm ${i < filled ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}
