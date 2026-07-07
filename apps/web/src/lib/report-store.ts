import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TellReport } from "@tell/schema";
import { head, put } from "@vercel/blob";

const STORE_DIR = path.join(process.cwd(), "data", "shared-reports");
const BLOB_PREFIX = "shared-reports";

function useBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveSharedReport(report: TellReport): Promise<string> {
  const id = randomBytes(8).toString("hex");
  const payload = JSON.stringify(report);

  if (useBlobStore()) {
    await put(`${BLOB_PREFIX}/${id}.json`, payload, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return id;
  }

  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(path.join(STORE_DIR, `${id}.json`), payload, "utf8");
  return id;
}

export async function loadSharedReport(id: string): Promise<TellReport | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;

  if (useBlobStore()) {
    try {
      const meta = await head(`${BLOB_PREFIX}/${id}.json`);
      const res = await fetch(meta.url);
      if (!res.ok) return null;
      return TellReport.parse(await res.json());
    } catch {
      return null;
    }
  }

  try {
    const raw = await readFile(path.join(STORE_DIR, `${id}.json`), "utf8");
    return TellReport.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
