import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Map Supabase snake_case columns → app field names
function mapRow(row) {
  return {
    'S.No':                    row.s_no,
    'One Roof':                row.one_roof,
    'One Roof Running Number': row.one_roof_running_number,
    'Position':                row.position,
    'Name':                    row.name,
    'Relation Type':           row.relation_type,
    'Relative Name':           row.relative_name,
    'House No':                row.house_no,
    'Age':                     row.age,
    'Gender':                  row.gender,
    'ID Code':                 row.id_code,
    'Photo':                   row.photo,
    'Page':                    row.page,
    'Constituency':            row.constituency,
    'Division':                row.division,
    'Village':                 row.village,
    'Ward':                    row.ward,
    'Part':                    row.part,
    'Roof_Key':                row.roof_key,
    notes:                     row.notes || '',
  }
}

// App field name → Supabase column name (for ORDER BY)
const SORT_COL = {
  'S.No':                    's_no',
  'ID Code':                 'id_code',
  'Name':                    'name',
  'Age':                     'age',
  'Gender':                  'gender',
  'Village':                 'village',
  'One Roof':                'one_roof',
  'One Roof Running Number': 'one_roof_running_number',
}

/**
 * Fetch a single page of voters with server-side filtering + sorting.
 * Returns { rows, total } where total is the count of matching rows.
 *
 * agentScope: { role, booth_number, ward, wards } — restricts rows to the
 * agent's assigned area. Pass null for superadmin (no restriction).
 */
export async function fetchVoters({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = {},
  agentScope = null,
} = {}) {
  let q = supabase.from('voters').select('*', { count: 'exact' })

  if (agentScope) {
    if (agentScope.role === 'booth_agent' && agentScope.booth_number) {
      q = q.eq('part', String(agentScope.booth_number))
    } else if (agentScope.role === 'ward_agent' && agentScope.ward) {
      q = q.eq('ward', agentScope.ward)
    } else if (agentScope.role === 'zonal_agent' && agentScope.wards?.length) {
      q = q.in('ward', agentScope.wards)
    }
  }
  if (filters.constituency)       q = q.eq('constituency', filters.constituency)
  if (filters.division?.length)   q = q.in('division', filters.division)
  if (filters.ward?.length)       q = q.in('ward', filters.ward)
  if (filters.village?.length)    q = q.in('village', filters.village)
  if (filters.gender)             q = q.eq('gender', filters.gender)
  if (filters.part)               q = q.eq('part', filters.part)
  if (filters.search)             q = q.ilike('name', `%${filters.search}%`)
  if (filters.idSearch)           q = q.ilike('id_code', `%${filters.idSearch}%`)
  if (filters.houseNo)            q = q.eq('house_no', filters.houseNo)

  const col = sort.key && SORT_COL[sort.key]
  if (col) {
    q = q.order(col, { ascending: sort.dir !== -1 })
  } else {
    q = q.order('part', { ascending: true }).order('s_no', { ascending: true })
  }

  const from = (page - 1) * pageSize
  q = q.range(from, from + pageSize - 1)

  const { data, error, count } = await q
  if (error) throw error
  return { rows: data.map(mapRow), total: count ?? 0 }
}

/**
 * Fetch unique {constituency, division, ward, part} combinations from the voters
 * table. Used to build cascading dropdowns in the agent form.
 */
