"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TellReport } from "@tell/schema";

export default function SharedReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<TellReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load report.");
        setReport(data.report);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [params.id]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 font-sans text-text">
        <p className="text-drift">{error}</p>
        <Link href="/" className="mt-4 inline-block text-accent underline">Back to Tell Proof</Link>
      </main>
    );
  }

  if (!report) {
    return <main className="px-6 py-16 font-mono text-secondary">Loading shared report…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 font-sans text-text">
      <header className="mb-8 border-b border-border pb-4">
        <p className="font-mono text-meta uppercase tracking-[0.14em] text-secondary">Shared Tell Proof report</p>
        <h1 className="mt-2 font-display text-3xl">{report.capture.url}</h1>
        <p className="mt-2 font-mono text-label text-muted">
          {report.score.total} findings · {report.score.generic} generic · {report.score.drift} drift
        </p>
        <Link href="/" className="mt-4 inline-block font-mono text-label text-accent underline">Open in Tell Proof</Link>
      </header>

      <section className="grid gap-4">
        {report.findings.map((finding) => {
          const verdict = report.verdicts.find((v) => v.findingId === finding.id);
          return (
            <article key={finding.id} className="rounded-card border border-border bg-surface p-4">
              <h2 className="font-mono text-label font-semibold uppercase tracking-[0.12em] text-accent">
                {finding.detector} · {verdict?.verdict ?? finding.verdictHint}
              </h2>
              <p className="mt-2 text-sm text-secondary">{verdict?.rationale}</p>
              <ul className="mt-3 space-y-1 font-mono text-meta text-muted">
                {finding.evidence.map((ev) => (
                  <li key={`${ev.label}-${ev.value}`}>{ev.label}: {ev.value}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      {report.capture.stateShots.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-mono text-label uppercase tracking-[0.14em] text-secondary">State probes</h2>
          {report.capture.stateShots.some((shot) => shot.imageBase64) ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {report.capture.stateShots.filter((shot) => shot.imageBase64).map((shot) => (
                <figure key={`${shot.selector}-${shot.state}`} className="rounded-md border border-border bg-bg p-2">
                  <img
                    alt={`${shot.selector} ${shot.state}`}
                    src={`data:image/png;base64,${shot.imageBase64}`}
                    className="h-16 w-auto max-w-[140px] object-contain"
                  />
                  <figcaption className="mt-1 font-mono text-meta text-muted">{shot.state}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {report.capture.stateShots.map((shot) => (
                <li key={`${shot.selector}-${shot.state}`} className="rounded-full border border-border px-3 py-1 font-mono text-meta text-secondary">
                  {shot.selector} · {shot.state}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
