// src/lib/supabase.js
// ...existing code...

import { supabase } from "./supabase"

/**
 * Fetch booth-wise stats from the materialized booth_stats table.
 * If boothNumber is provided, returns only that booth's stats.
 */
export async function fetchBoothStats({ boothNumber = null, constituency = null, division = null } = {}) {
  let q = supabase.from('booth_stats').select('*')
  if (boothNumber) q = q.eq('part', boothNumber)
  if (constituency) q = q.eq('constituency', constituency)
  if (division) q = q.eq('division', division)
  const { data, error } = await q
  console.log('fetchBoothStats result:', data);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchBoothStats Supabase error:', error)
    throw error
  }
  return data
}
