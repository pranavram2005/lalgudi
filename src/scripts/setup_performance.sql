-- ============================================================
-- LALGUDI APP — Performance Setup for 2L Voters + 500 Agents
-- Run this ONCE in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ── 1. Indexes for voters table ─────────────────────────────

-- Booth agent scope filter (column: part)
CREATE INDEX IF NOT EXISTS voters_part_idx
  ON voters(part);

-- Ward/division hierarchy filters
CREATE INDEX IF NOT EXISTS voters_ward_idx
  ON voters(ward);

CREATE INDEX IF NOT EXISTS voters_division_idx
  ON voters(division);

-- House number lookup (family members feature)
CREATE INDEX IF NOT EXISTS voters_houseno_ward_idx
  ON voters(house_no, ward, village, division);

-- ── 2. Indexes for voter_assessments table ──────────────────

-- Agent assessment queries by booth
CREATE INDEX IF NOT EXISTS va_booth_number_idx
  ON voter_assessments(booth_number);

-- ── 3. Full-text name search with trigram index ─────────────
-- Speeds up: ilike '%search%' queries on the name column

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS voters_name_trgm_idx
  ON voters USING GIN (name gin_trgm_ops);

-- ── 4. RPC function for filter options (single DB call) ─────
-- Already in create_voter_filter_options_fn.sql — run that too
-- if you haven't already.

-- ── 5. Materialized view refresh via pg_cron ────────────────
-- Keeps booth_stats up to date without triggering refresh on
-- every assessment write (which causes lock contention at scale).
--
-- Requires pg_cron extension — enable it in Supabase:
--   Dashboard → Database → Extensions → Enable "pg_cron"
--
-- Then run:
--
-- SELECT cron.schedule(
--   'refresh-booth-stats',
--   '*/5 * * * *',           -- every 5 minutes
--   $$REFRESH MATERIALIZED VIEW CONCURRENTLY booth_stats$$
-- );
--
-- Note: CONCURRENTLY requires a UNIQUE index on booth_stats.
-- If your view doesn't have one yet, use without CONCURRENTLY:
--
-- SELECT cron.schedule(
--   'refresh-booth-stats',
--   '*/5 * * * *',
--   $$REFRESH MATERIALIZED VIEW booth_stats$$
-- );
