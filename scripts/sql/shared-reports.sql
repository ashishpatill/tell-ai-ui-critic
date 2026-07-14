-- Durable shared Tell reports (Neon / Postgres).
-- Applied automatically on first share when DATABASE_URL is set.
-- You can also run this once from the Neon SQL editor.

CREATE TABLE IF NOT EXISTS shared_reports (
  id TEXT PRIMARY KEY,
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shared_reports_created_at_idx
  ON shared_reports (created_at DESC);