export async function fetchScopeRows() {
  const PAGE_SIZE = 1000
  let allRows = [], from = 0

  while (true) {
    const { data, error } = await supabase
      .from('voters')
      .select('constituency, division, ward, part')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    allRows = allRows.concat(data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  // Deduplicate by a composite key
  const seen = new Set()
  return allRows.filter(r => {
    const key = `${r.constituency}|${r.division}|${r.ward}|${r.part}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Shared: build the final options object from a deduplicated locMap + genderCounts.
 */
function buildVoterOptions(locMap, genderCounts) {
  const dedupedRaw = Object.values(locMap)

  const makeFromRaw = (field) => {
    const counts = {}
    dedupedRaw.forEach(row => {
      const val = row[field]; if (!val) return
      counts[val] = (counts[val] || 0) + (row._count || 1)
    })
    return Object.entries(counts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => String(a.label).localeCompare(String(b.label)))
  }

  return {
    constituency: makeFromRaw('constituency'),
    division:     makeFromRaw('division'),
    ward:         makeFromRaw('ward'),
    village:      makeFromRaw('village'),
    gender:       Object.entries(genderCounts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    part:         makeFromRaw('part').sort((a, b) => Number(a.value) - Number(b.value)),
    _raw:         dedupedRaw,
  }
}

/**
 * Fetch distinct filter values with counts.
 * Tries the fast RPC first (single aggregated DB call).
 * Falls back to parallel paginated fetch if the RPC isn't created yet.
 *
 * To enable the fast path: run src/scripts/create_voter_filter_options_fn.sql
 * once in your Supabase SQL Editor.
 */
export async function fetchVoterOptions(agentScope = null) {
  // ── Fast path: single aggregated RPC call ────────────────────────────────
  try {
    const { data, error } = await supabase.rpc('get_voter_filter_options', {
      p_role:  agentScope?.role  ?? null,
      p_booth: agentScope?.role === 'booth_agent' ? String(agentScope.booth_number ?? '') : null,
      p_ward:  agentScope?.role === 'ward_agent'  ? (agentScope.ward  ?? null)            : null,
      p_wards: agentScope?.role === 'zonal_agent' ? (agentScope.wards ?? null)            : null,
    })
    if (error) throw error

    const locMap = {}, genderCounts = {}
    data.forEach(row => {
      const key = `${row.division}|${row.ward}|${row.village}|${row.part}`
      if (!locMap[key]) locMap[key] = {
        constituency: row.constituency, division: row.division,
        ward: row.ward, village: row.village, part: row.part, _count: 0,
      }
      locMap[key]._count += Number(row.voter_count)
      if (row.gender) genderCounts[row.gender] = (genderCounts[row.gender] || 0) + Number(row.voter_count)
    })
    return buildVoterOptions(locMap, genderCounts)

  } catch (_) {
    // RPC not created yet — fall through to parallel fetch
  }

  // ── Fallback: parallel paginated fetch ───────────────────────────────────
  const PAGE_SIZE = 1000
  const PARALLEL  = 20   // fetch 20 pages at a time

  const applyScope = (q) => {
    if (!agentScope) return q
    if (agentScope.role === 'booth_agent' && agentScope.booth_number)
      return q.eq('part', String(agentScope.booth_number))
    if (agentScope.role === 'ward_agent' && agentScope.ward)
      return q.eq('ward', agentScope.ward)
    if (agentScope.role === 'zonal_agent' && agentScope.wards?.length)
      return q.in('ward', agentScope.wards)
    return q
  }

  // One fast HEAD request to get the total count
  const { count, error: cErr } = await applyScope(
    supabase.from('voters').select('*', { count: 'exact', head: true })
  )
  if (cErr) throw cErr

  const numPages = Math.ceil((count || 0) / PAGE_SIZE)
  const locMap = {}, genderCounts = {}

  for (let b = 0; b < numPages; b += PARALLEL) {
    const batch = []
    for (let p = b; p < Math.min(b + PARALLEL, numPages); p++) {
      const from = p * PAGE_SIZE
      batch.push(
        applyScope(supabase.from('voters').select('constituency, division, ward, village, gender, part'))
          .range(from, from + PAGE_SIZE - 1)
      )
    }
    const results = await Promise.all(batch)
    for (const { data, error } of results) {
      if (error) throw error
      for (const row of data) {
        const key = `${row.division||''}|${row.ward||''}|${row.village||''}|${row.part||''}`
        if (!locMap[key]) locMap[key] = {
          constituency: row.constituency, division: row.division,
          ward: row.ward, village: row.village, part: row.part, _count: 0,
        }
        locMap[key]._count++
        if (row.gender) genderCounts[row.gender] = (genderCounts[row.gender] || 0) + 1
      }
    }
  }

  return buildVoterOptions(locMap, genderCounts)
}

/**
 * Fetch distinct counts of wards, villages (streets), and divisions
 * from the voters table. Used by the admin dashboard.
 * Tries the fast RPC first; falls back to a direct paginated scan.
 */
export async function fetchLocationCounts(boothNumber = null) {
  try {
    const { data, error } = await supabase.rpc('get_voter_filter_options', {
      p_role:  boothNumber ? 'booth_agent' : null,
      p_booth: boothNumber ? String(boothNumber) : null,
      p_ward:  null,
      p_wards: null,
    })
    if (error) throw error

    const wards = new Set(), villages = new Set(), divisions = new Set()
    data.forEach(row => {
      if (row.ward)     wards.add(row.ward)
      if (row.village)  villages.add(row.village)
      if (row.division) divisions.add(row.division)
    })
    return { wards: wards.size, streets: villages.size, divisions: divisions.size }
  } catch (_) {
    // Fallback: direct query
    const PAGE_SIZE = 1000
    const wards = new Set(), villages = new Set(), divisions = new Set()
    let from = 0
    while (true) {
      let q = supabase.from('voters').select('ward, village, division')
      if (boothNumber) q = q.eq('part', String(boothNumber))
      const { data, error } = await q.range(from, from + PAGE_SIZE - 1)
      if (error) throw error
      data.forEach(r => {
        if (r.ward)     wards.add(r.ward)
        if (r.village)  villages.add(r.village)
        if (r.division) divisions.add(r.division)
      })
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }
    return { wards: wards.size, streets: villages.size, divisions: divisions.size }
  }
}

/**
 * Fetch all assessments for a booth agent's booth (for table display).
 */
export async function fetchBoothAssessments(boothNumber) {
  const { data, error } = await supabase
    .from('voter_assessments')
    .select('*')
    .eq('booth_number', String(boothNumber))
  if (error) throw error
  return data || []
}

/**
 * Upsert a single voter assessment (insert or update by voter_id_code+booth_number).
 */
export async function upsertVoterAssessment(payload) {
  const { data, error } = await supabase
    .from('voter_assessments')
    .upsert(payload, { onConflict: 'voter_id_code,booth_number' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Fetch all assessments with agent details — used by admin analysis.
 */
export async function fetchAllAssessments() {
  const { data, error } = await supabase
    .from('voter_assessments')
    .select('*, agent:agents(full_name, username, booth_number, ward, division)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch all family members sharing the same roof as a voter.
 * Matches on house_no + ward + village (street) + division to avoid
 * collisions where the same house number exists in different locations.
 */
export async function fetchFamilyMembers({ oneRoofRunningNumber, houseNo, oneRoof, ward, village, division }) {
  if (!houseNo) return []

  let q = supabase.from('voters').select('*').order('s_no', { ascending: true })

  if (oneRoofRunningNumber) {
    q = q.eq('one_roof_running_number', oneRoofRunningNumber)
  } else if (oneRoof) {
    q = q.eq('one_roof', oneRoof)
  } else {
    return []
  }

  q = q.eq('house_no', houseNo)
  if (ward)     q = q.eq('ward', ward)
  if (village)  q = q.eq('village', village)
  if (division) q = q.eq('division', division)

  const { data, error } = await q
  if (error) throw error
  return data.map(mapRow)
}
