import { NextResponse } from "next/server";
import { TellReport } from "@tell/schema";
import { resolveShareBackend, saveSharedReport, shareBackendNote } from "@/lib/report-store";

export const runtime = "nodejs";

const MAX_SHARE_BYTES = 2_000_000;

export async function POST(request: Request) {
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > MAX_SHARE_BYTES) {
    return NextResponse.json({ error: "Report payload is too large to share." }, { status: 413 });
  }
  let body: unknown = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = TellReport.safeParse((body as { report?: unknown }).report);
  if (!parsed.success) {
    return NextResponse.json({ error: "Report payload is missing or invalid." }, { status: 400 });
  }
  const backend = resolveShareBackend();
  try {
    const id = await saveSharedReport(parsed.data);
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      id,
      url: `${origin}/report/${id}`,
      backend,
      expiresNote: shareBackendNote(backend),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not persist shared report.";
    return NextResponse.json(
      {
        error: "Could not persist shared report.",
        detail: message,
        backend,
        hint:
          backend === "neon"
            ? "Check DATABASE_URL connectivity and that the Neon project is awake."
            : backend === "blob"
              ? "Check BLOB_READ_WRITE_TOKEN and Blob store permissions."
              : "Local disk write failed — check process permissions.",
      },
      { status: 500 },
    );
  }
}
