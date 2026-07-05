"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  ExternalLink,
  Eye,
  Fingerprint,
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
import type { BrandDNA, Reconciliation, RedesignProposal, TellReport, Verdict } from "@tell/schema";
import { DIRECTION_PRESETS, parseDirectionPlan, type DirectionPlan } from "@tell/taste";
import { RECONCILE_DIRECTIONS, buildOverridesPatch, learnBrandDNA, reconcile, resolveDirection } from "@tell/redesign";
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
type CaptureMeta = {
  live: boolean;
  requestedUrl: string;
  capturedUrl: string;
  error?: string;
  backend?: "render" | "local";
};
type UiNotice = { tone: "success" | "error" | "info"; title: string; message: string };

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
  const [directionPlan, setDirectionPlan] = useState<DirectionPlan | null>(null);
  const [directionParsing, setDirectionParsing] = useState(false);
  const [directionSource, setDirectionSource] = useState<"gemini" | "local" | null>(null);
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uiNotice, setUiNotice] = useState<UiNotice | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── GitHub repo setup ──
  const [setupJob, setSetupJob] = useState<SetupJob | null>(null);
  const [setupError, setSetupError] = useState("");
  const [setupStarting, setSetupStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCapturedRef = useRef<string | null>(null);

  // ── Multi-page scanning ──
  const [pages, setPages] = useState<DiscoveredRoute[]>([]);
  const [pageInput, setPageInput] = useState("");
  const [scanningAll, setScanningAll] = useState(false);

  // ── Brand DNA memory (learned once, used as the redesign target + scoring yardstick) ──
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tell:brand-dna");
      if (raw) setBrandDna(JSON.parse(raw) as BrandDNA);
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  const reconciliation = useMemo(
    () => reconcile(report.capture, report.fingerprint, report.findings, directionId, brandDna ?? undefined),
    [report, directionId, brandDna],
  );

  const verdictOf = useCallback(
    (id: string): Verdict => report.verdicts.find((v) => v.findingId === id)?.verdict ?? "uncertain",
    [report],
  );

  const applyDirectionPlan = useCallback((plan: DirectionPlan) => {
    setDirectionPlan(plan);
    setDirectionId(resolveDirection(plan.presetId).id);
    setProposal(null);
    setDraftState("idle");
  }, []);

  const scheduleDirectionParse = useCallback(
    (text: string) => {
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
      const trimmed = text.trim();
      if (trimmed.length < 2) {
        setDirectionPlan(null);
        setDirectionSource(null);
        return;
      }

      applyDirectionPlan(parseDirectionPlan(trimmed));
      setDirectionSource("local");

      parseTimerRef.current = setTimeout(async () => {
        setDirectionParsing(true);
        try {
          const res = await fetch("/api/voice", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ transcript: trimmed }),
          });
          if (res.ok) {
            const payload = (await res.json()) as DirectionPlan & { source?: "gemini" | "local" };
            applyDirectionPlan(payload);
            setDirectionSource(payload.source ?? "local");
          }
        } catch {
          /* local parse already applied */
        } finally {
          setDirectionParsing(false);
        }
      }, 650);
    },
    [applyDirectionPlan],
  );

  const onVoiceTranscript = useCallback(
    (text: string) => {
      scheduleDirectionParse(text);
    },
    [scheduleDirectionParse],
  );

  const voice = useVoice(onVoiceTranscript);

  const showNotice = useCallback((notice: UiNotice) => {
    setUiNotice(notice);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setUiNotice(null), notice.tone === "error" ? 12_000 : 7000);
  }, []);

  const learnDna = useCallback(() => {
    const dna = learnBrandDNA(report.capture, report.fingerprint, siteLabel(report.capture.url));
    setBrandDna(dna);
    try {
      localStorage.setItem("tell:brand-dna", JSON.stringify(dna));
    } catch {
      /* storage unavailable — keep it in memory for this session */
    }
    setProposal(null);
    setDraftState("idle");
    showNotice({
      tone: "success",
      title: "Brand DNA saved",
      message: `Tell now scores against ${dna.displayFont} / ${dna.bodyFont} · ${dna.accent}. Redesigns steer toward this brand.`,
    });
  }, [report, showNotice]);

  const clearDna = useCallback(() => {
    setBrandDna(null);
    try {
      localStorage.removeItem("tell:brand-dna");
    } catch {
      /* ignore */
    }
    setProposal(null);
    setDraftState("idle");
    showNotice({ tone: "info", title: "Brand DNA cleared", message: "Back to scoring against the generic baseline." });
  }, [showNotice]);

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

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
      setProposal(null);
      setPages([]);
      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const payload = (await res.json()) as { report: TellReport; meta: CaptureMeta };
        setCaptureNote(
          payload.meta.live
            ? payload.meta.backend === "render"
              ? "Capture complete — live diagnosis via Render."
              : "Capture complete."
            : "Capture failed — loaded offline demo.",
        );
        setReport(payload.report);
        setCaptureMeta(payload.meta);
        setSelectedId(payload.report.findings[0]?.id ?? "");
        setDraftState("idle");
        setSeam(50);
        setCaptureState("done");
        if (payload.meta.live) {
          setPages(discoverRoutes(payload.report.capture.snapshotHtml, payload.report.capture.url));
          setDraftError("");
          showNotice({
            tone: "success",
            title: "Capture complete",
            message: `Tell scanned ${siteLabel(payload.report.capture.url)} and found ${payload.report.score.total} findings.`,
          });
        }
        if (!payload.meta.live) {
          setDraftError(payload.meta.error ?? "Live capture failed. Fix Playwright or paste a reachable URL.");
          showNotice({
            tone: "error",
            title: "Capture failed",
            message: payload.meta.error ?? `Tell could not reach ${target}. The offline demo report is showing instead.`,
          });
        }
      } catch {
        setCaptureNote("Capture failed — showing the last committed report.");
        setCaptureState("done");
        setDraftError("Network error while capturing. Is the dev server running?");
        showNotice({
          tone: "error",
          title: "Capture failed",
          message: `Network error while capturing ${target}. Is the dev server running?`,
        });
      }
    },
    [showNotice],
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
              setInputUrl(job.url);
              showNotice({
                tone: "info",
                title: "Repo is running",
                message: `${job.repoLabel} is reachable at ${job.url}. Starting capture now.`,
              });
              void runCapture(job.url);
              return;
            }
            if (SETUP_ACTIVE_STATES.includes(job.state)) {
              pollRef.current = setTimeout(tick, 1200);
            } else if (job.state === "needs-manual" || job.state === "error") {
              showNotice({
                tone: "error",
                title: "Setup needs manual help",
                message: job.error ?? job.step,
              });
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
    [runCapture, showNotice],
  );

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const startSetup = useCallback(
    async (repoUrl: string) => {
      setSetupError("");
      setSetupStarting(true);
      setSetupJob(null);
      setCaptureNote(`Creating setup job for ${repoUrl.trim()}…`);
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
          showNotice({
            tone: "error",
            title: "Setup failed to start",
            message: data.error ?? "Could not start setup.",
          });
          return;
        }
        setSetupJob(data.job as SetupJob);
        showNotice({
          tone: "info",
          title: "Setup started",
          message: `Cloning and booting ${(data.job as SetupJob).repoLabel}. This can take a minute on first install.`,
        });
        pollSetup((data.job as SetupJob).id);
      } catch {
        setSetupError("Network error starting setup. Is the dev server running?");
        showNotice({
          tone: "error",
          title: "Setup failed to start",
          message: "Network error starting setup. Is the dev server running?",
        });
      } finally {
        setSetupStarting(false);
      }
    },
    [pollSetup, showNotice],
  );

  const stopApp = useCallback(async () => {
    try {
      await fetch("/api/setup/stop", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSetupJob(null);
    setSetupStarting(false);
  }, []);

  const isRepo = isGitHubRepoUrl(inputUrl);
  const setupActive = setupStarting || Boolean(setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state));
  const operationActive = setupActive || captureState === "capturing";
  const operationTitle = setupStarting
    ? "Starting repo setup"
    : setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state)
      ? `${STATE_LABEL[setupJob.state]} ${setupJob.repoLabel}`
      : captureState === "capturing"
        ? "Capturing rendered surface"
        : "";
  const operationDetail = setupStarting
    ? captureNote
    : setupJob && SETUP_ACTIVE_STATES.includes(setupJob.state)
      ? setupJob.step
      : captureState === "capturing"
        ? captureNote
        : "";

  function onPrimary() {
    if (operationActive) return;
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

  async function draftFix() {
    setDraftState("drafting");
    setDraftError("");
    try {
      const res = await fetch("/api/redesign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          report,
          direction: directionPlan?.summary || directionId,
          directionPlan: directionPlan ?? undefined,
          findingId: selectedFinding?.id,
          dna: brandDna ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("redesign request failed");
      const payload = (await res.json()) as RedesignProposal;
      setProposal({
        ...payload,
        reconciliation: payload.reconciliation ?? reconciliation,
      });
      setDraftState("ready");
    } catch {
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
      setDraftError("Cursor-backed draft was unavailable, so Tell used the deterministic patch.");
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
            onKeyDown={(e) => { if (e.key === "Enter" && !operationActive) onPrimary(); }}
            disabled={operationActive}
            spellCheck={false}
            aria-label="URL to capture or GitHub repo to run"
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted disabled:cursor-wait disabled:opacity-70"
            placeholder="https://your-app.com  ·  or  github.com/owner/repo"
          />
        </label>
        <button
          onClick={onPrimary}
          disabled={operationActive}
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
        <span className={`rounded-full border px-3 py-2 font-mono text-xs ${
          operationActive
            ? "border-accent/40 bg-accent/10 text-accent"
            : captureMeta?.live
              ? "border-ok/40 bg-ok/10 text-ok"
              : "border-drift/40 bg-drift/10 text-drift"
        }`}>
          {operationActive ? "● Working" : captureMeta?.live ? "● Live capture" : captureMeta ? "● Offline fallback" : "● Demo loaded"}
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
            {operationActive ? (
              <OperationPlaceholder title={operationTitle} detail={operationDetail} />
            ) : (
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
            )}
            <p className="mt-2 font-mono text-[11px] text-muted">
              {operationActive
                ? "Tell is working on the requested target. The previous capture is hidden until this operation finishes."
                : liveCapture
                ? "Drag the seam · ←/→ to nudge · double-click to reset · switch directions below to re-reconcile the live page"
                : "Drag the seam · ←/→ to nudge · double-click to reset · click a proof mark to inspect its finding"}
            </p>
          </section>

          <BrandDnaBar dna={brandDna} onLearn={learnDna} onClear={clearDna} live={liveCapture} />

          <Scorecard reconciliation={reconciliation} live={liveCapture} />

          <ReconciliationTable reconciliation={reconciliation} live={liveCapture} />

          <section className="rounded-card border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-accent" />
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Voice director</p>
              </div>
              {directionPlan ? (
                <span className="font-mono text-[11px] text-muted">
                  direction: {resolveDirection(directionPlan.presetId).label.toLowerCase()}
                  {directionParsing ? " · refining…" : directionSource === "gemini" ? " · gemini" : null}
                </span>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex gap-3 rounded-md border border-border bg-bg px-3 py-2 text-secondary">
                {voice.supported ? (
                  <button
                    onClick={voice.listening ? voice.stop : voice.start}
                    aria-label={voice.listening ? "Stop listening" : "Start voice direction"}
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center self-start rounded-full border transition ${
                      voice.listening ? "animate-pulse border-accent bg-accent/20 text-accent" : "border-border text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {voice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                ) : null}
                <textarea
                  value={voice.transcript}
                  onChange={(event) => {
                    voice.setTranscript(event.target.value);
                    scheduleDirectionParse(event.target.value);
                  }}
                  rows={3}
                  placeholder={voice.listening ? "Listening… keep speaking to append more direction." : "Describe the direction — warmer, more editorial, less shadow…"}
                  className="min-h-[4.5rem] max-h-28 w-full resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-secondary placeholder:text-muted focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap content-start gap-2">
                {PRESET_CHIPS.map((chip) => {
                  const active = directionId === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => {
                        const preset = DIRECTION_PRESETS[chip.key as keyof typeof DIRECTION_PRESETS];
                        const text = preset?.summary ?? chip.label;
                        voice.setTranscript(text);
                        applyDirectionPlan(parseDirectionPlan(text));
                      }}
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
            {directionPlan?.actionItems.length ? (
              <div className="mt-3 space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Action items</p>
                <ul className="flex flex-wrap gap-2">
                  {directionPlan.actionItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-border bg-bg/70 px-2.5 py-1.5 font-mono text-[11px] text-secondary"
                    >
                      <span className="mr-1.5 text-muted">{item.category}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!voice.supported ? (
              <p className="mt-2 font-mono text-[11px] text-muted">Voice input needs a Chromium browser — type your direction or use the presets.</p>
            ) : (
              <p className="mt-2 font-mono text-[11px] text-muted">
                Tap mic again to append more direction. Text wraps and scrolls after ~4 lines.
              </p>
            )}
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
                  disabled={draftState === "drafting" || operationActive}
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

      {operationActive ? <OperationCurtain title={operationTitle} detail={operationDetail} /> : null}
      {uiNotice ? <ToastNotice notice={uiNotice} onClose={() => setUiNotice(null)} /> : null}
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

function OperationPlaceholder({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-md border border-accent/30 bg-bg/80">
      <div className="max-w-md px-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent/10">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
        <p className="mt-4 font-display text-3xl text-text">{title || "Tell is working"}</p>
        <p className="mt-2 text-sm text-secondary">{detail || "Preparing the next rendered surface…"}</p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">previous capture hidden while this runs</p>
      </div>
    </div>
  );
}

function OperationCurtain({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="fixed inset-0 z-40 bg-bg/45 backdrop-blur-[2px]" aria-live="polite" aria-busy="true">
      <div className="absolute left-1/2 top-5 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-card border border-accent/40 bg-surface-raised p-4 shadow-signal">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          </span>
          <div>
            <p className="font-mono text-sm text-text">{title || "Tell is working"}</p>
            <p className="mt-1 text-sm text-secondary">{detail || "Please wait while the current operation finishes."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToastNotice({ notice, onClose }: { notice: UiNotice; onClose: () => void }) {
  const tone =
    notice.tone === "success"
      ? "border-ok/40 bg-ok/10 text-ok"
      : notice.tone === "error"
        ? "border-drift/40 bg-drift/10 text-drift"
        : "border-accent/40 bg-accent/10 text-accent";
  const Icon = notice.tone === "success" ? Check : notice.tone === "error" ? AlertTriangle : Loader2;
  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-card border p-4 shadow-signal ${tone}`} role={notice.tone === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${notice.tone === "info" ? "animate-spin" : ""}`} />
        <div className="min-w-0">
          <p className="font-mono text-sm text-text">{notice.title}</p>
          <p className="mt-1 text-sm text-secondary">{notice.message}</p>
        </div>
        <button onClick={onClose} className="ml-2 font-mono text-xs text-muted transition hover:text-text" aria-label="Dismiss notice">
          dismiss
        </button>
      </div>
    </div>
  );
}

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

const BAND_COPY: Record<string, string> = {
  distinctive: "distinctive",
  conservative: "competent, conservative",
  template: "template-grade",
  slop: "reads as AI-generated",
};

function AxisBar({ before, after }: { before: number; after: number }) {
  // Axes are 0..1 QUALITY (higher = better). Ghost = before, filled = after.
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/60">
      <span className="absolute inset-y-0 left-0 rounded-full bg-secondary/40" style={{ width: `${Math.round(before * 100)}%` }} />
      <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.round(after * 100)}%` }} />
    </div>
  );
}

/** Learn / show / clear the Brand DNA that the redesign steers toward and the scorecard scores against. */
function BrandDnaBar({ dna, onLearn, onClear, live }: { dna: BrandDNA | null; onLearn: () => void; onClear: () => void; live: boolean }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Brand DNA</p>
          {dna ? (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ background: dna.accent }} />
                <span className="font-mono text-[12px]">{dna.accent}</span>
              </span>
              <span className="text-muted">·</span>
              <span>{dna.displayFont} / {dna.bodyFont}</span>
              <span className="text-muted">·</span>
              <span className="font-mono text-[11px] text-muted">radius {dna.radius} · from {dna.source}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-secondary">
              No brand learned yet — Tell scores against the generic baseline. Capture a page whose look you trust, then remember it.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {dna ? (
            <button
              onClick={onClear}
              className="rounded-md border border-border px-3 py-2 font-mono text-xs text-muted transition hover:text-text"
            >
              Clear
            </button>
          ) : null}
          <button
            onClick={onLearn}
            className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent transition hover:bg-accent/20"
            title={live ? "Learn this captured page's fonts, accent, radius, and rhythm as your Brand DNA" : "Capture a page first for a real Brand DNA"}
          >
            <Fingerprint className="h-4 w-4" />
            {dna ? "Relearn from this page" : "Remember as Brand DNA"}
          </button>
        </div>
      </div>
    </section>
  );
}

/** The measured before→after genericness scorecard — the number that provably drops. */
function Scorecard({ reconciliation, live }: { reconciliation: Reconciliation; live: boolean }) {
  if (!reconciliation || !reconciliation.axes.length) return null;
  const { scoreBefore, scoreAfter, axes, scoredAgainst } = reconciliation;
  const drop = Math.max(0, scoreBefore - scoreAfter);
  return (
    <section className="rounded-card border border-accent/40 bg-surface-raised p-5 shadow-signal">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Genericness score</p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            0 = fully distinctive · lower is better · scored {scoredAgainst === "brand-dna" ? "against your Brand DNA" : "vs the generic baseline"} · docs/05 methodology
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted">{live ? "measured from your capture" : "capture to measure live"}</span>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl text-secondary line-through decoration-secondary/40">{scoreBefore}</span>
          <span className="font-mono text-secondary">→</span>
          <span className="font-display text-6xl leading-none text-accent">{scoreAfter}</span>
        </div>
        <div className="mb-1 flex flex-col">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">−{drop} points</span>
          <span className="font-mono text-[11px] text-muted">{BAND_COPY[reconciliation.scoreAfter <= 25 ? "distinctive" : reconciliation.scoreAfter <= 45 ? "conservative" : "template"]}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {axes.map((a) => (
          <div key={a.key} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text">{a.label}</span>
              <span className="font-mono text-[11px] text-muted">{a.beforeText} <span className="text-accent">→</span> {a.afterText}</span>
            </div>
            <AxisBar before={a.before} after={a.after} />
            <p className="text-[11px] text-muted">{a.rationale}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] text-muted">
        {reconciliation.elementsRestyled} real elements restyled by <span className="text-secondary">data-tell-id</span> — the preview transforms the page itself, not a filter.
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
