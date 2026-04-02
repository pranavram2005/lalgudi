-- Run this ONCE in your Supabase SQL Editor (Database > SQL Editor)
-- It replaces 200+ sequential HTTP requests with a single aggregated DB call,
-- making filter options instant even for 2L+ voters.

CREATE OR REPLACE FUNCTION get_voter_filter_options(
  p_role    text    DEFAULT NULL,
  p_booth   text    DEFAULT NULL,
  p_ward    text    DEFAULT NULL,
  p_wards   text[]  DEFAULT NULL
)
RETURNS TABLE (
  constituency  text,
  division      text,
  ward          text,
  village       text,
  part          text,
  gender        text,
  voter_count   bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(constituency, '')::text  AS constituency,
    COALESCE(division, '')::text      AS division,
    COALESCE(ward, '')::text          AS ward,
    COALESCE(village, '')::text       AS village,
    COALESCE(part::text, '')          AS part,
    COALESCE(gender, '')::text        AS gender,
    COUNT(*)::bigint                  AS voter_count
  FROM voters
  WHERE
    CASE
      WHEN p_role = 'booth_agent' AND p_booth IS NOT NULL THEN part::text = p_booth
      WHEN p_role = 'ward_agent'  AND p_ward  IS NOT NULL THEN ward = p_ward
      WHEN p_role = 'zonal_agent' AND p_wards IS NOT NULL THEN ward = ANY(p_wards)
      ELSE TRUE
    END
  GROUP BY constituency, division, ward, village, part, gender
$$;
