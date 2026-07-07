"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Activity,
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Eye,
  FileCode2,
  Fingerprint,
  Github,
  GitPullRequest,
  Layers,
  Link2,
  Loader2,
  Mic,
  MicOff,
  Plus,
  RotateCcw,
  ShieldCheck,
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
import { useLlmRestyle } from "@/lib/use-llm-restyle";
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
  { key: "luxury", label: "Classic luxury" },
  { key: "brutalist", label: "Brutalist utility" },
];

type CaptureState = "idle" | "capturing" | "done";
type DraftState = "idle" | "drafting" | "ready" | "copied" | "error";
type CaptureMeta = {
  live: boolean;
  requestedUrl: string;
  capturedUrl: string;
  error?: string;
  backend?: "remote" | "local";
};
type UiNotice = { tone: "success" | "error" | "info"; title: string; message: string };
type SourceContext = {
  filesLoaded: number;
  filesDiscovered: number;
  matchedFiles: number;
  totalBytes: number;
  mode: "repo" | "capture";
};
type ProofState = "idle" | "applying" | "verifying" | "passed" | "review" | "failed" | "error";
type ProofResult = {
  status: "passed" | "review" | "failed";
  afterReport: TellReport;
  proof: {
    beforeScore: number;
    afterScore: number;
    scoreDelta: number;
    findingsBefore: number;
    findingsAfter: number;
    focusBefore: number;
    focusAfter: number;
    focusRegressed: boolean;
    screenshotsDiffer: boolean;
    structureRegressed: boolean;
    headingsBefore: number;
    headingsAfter: number;
    buttonsBefore: number;
    buttonsAfter: number;
    changedFiles: string[];
    capturedAt: string;
    url: string;
  };
};

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
    return new URL(normalizeCaptureUrl(url) || url).hostname.replace(/^www\./, "");
  } catch {
    return "this page";
  }
}

function normalizeCaptureUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:[/?#]|$)/i.test(trimmed)) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

function sameOrigin(left: string, right: string) {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return false;
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
  const [sourceContext, setSourceContext] = useState<SourceContext | null>(null);
  const [proofState, setProofState] = useState<ProofState>("idle");
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [proofError, setProofError] = useState("");
  const [directionPlan, setDirectionPlan] = useState<DirectionPlan | null>(null);
  const [directionParsing, setDirectionParsing] = useState(false);
  const [directionSource, setDirectionSource] = useState<"gemini" | "local" | null>(null);
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uiNotice, setUiNotice] = useState<UiNotice | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [sharingReport, setSharingReport] = useState(false);

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

  // v2: deterministic reconciliation ships instantly above; this fires the Gemini-refined
  // sheet in the background (debounced/abortable) and resets whenever direction/capture/DNA changes.
  const llmRestyle = useLlmRestyle({
    capture: report.capture,
    fingerprint: report.fingerprint,
    directionId,
    dna: brandDna ?? undefined,
    enabled: Boolean(report.capture.snapshotHtml),
  });

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sharedId = new URLSearchParams(window.location.search).get("report");
    if (!sharedId) return;
    fetch(`/api/reports/${sharedId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load shared report.");
        setReport(data.report);
        setSelectedId(data.report.findings[0]?.id ?? "");
        setCaptureState("done");
        setCaptureMeta({ live: false, requestedUrl: data.report.capture.url, capturedUrl: data.report.capture.url });
        showNotice({ tone: "info", title: "Shared report loaded", message: "This is a read-only handoff link." });
      })
      .catch((error) => {
        showNotice({
          tone: "error",
          title: "Shared report unavailable",
          message: error instanceof Error ? error.message : String(error),
        });
      });
  }, [showNotice]);

  const shareReport = useCallback(async () => {
    setSharingReport(true);
    try {
      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create share link.");
      setShareUrl(data.url);
      await navigator.clipboard.writeText(data.url);
      showNotice({ tone: "success", title: "Share link copied", message: data.url });
    } catch (error) {
      showNotice({
        tone: "error",
        title: "Share failed",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSharingReport(false);
    }
  }, [report, showNotice]);

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
      const rawTarget = url.trim();
      const target = normalizeCaptureUrl(rawTarget);
      if (!target) return;
      if (target !== rawTarget) setInputUrl(target);
      if (proofResult) {
        showNotice({
          tone: "error",
          title: "Resolve the visual worktree first",
          message: "Copy the verified patch or revert the temporary change before capturing another baseline.",
        });
        return;
      }
      setCaptureState("capturing");
      setCaptureNote(`Launching headless browser for ${siteLabel(target)}…`);
      setDraftError("");
      setProposal(null);
      setSourceContext(null);
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
            ? payload.meta.backend === "remote"
              ? "Capture complete — live diagnosis via capture backend."
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
        setDraftError("Network error while contacting Tell's capture API.");
        showNotice({
          tone: "error",
          title: "Capture failed",
          message: `Network error while capturing ${target}. Check the capture backend and try again.`,
        });
      }
    },
    [proofResult, showNotice],
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
      if (proofResult) {
        showNotice({
          tone: "error",
          title: "Resolve the visual worktree first",
          message: "Revert the temporary change before setting up another repository.",
        });
        return;
      }
      setSetupError("");
      setSetupStarting(true);
      setSetupJob(null);
      setSourceContext(null);
      setProofResult(null);
      setProofState("idle");
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
    [pollSetup, proofResult, showNotice],
  );

  const stopApp = useCallback(async () => {
    if (proofResult) {
      showNotice({
        tone: "error",
        title: "Proof patch is still applied",
        message: "Revert the visual worktree before stopping its dev server.",
      });
      return;
    }
    try {
      await fetch("/api/setup/stop", { method: "POST" });
    } catch {
      /* ignore */
    }
    setSetupJob(null);
    setSetupStarting(false);
  }, [proofResult, showNotice]);

  const isRepo = isGitHubRepoUrl(inputUrl);
  const normalizedInputUrl = normalizeCaptureUrl(inputUrl);
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
  const captureBelongsToSetup = Boolean(
    setupJob?.state === "ready" &&
    setupJob.url &&
    captureMeta?.live &&
    sameOrigin(report.capture.url, setupJob.url),
  );
  const needsRecapture = Boolean(
    captureMeta?.live && !isRepo && normalizedInputUrl && normalizedInputUrl !== captureMeta.requestedUrl,
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
          setupJobId: captureBelongsToSetup ? setupJob?.id : undefined,
        }),
      });
      if (!res.ok) throw new Error("redesign request failed");
      const payload = (await res.json()) as RedesignProposal & { sourceContext?: SourceContext };
      setProposal({
        ...payload,
        reconciliation: payload.reconciliation ?? reconciliation,
      });
      setSourceContext(payload.sourceContext ?? null);
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

  async function provePatch() {
    if (!proposal || !setupJob?.id || !captureBelongsToSetup) {
      await copyPatch(true);
      return;
    }
    const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
    setProofError("");
    setProofResult(null);
    setProofState("applying");
    showNotice({
      tone: "info",
      title: "Visual worktree started",
      message: `Applying ${proposal.files.length} source patch${proposal.files.length === 1 ? "" : "es"} to the disposable checkout.`,
    });
    try {
      // The endpoint applies, waits for HMR, then recaptures the running product.
      setProofState("verifying");
      const res = await fetch("/api/proof/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: setupJob.id, patch, beforeReport: report }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "The visual proof run failed.");
      const result = payload as ProofResult;
      setProofResult(result);
      setProofState(result.status);
      setSeam(50);
      showNotice({
        tone: result.status === "passed" ? "success" : result.status === "failed" ? "error" : "info",
        title: result.status === "passed" ? "Verified against rendered truth" : "Human review required",
        message: result.status === "passed"
          ? `The live recapture improved by ${Math.abs(result.proof.scoreDelta)} points with no focus regression.`
          : "Tell kept the change isolated and surfaced the measured tradeoffs for review.",
      });
    } catch (error) {
      setProofState("error");
      setProofError(error instanceof Error ? error.message : String(error));
      showNotice({
        tone: "error",
        title: "Proof run stopped",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function revertProof() {
    if (!setupJob?.id) return;
    try {
      const res = await fetch("/api/proof/revert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: setupJob.id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not revert the proof patch.");
      if (!payload.reverted) throw new Error("Tell could not find an applied proof patch to revert.");
      setProofResult(null);
      setProofState("idle");
      setProofError("");
      showNotice({
        tone: "success",
        title: "Worktree restored",
        message: "The temporary source patch was reverted. Your original repository was never touched.",
      });
    } catch (error) {
      setProofError(error instanceof Error ? error.message : String(error));
    }
  }

  function markIntentional() {
    if (!selectedFinding) return;
    setReport((current) => {
      const verdicts = current.verdicts.map((item) =>
        item.findingId === selectedFinding.id
          ? { ...item, verdict: "intentional" as const, confidence: 1, rationale: "Accepted as an intentional product decision in this review." }
          : item,
      );
      return {
        ...current,
        verdicts,
        score: {
          ...current.score,
          generic: verdicts.filter((item) => item.verdict === "generic").length,
          drift: verdicts.filter((item) => item.verdict === "drift").length,
          intentional: verdicts.filter((item) => item.verdict === "intentional").length,
          uncertain: verdicts.filter((item) => item.verdict === "uncertain").length,
        },
      };
    });
    showNotice({
      tone: "success",
      title: "Decision recorded",
      message: `${selectedFinding.detector} is now treated as intentional for this review.`,
    });
  }

  async function copyPatch(applyIntent = false) {
    if (!proposal) return;
    const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
    const cursorHandoff = [
      `Tell generated a UI fix for ${report.capture.url}.`,
      "",
      "Apply this unified diff in the matching local repository, then run the app and verify the affected route visually.",
      sourceContext?.mode === "repo"
        ? `Source context: ${sourceContext.filesLoaded}/${sourceContext.filesDiscovered} files loaded from the disposable checkout; ${sourceContext.matchedFiles} files matched rendered evidence.`
        : "Source context: generated from rendered capture only. Check paths before applying if your local repo differs.",
      "",
      "```diff",
      patch,
      "```",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(applyIntent ? cursorHandoff : patch);
      setDraftState("copied");
      setDraftError(applyIntent ? "Cursor handoff copied. Paste it into Cursor chat in the target repo and ask the Agent to apply it." : "");
      showNotice({
        tone: "success",
        title: applyIntent ? "Ready for Cursor" : "Patch copied",
        message: applyIntent
          ? "The clipboard now contains a Cursor-ready prompt plus the unified diff."
          : "The unified diff is on your clipboard.",
      });
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
            <p className="font-display text-3xl leading-none">Tell Proof</p>
            <p className="font-mono text-meta uppercase tracking-[0.12em] text-secondary">Independent visual checks for agent-built software</p>
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
        {captureState === "done" && report.findings.length > 0 ? (
          <button
            type="button"
            onClick={shareReport}
            disabled={sharingReport || operationActive}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-meta text-secondary transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" />
            {sharingReport ? "Sharing…" : shareUrl ? "Copy share link" : "Share report"}
          </button>
        ) : null}
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

      <WorkflowRail
        captured={liveCapture}
        sourceMapped={sourceContext?.mode === "repo" && sourceContext.filesLoaded > 0}
        patchReady={Boolean(proposal)}
        proofState={proofState}
      />

      {isRepo && !setupJob ? (
        <p className="mt-3 flex items-center gap-2 font-mono text-meta text-secondary">
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
        <p className="mt-3 font-mono text-meta text-muted">
          Scanned {report.capture.styles.length} elements · snapshot {Math.round((report.capture.snapshotHtml.length || 0) / 1024)}KB ·{" "}
          <span className="text-text">{report.capture.url}</span>
          {captureMeta.requestedUrl !== report.capture.url ? (
            <span className="text-drift"> · requested {captureMeta.requestedUrl}</span>
          ) : null}
        </p>
      ) : null}

      {captureMeta && !captureMeta.live ? (
        <p className="mt-3 font-mono text-meta text-drift">
          Tried <span className="text-text">{captureMeta.requestedUrl}</span> · showing offline demo fixture from{" "}
          <span className="text-text">{captureMeta.capturedUrl}</span>
          {captureMeta.backend === "local" ? " · live Vercel capture needs TELL_CAPTURE_API_URL" : null}
        </p>
      ) : null}

      <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Rendered surface</p>
            <h1 className="mt-2 max-w-3xl font-display text-6xl leading-[0.95] text-text">
              {scannedSite ? (
                <>
                  Cursor wrote the change.
                  <span className="block text-4xl text-secondary">Tell shows what survived the browser on {scannedSite}.</span>
                </>
              ) : (
                <>Your coding agent should not grade its own homework.</>
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-secondary">
              {liveCapture
                ? "Tell reads the rendered product and the source behind it, runs the candidate fix in a disposable checkout, then recaptures the app as an independent acceptance test."
                : "Paste a repository. Tell boots it, maps rendered problems to real source, runs the fix in isolation, and returns before/after evidence you can trust."}
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

          <section className="min-w-0 rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary" aria-live="polite">
                  {captureState === "capturing" ? captureNote : "Concept preview · not yet verified"}
                </p>
                {captureState !== "capturing" ? <p className="mt-1 font-mono text-meta text-muted">{scoreLine}</p> : null}
              </div>
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
                llmStatus={llmRestyle.status}
                llmSheet={llmRestyle.sheet}
                llmMode={llmRestyle.mode}
                onLlmModeChange={llmRestyle.setMode}
              />
            )}
            <p className="mt-2 font-mono text-meta text-muted">
              {operationActive
                ? "Tell is working on the requested target. The previous capture is hidden until this operation finishes."
                : liveCapture
                ? "Drag the seam · ←/→ to nudge · double-click to reset · switch directions below to re-reconcile the live page"
                : "Drag the seam · ←/→ to nudge · double-click to reset · click a proof mark to inspect its finding"}
            </p>
          </section>

          {proofResult ? (
            <VerifiedProofPanel
              baseline={report}
              result={proofResult}
              seam={seam}
              setSeam={setSeam}
              onRevert={revertProof}
              onCopy={() => { void copyPatch(); }}
            />
          ) : null}

          <BrandDnaBar dna={brandDna} onLearn={learnDna} onClear={clearDna} live={liveCapture} />

          {!proofResult ? <Scorecard reconciliation={reconciliation} live={liveCapture} /> : null}

          {!proofResult ? (
            <WhatChangedList
              notes={
                llmRestyle.mode === "ai" && llmRestyle.sheet?.notes.length
                  ? llmRestyle.sheet.notes
                  : reconciliation?.directionNotes ?? []
              }
            />
          ) : null}

          {!proofResult ? <ReconciliationTable reconciliation={reconciliation} live={liveCapture} /> : null}

          <section className="rounded-card border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-accent" />
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Voice director</p>
              </div>
              {directionPlan ? (
                <span className="font-mono text-meta text-muted">
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
                <p className="font-mono text-meta uppercase tracking-[0.14em] text-muted">Action items</p>
                <ul className="flex flex-wrap gap-2">
                  {directionPlan.actionItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-border bg-bg/70 px-2 py-2 font-mono text-meta text-secondary"
                    >
                      <span className="mr-1.5 text-muted">{item.category}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!voice.supported ? (
              <p className="mt-2 font-mono text-meta text-muted">Voice input needs a Chromium browser — type your direction or use the presets.</p>
            ) : (
              <p className="mt-2 font-mono text-meta text-muted">
                Tap mic again to append more direction. Text wraps and scrolls after ~4 lines.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
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
            <section className="min-w-0 rounded-card border border-accent/40 bg-surface-raised p-5 shadow-signal">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-mono text-lg">{selectedFinding.detector}</h2>
                <VerdictBadge verdict={verdict.verdict} />
              </div>
              <ConfidenceMeter value={verdict.confidence} />
              <p className="mt-4 text-secondary">{verdict.rationale}</p>
              <div className="mt-5 overflow-hidden rounded-md border border-border bg-bg p-4">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Evidence</p>
                {selectedFinding.evidence.map((evidence) => (
                  <p key={`${evidence.label}-${evidence.value}`} className="mt-2 break-words font-mono text-sm text-secondary">
                    <span className="text-accent">⊕</span> {evidence.label}: {evidence.value}
                  </p>
                ))}
                {report.capture.stateShots.length > 0 ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="font-mono text-meta uppercase tracking-[0.14em] text-muted">State probes</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.capture.stateShots.slice(0, 9).map((shot) => (
                        <figure key={`${shot.selector}-${shot.state}`} className="rounded border border-border bg-surface p-1.5">
                          <img
                            alt={`${shot.selector} ${shot.state}`}
                            src={`data:image/png;base64,${shot.imageBase64}`}
                            className="h-14 max-w-[120px] object-contain"
                          />
                          <figcaption className="mt-1 text-center font-mono text-meta text-muted">{shot.state}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={draftFix}
                  disabled={draftState === "drafting" || operationActive}
                  className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
                >
                  <Wand2 className="h-4 w-4" /> {draftState === "drafting" ? "Mapping source…" : setupJob?.state === "ready" ? "Plan source fix" : "Draft fix"}
                </button>
                <button onClick={markIntentional} className="rounded-md border border-border px-4 py-2 text-secondary transition hover:text-text">Mark intentional</button>
              </div>
              {draftError ? <p className="mt-3 font-mono text-xs text-drift">{draftError}</p> : null}
              {proposal ? (
                <DiffViewer
                  proposal={proposal}
                  draftState={draftState}
                  sourceContext={sourceContext}
                  proofState={proofState}
                  proofError={proofError}
                  canProve={captureBelongsToSetup}
                  onCopy={() => copyPatch()}
                  onApply={provePatch}
                />
              ) : null}
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

function WorkflowRail({
  captured,
  sourceMapped,
  patchReady,
  proofState,
}: {
  captured: boolean;
  sourceMapped: boolean;
  patchReady: boolean;
  proofState: ProofState;
}) {
  const proofDone = proofState === "passed" || proofState === "review" || proofState === "failed";
  const steps = [
    { label: "Observe", detail: "Rendered browser truth", done: captured, active: !captured },
    { label: "Match", detail: "Rank relevant source context", done: sourceMapped, active: captured && !sourceMapped },
    { label: "Repair", detail: "Disposable checkout", done: patchReady, active: sourceMapped && !patchReady },
    { label: "Check", detail: "Single-route live recapture", done: proofDone, active: patchReady && !proofDone },
  ];
  return (
    <div className="mt-4 grid overflow-hidden rounded-card border border-border bg-surface md:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.label} className={`relative px-4 py-3 ${index ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
          <div className="flex items-center gap-2">
            <span className={`grid h-5 w-5 place-items-center rounded-full border font-mono text-meta ${
              step.done
                ? "border-ok/50 bg-ok/10 text-ok"
                : step.active
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border text-muted"
            }`}>
              {step.done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className={`font-mono text-xs uppercase tracking-[0.12em] ${step.done || step.active ? "text-text" : "text-muted"}`}>{step.label}</span>
            {step.active ? <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> : null}
          </div>
          <p className="mt-1 pl-7 text-xs text-muted">{step.detail}</p>
        </div>
      ))}
    </div>
  );
}

function OperationPlaceholder({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-md border border-accent/30 bg-bg/80">
      <div className="max-w-md px-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent/10">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
        <p className="mt-4 font-display text-3xl text-text">{title || "Tell is working"}</p>
        <p className="mt-2 text-sm text-secondary">{detail || "Preparing the next rendered surface…"}</p>
        <p className="mt-4 font-mono text-meta uppercase tracking-[0.14em] text-muted">previous capture hidden while this runs</p>
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
            <span className="rounded-full border border-border px-2 py-1 font-mono text-meta text-secondary">{job.detected.framework}</span>
          ) : null}
          {job.detected?.runCmd ? (
            <span className="rounded-full border border-border px-2 py-1 font-mono text-meta text-secondary">{job.detected.runCmd}</span>
          ) : null}
          {ready && job.url ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-ok/40 bg-ok/10 px-2 py-1 font-mono text-meta text-ok">
              <ExternalLink className="h-3 w-3" /> {job.url}
            </a>
          ) : null}
          {ready ? (
            <button onClick={onStop} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-meta text-secondary transition hover:text-text">
              <Square className="h-3 w-3" /> Stop app
            </button>
          ) : null}
          {(manual || job.state === "error") ? (
            <button onClick={onRetry} className="rounded-md border border-border px-2 py-1 font-mono text-meta text-secondary transition hover:text-text">Retry</button>
          ) : null}
        </div>
      </div>

      {job.logs.length ? (
        <details className="mt-3" open={active || job.state === "error"}>
          <summary className="flex cursor-pointer items-center gap-2 font-mono text-meta uppercase tracking-[0.14em] text-muted">
            <TerminalSquare className="h-3.5 w-3.5" /> Setup log
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-meta leading-relaxed text-secondary">
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
              <p className="font-mono text-meta uppercase tracking-[0.14em] text-muted">From the README</p>
              <ul className="mt-1 space-y-1">
                {job.detected.readmeInstructions.map((line) => (
                  <li key={line} className="font-mono text-label text-secondary">$ {line}</li>
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
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-meta text-secondary transition hover:border-accent hover:text-accent disabled:opacity-50"
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
              className={`max-w-[240px] truncate rounded-full border px-3 py-2 font-mono text-xs transition disabled:opacity-50 ${
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
      <p className="mt-2 font-mono text-meta text-muted">
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
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ background: dna.accent }} />
                <span className="font-mono text-label">{dna.accent}</span>
              </span>
              <span className="text-muted">·</span>
              <span>{dna.displayFont} / {dna.bodyFont}</span>
              <span className="text-muted">·</span>
              <span className="font-mono text-meta text-muted">radius {dna.radius} · from {dna.source}</span>
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
          <p className="mt-1 font-mono text-meta text-muted">
            0 = fully distinctive · lower is better · scored {scoredAgainst === "brand-dna" ? "against your Brand DNA" : "vs the generic baseline"} · docs/05 methodology
          </p>
        </div>
        <span className="font-mono text-meta text-muted">{live ? "measured from your capture" : "capture to measure live"}</span>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl text-secondary line-through decoration-secondary/40">{scoreBefore}</span>
          <span className="font-mono text-secondary">→</span>
          <span className="font-display text-6xl leading-none text-accent">{scoreAfter}</span>
        </div>
        <div className="mb-1 flex flex-col">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">−{drop} points</span>
          <span className="font-mono text-meta text-muted">{BAND_COPY[reconciliation.scoreAfter <= 25 ? "distinctive" : reconciliation.scoreAfter <= 45 ? "conservative" : "template"]}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {axes.map((a) => (
          <div key={a.key} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text">{a.label}</span>
              <span className="font-mono text-meta text-muted">{a.beforeText} <span className="text-accent">→</span> {a.afterText}</span>
            </div>
            <AxisBar before={a.before} after={a.after} />
            <p className="text-meta text-muted">{a.rationale}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-meta text-muted">
        {reconciliation.elementsRestyled} real elements restyled by <span className="text-secondary">data-tell-id</span> — the preview transforms the page itself, not a filter.
      </p>
    </section>
  );
}

/** Compact "what the direction actually did" bullets — narration for the demo, not a diff. */
function WhatChangedList({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">What changed</p>
      <ul className="mt-2 space-y-1.5">
        {notes.map((note, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReconciliationTable({ reconciliation, live }: { reconciliation: Reconciliation; live: boolean }) {
  if (!reconciliation) return null;
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Reconciliation · {reconciliation.label}</p>
        <span className="font-mono text-meta text-muted">{live ? "grounded in your captured tokens" : "capture a page to ground this"}</span>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-bg/60 font-mono text-meta uppercase tracking-[0.12em] text-muted">
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
                  {row.note ? <p className="mt-0.5 text-meta text-muted">{row.note}</p> : null}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-label text-secondary">
                    {row.swatchBefore ? <span className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: row.swatchBefore }} /> : null}
                    {row.before}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-label text-text">
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

function VerifiedProofPanel({
  baseline,
  result,
  seam,
  setSeam,
  onRevert,
  onCopy,
}: {
  baseline: TellReport;
  result: ProofResult;
  seam: number;
  setSeam: (value: number) => void;
  onRevert: () => void;
  onCopy: () => void;
}) {
  const { proof } = result;
  const improved = proof.scoreDelta < 0;
  const tone = result.status === "passed"
    ? "border-ok/50"
    : result.status === "failed"
      ? "border-drift/50"
      : "border-accent/40";
  const afterClip = `polygon(${seam}% 0, 100% 0, 100% 100%, ${seam}% 100%)`;

  return (
    <section className={`overflow-hidden rounded-card border bg-surface-raised shadow-signal ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 grid h-9 w-9 place-items-center rounded-full border ${
            result.status === "passed" ? "border-ok/50 bg-ok/10 text-ok" : "border-accent/40 bg-accent/10 text-accent"
          }`}>
            {result.status === "passed" ? <ShieldCheck className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-secondary">Independent visual proof</p>
            <h2 className="mt-1 font-display text-3xl text-text">
              {result.status === "passed" ? "Passed this visual check." : "The code ran. The evidence needs judgment."}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-secondary">
              Two separate browser captures from the running checkout. The after side is rendered source—not a CSS simulation.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 font-mono text-xs font-semibold text-white transition hover:bg-accent-hover"
          >
            <Clipboard className="h-3.5 w-3.5" /> Copy verified patch
          </button>
          <button
            onClick={onRevert}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-xs text-secondary transition hover:border-drift hover:text-text"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert worktree
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-b border-border md:grid-cols-4">
        <ProofMetric label="Genericness" before={String(proof.beforeScore)} after={String(proof.afterScore)} good={improved} />
        <ProofMetric
          label="Structure"
          before={`${proof.headingsBefore}h · ${proof.buttonsBefore}b`}
          after={`${proof.headingsAfter}h · ${proof.buttonsAfter}b`}
          good={!proof.structureRegressed}
        />
        <ProofMetric label="Focus coverage" before={`${Math.round(proof.focusBefore * 100)}%`} after={`${Math.round(proof.focusAfter * 100)}%`} good={!proof.focusRegressed} />
        <div className="px-4 py-3">
          <p className="font-mono text-meta uppercase tracking-[0.14em] text-muted">Verdict</p>
          <p className={`mt-1 flex items-center gap-2 font-mono text-sm uppercase ${
            result.status === "passed" ? "text-ok" : result.status === "failed" ? "text-drift" : "text-accent"
          }`}>
            {result.status === "passed" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {result.status}
          </p>
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 font-mono text-meta uppercase tracking-[0.14em] text-muted">
          Scope · 1 route · {baseline.capture.viewport.width}×{baseline.capture.viewport.height} · default rendered state
        </p>
        <div className="relative h-[500px] overflow-hidden rounded-md border border-border bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${baseline.capture.screenshotBase64}`}
            alt="Baseline browser capture"
            className="absolute left-0 top-0 h-auto w-full bg-white"
          />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: afterClip, WebkitClipPath: afterClip }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${result.afterReport.capture.screenshotBase64}`}
              alt="Verified browser capture after source patch"
              className="h-auto w-full bg-white"
            />
          </div>
          <span className="absolute bottom-0 top-0 z-10 w-px bg-accent" style={{ left: `${seam}%` }} />
          <span className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 font-mono text-meta uppercase tracking-[0.14em] text-white">Baseline</span>
          <span className="absolute right-3 top-3 z-10 rounded bg-black/70 px-2 py-1 font-mono text-meta uppercase tracking-[0.14em] text-white">Recaptured source</span>
          <input
            type="range"
            min={0}
            max={100}
            value={seam}
            onChange={(event) => setSeam(Number(event.target.value))}
            aria-label="Compare baseline and verified capture"
            className="absolute bottom-4 left-1/2 z-20 w-48 -translate-x-1/2 accent-[rgb(var(--accent))]"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-meta text-muted">
            Verified {new Date(proof.capturedAt).toLocaleTimeString()} · {proof.url}
          </p>
          <div className="flex flex-wrap gap-2">
            {proof.changedFiles.map((file) => (
              <span key={file} className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-2 py-1 font-mono text-meta text-secondary">
                <FileCode2 className="h-3 w-3 text-accent" /> {file}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofMetric({ label, before, after, good }: { label: string; before: string; after: string; good: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="font-mono text-meta uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm text-secondary">
        {before} <span className={good ? "text-ok" : "text-drift"}>→ {after}</span>
      </p>
    </div>
  );
}

function DiffViewer({
  proposal,
  draftState,
  sourceContext,
  proofState,
  proofError,
  canProve,
  onCopy,
  onApply,
}: {
  proposal: RedesignProposal;
  draftState: DraftState;
  sourceContext: SourceContext | null;
  proofState: ProofState;
  proofError: string;
  canProve: boolean;
  onCopy: () => void;
  onApply: () => void;
}) {
  const patch = proposal.files.map((file) => file.unifiedDiff).join("\n\n");
  const proving = proofState === "applying" || proofState === "verifying";

  return (
    <section className="mt-5 min-w-0 overflow-hidden rounded-md border border-border bg-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {sourceContext?.mode === "repo" ? "Source-grounded patch" : "Cursor patch"} · {proposal.files.length} file{proposal.files.length === 1 ? "" : "s"}
          </p>
          <p className="mt-1 break-words text-sm text-secondary">{proposal.files[0]?.summary}</p>
          {sourceContext?.mode === "repo" ? (
            <p className="mt-1 break-words font-mono text-meta text-muted">
              Read {sourceContext.filesLoaded}/{sourceContext.filesDiscovered} project files · evidence matched {sourceContext.matchedFiles} · {Math.round(sourceContext.totalBytes / 1024)}KB context
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-xs text-secondary transition hover:text-text">
            <Clipboard className="h-3.5 w-3.5" /> {draftState === "copied" ? "Copied" : "Copy patch"}
          </button>
          <button
            onClick={onApply}
            disabled={proving || proofState === "passed" || proofState === "review" || proofState === "failed"}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 font-mono text-xs font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {proving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : canProve ? <ShieldCheck className="h-3.5 w-3.5" /> : <GitPullRequest className="h-3.5 w-3.5" />}
            {proofState === "applying"
              ? "Applying in worktree…"
              : proofState === "verifying"
                ? "Recapturing…"
                : canProve
                  ? "Run & prove"
                  : "Send to Cursor"}
          </button>
        </div>
      </div>
      {canProve ? (
        <div className="flex items-center gap-2 border-b border-border bg-ok/5 px-4 py-2 font-mono text-meta text-secondary">
          <ShieldCheck className="h-3.5 w-3.5 text-ok" />
          Applies only to Tell&apos;s disposable clone · hot reloads · captures again · checks score and focus states
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-border bg-accent/5 px-4 py-2 font-mono text-meta text-secondary">
          <GitPullRequest className="h-3.5 w-3.5 text-accent" />
          Send to Cursor copies a prompt plus diff for the local repo. No fragile editor deep link required.
        </div>
      )}
      {proofError ? <p className="border-b border-drift/30 bg-drift/10 px-4 py-2 font-mono text-meta text-drift">{proofError}</p> : null}
      <pre className="max-h-80 overflow-auto p-4 text-left font-mono text-meta leading-relaxed text-secondary">
        <code>{patch}</code>
      </pre>
    </section>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const icon = verdict === "intentional" ? <Check className="h-3 w-3" /> : verdict === "drift" ? <Split className="h-3 w-3" /> : <Eye className="h-3 w-3" />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-meta uppercase tracking-[0.12em] ${badgeStyles[verdict]}`}>
      {icon}
      {verdict}
    </span>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="font-mono text-meta uppercase tracking-[0.12em] text-muted">confidence</span>
      <div className="flex gap-1" aria-label={`Confidence ${Math.round(value * 100)}%`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-2 w-4 rounded-sm ${i < filled ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}
