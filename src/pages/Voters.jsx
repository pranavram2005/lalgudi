import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { C } from '../data'
import { Footer } from '../components/ui'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useAuth } from '../context/AuthContext'
import { fetchVoters, fetchVoterOptions, fetchFamilyMembers, fetchBoothAssessments, upsertVoterAssessment, fetchAllAssessments } from '../lib/supabase'

const NEED_OPTIONS = [
  { value: 'medical',   en: 'Medical Needs',     ta: 'மருத்துவ தேவைகள்' },
  { value: 'jobs',      en: 'Job Opportunities',  ta: 'வேலை வாய்ப்புகள்' },
  { value: 'financial', en: 'Financial Needs',    ta: 'நிதி தேவைகள்' },
  { value: 'education', en: 'Educational Needs',  ta: 'கல்வி தேவைகள்' },
  { value: 'others',    en: 'Other Needs',        ta: 'மற்ற தேவைகள்' },
]

const PARTY_OPTIONS = [
  { value: 'AIADMK',  label: 'AIADMK',  color: '#059669', bg: '#d1fae5' },
  { value: 'DMK',     label: 'DMK',     color: '#dc2626', bg: '#fee2e2' },
  { value: 'TVK',     label: 'TVK',     color: '#2563eb', bg: '#dbeafe' },
  { value: 'BJP',     label: 'BJP',     color: '#ea580c', bg: '#ffedd5' },
  { value: 'INC',     label: 'INC',     color: '#0284c7', bg: '#e0f2fe' },
  { value: 'DMDK',    label: 'DMDK',    color: '#7c3aed', bg: '#ede9fe' },
  { value: 'PMK',     label: 'PMK',     color: '#d97706', bg: '#fef3c7' },
  { value: 'NTK',     label: 'NTK',     color: '#be185d', bg: '#fce7f3' },
  { value: 'Others',  label: 'Others',  color: '#64748b', bg: '#f1f5f9' },
]

const getVoterId = (row = {}) => {
  const code = row['ID Code'] || row['id'] || row['ID']
  if (code) return String(code)
  const serial = row['S.No'] || row['serial']
  return serial ? String(serial) : undefined
}

const loadChecklistData = () => {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '{}') }
  catch { return {} }
}

const persistChecklistData = (payload) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(payload))
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────

const Btn = ({ children, onClick, variant = 'o', style }) => {
  const styles = {
    g: { background: C.g600, color: '#fff', border: 'none' },
    o: { background: 'transparent', color: C.ink3, border: `1px solid ${C.line}` },
  }
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: "'Outfit',sans-serif", fontSize: '.68rem', fontWeight: 700,
      letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
      transition: 'all .15s', whiteSpace: 'nowrap',
      ...styles[variant], ...style,
    }}>
      {children}
    </button>
  )
}

const MultiSelect = ({ options = [], selected, onChange, filterName }) => (
  <div style={{
    maxHeight: 160, overflowY: 'auto', padding: 8,
    background: C.white, border: `1px solid ${C.line}`, borderRadius: 6,
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6,
  }}>
    {options.map(({ value, label, count }) => (
      <label key={value} style={{
        display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
        padding: '3px 5px', borderRadius: 4, fontSize: '12px', color: C.ink,
      }}>
        <input type="checkbox" checked={selected.includes(value)} onChange={() => onChange(value)}
          style={{ accentColor: C.g600, flexShrink: 0 }} />
        <span style={{ lineHeight: 1.3 }}>
          {label}{count ? ` (${count})` : ''}
        </span>
      </label>
    ))}
  </div>
)

const FilterField = ({ title, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <span style={{
      fontFamily: "'Outfit',sans-serif", fontSize: '.6rem', fontWeight: 700,
      letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3,
    }}>
      {title}
    </span>
    {children}
  </div>
)

// ─── PAGINATION ───────────────────────────────────────────────────────────────

const Pagination = ({ page, totalPages, pageSize, onPageChange, onPageSizeChange, total, filtered, t }) => {
  const W = 2
  let start = Math.max(1, page - W)
  let end = Math.min(totalPages, page + W)
  if (end - start < 2 * W) {
    if (start === 1) end = Math.min(totalPages, 1 + 2 * W)
    else if (end === totalPages) start = Math.max(1, totalPages - 2 * W)
  }
  start = Math.max(1, start)
  end = Math.min(totalPages, end)

  // Always show page 1, last page, and a window around current page
  const pages = []
  if (totalPages <= 2 * W + 3) {
    for (let p = 1; p <= totalPages; p++) pages.push(p)
  } else {
    pages.push(1)
    if (start > 2) pages.push('…')
    for (let p = Math.max(2, start); p <= Math.min(totalPages - 1, end); p++) pages.push(p)
    if (end < totalPages - 1) pages.push('…')
    pages.push(totalPages)
  }

  const from = totalPages === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered)

  const pgBtn = (active, disabled) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: 34, minWidth: 34, padding: '0 10px',
    borderRadius: 8,
    fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', fontWeight: active ? 700 : 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all .12s', border: 'none', outline: 'none',
    background: active ? C.g700 : disabled ? 'transparent' : 'transparent',
    color: active ? '#fff' : disabled ? C.ink4 : C.ink3,
    boxShadow: active ? `0 2px 8px ${C.g700}55` : 'none',
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      padding: '12px 20px',
      background: `linear-gradient(to right, ${C.line2}, ${C.white})`,
      borderTop: `2px solid ${C.g200 || C.line}`,
    }}>
      {/* Rows per page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.75rem', color: C.ink3 }}>
        <span style={{ fontWeight: 500 }}>{t('Rows', 'வரிசைகள்')}</span>
        <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))} style={{
          background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 7,
          padding: '5px 10px', fontSize: '.78rem', fontWeight: 600,
          color: C.ink, outline: 'none', cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif",
        }}>
          {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{ fontSize: '.7rem', color: C.ink4 }}>{t('per page', 'பக்கத்திற்கு')}</span>
      </div>

      {/* Page buttons */}
      <div style={{
        display: 'flex', gap: 2, alignItems: 'center',
        background: C.white, border: `1.5px solid ${C.line}`,
        borderRadius: 10, padding: '3px 5px',
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      }}>
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          style={pgBtn(false, page === 1)} title="First page">«</button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          style={pgBtn(false, page === 1)} title="Previous">‹</button>

        <div style={{ width: 1, height: 20, background: C.line, margin: '0 2px' }} />

        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} style={{
                width: 30, textAlign: 'center', color: C.ink4,
                fontSize: '.85rem', letterSpacing: 2, userSelect: 'none',
              }}>···</span>
            : <button key={p} onClick={() => onPageChange(p)}
                style={pgBtn(page === p, false)}>{p}</button>
        )}

        <div style={{ width: 1, height: 20, background: C.line, margin: '0 2px' }} />

        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages || !totalPages}
          style={pgBtn(false, page === totalPages || !totalPages)} title="Next">›</button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages || !totalPages}
          style={pgBtn(false, page === totalPages || !totalPages)} title="Last page">»</button>
      </div>

      {/* Range info */}
      <div style={{
        fontSize: '.78rem', color: C.ink3, fontFamily: "'Outfit',sans-serif",
        background: C.white, border: `1.5px solid ${C.line}`,
        borderRadius: 7, padding: '5px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      }}>
        {filtered === 0
          ? <span style={{ color: C.ink4 }}>{t('No results', 'முடிவு இல்லை')}</span>
          : <>
              <strong style={{ color: C.g700 }}>{from.toLocaleString()}</strong>
              <span style={{ margin: '0 3px', color: C.ink4 }}>–</span>
              <strong style={{ color: C.g700 }}>{to.toLocaleString()}</strong>
              <span style={{ margin: '0 5px', color: C.ink4 }}>{t('of', 'இல்')}</span>
              <strong style={{ color: C.ink }}>{filtered.toLocaleString()}</strong>
              {total !== filtered && (
                <span style={{ color: C.ink4, fontSize: '.7rem', marginLeft: 5 }}>
                  ({t('filtered', 'வடிகட்டப்பட்டது')})
                </span>
              )}
            </>
        }
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Voters() {
  const { t } = useLang()
  const { isTablet } = useBreakpoint()
  const { user } = useAuth()
  const isAgentView  = user !== null && user?.role !== 'superadmin'
  const isBoothAgent = user?.role === 'booth_agent'

  // ── SERVER-SIDE DATA STATE ────────────────────────────────────────────────────
  const [rows, setRows] = useState([])          // current page rows
  const [totalCount, setTotalCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [dataError, setDataError] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [valueOptions, setValueOptions] = useState({
    constituency: [], division: [], ward: [], village: [], gender: [], part: [],
  })

  const [filters, setFilters] = useState({
    constituency: '', division: [], ward: [], village: [],
    gender: '', part: '', search: '', idSearch: '', houseNo: '', remainingOnly: false,
  })
  // Debounced text — waits 400ms before triggering a new query
  const [debouncedText, setDebouncedText] = useState({ search: '', idSearch: '', houseNo: '' })
  useEffect(() => {
    const timer = setTimeout(() =>
      setDebouncedText({ search: filters.search, idSearch: filters.idSearch, houseNo: filters.houseNo }),
    400)
    return () => clearTimeout(timer)
  }, [filters.search, filters.idSearch, filters.houseNo])

  const [selectedVoter, setSelectedVoter] = useState(null)
  const [familyRoof, setFamilyRoof] = useState(null)
  const [familyRows, setFamilyRows] = useState([])
  const [familyLoading, setFamilyLoading] = useState(false)
  const [sort, setSort] = useState({ key: '', dir: 1 })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [modified, setModified] = useState(new Set())
  const [checklists,  setChecklists]  = useState({})
  const [draft,       setDraft]       = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [submitMsg,   setSubmitMsg]   = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)

  const agentScope = isAgentView ? {
    role:         user.role,
    booth_number: user.booth_number ?? null,
    ward:         user.ward         ?? null,
    wards:        user.wards        ?? [],
  } : null
  const remainingMode = isBoothAgent && filters.remainingOnly

  // Load filter options once (only 5 columns fetched across all rows)
  useEffect(() => {
    fetchVoterOptions(agentScope)
      .then(setValueOptions)
      .catch(() => {}) // non-fatal; filter dropdowns just stay empty
  }, [isAgentView]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch page whenever query params change
  useEffect(() => {
    const activeFilters = {
      ...filters,
      search: debouncedText.search,
      idSearch: debouncedText.idSearch,
      houseNo: debouncedText.houseNo,
    }

    const requestPage = remainingMode ? 1 : page
    const requestPageSize = remainingMode ? 10000 : pageSize

    if (dataLoading) {
      // First load
      fetchVoters({ page: requestPage, pageSize: requestPageSize, filters: activeFilters, sort, agentScope })
        .then(({ rows: r, total }) => { setRows(r); setTotalCount(total); setDataLoading(false) })
        .catch(err => { setDataError(err.message); setDataLoading(false) })
    } else {
      setPageLoading(true)
      fetchVoters({ page: requestPage, pageSize: requestPageSize, filters: activeFilters, sort, agentScope })
        .then(({ rows: r, total }) => { setRows(r); setTotalCount(total); setPageLoading(false) })
        .catch(err => { setDataError(err.message); setPageLoading(false) })
    }
  }, [page, pageSize, sort, filters.constituency, filters.division, filters.ward,
      filters.village, filters.gender, filters.part, filters.remainingOnly, debouncedText, isAgentView, remainingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load assessments from DB so confirmed status (green rows + ✓) shows in the table
  useEffect(() => {
    const toMap = (rows) => {
      const map = {}
      rows.forEach(r => {
        map[r.voter_id_code] = {
          need: r.need, phone: r.phone, party: r.party,
          confirmed: r.confirmed, confirmedAt: r.confirmed_at,
          agent: r.agent_username, boothNumber: r.booth_number,
          updatedAt: r.updated_at,
        }
      })
      return map
    }

    if (isBoothAgent && user?.booth_number) {
      fetchBoothAssessments(user.booth_number)
        .then(rows => setChecklists(toMap(rows)))
        .catch(() => {})
    } else if (user?.role === 'superadmin') {
      fetchAllAssessments()
        .then(rows => setChecklists(toMap(rows)))
        .catch(() => {})
    }
  }, [isBoothAgent, user?.role, user?.booth_number]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialise draft from existing data whenever the selected voter changes
  useEffect(() => {
    if (!selectedVoter) return
    const voterId = getVoterId(selectedVoter)
    setDraft(checklists[voterId] || {})
    setSubmitMsg(null)
  }, [selectedVoter]) // eslint-disable-line react-hooks/exhaustive-deps

  // voters alias so all existing downstream code (notes, modified) still works
  const voters = rows

  const selectedVoterId = selectedVoter ? getVoterId(selectedVoter) : null

  // Draft helpers (only booth agents can edit)
  const handleDraftChange = useCallback((field, value) => {
    if (!isBoothAgent) return
    setDraft(d => ({ ...d, [field]: value }))
  }, [isBoothAgent])

  const submitAssessment = useCallback(async () => {
    if (!selectedVoter || !isBoothAgent) return
    const voterId = getVoterId(selectedVoter)
    setSubmitting(true)
    setSubmitMsg(null)
    const payload = {
      voter_id_code:  voterId,
      voter_name:     selectedVoter['Name'],
      booth_number:   String(user.booth_number),
      agent_id:       user.id,
      agent_username: user.username,
      need:           draft.need     || null,
      phone:          draft.phone    || null,
      party:          draft.party    || null,
      confirmed:      Boolean(draft.confirmed),
      confirmed_at:   draft.confirmed ? (draft.confirmedAt || new Date().toISOString()) : null,
      notes:          draft.notes    || null,
      updated_at:     new Date().toISOString(),
    }
    try {
      await upsertVoterAssessment(payload)
      setChecklists(prev => ({
        ...prev,
        [voterId]: { ...draft, agent: user.username, boothNumber: user.booth_number, updatedAt: payload.updated_at },
      }))
      setSelectedVoter(null)
    } catch (err) {
      setSubmitMsg('error:' + err.message)
    }
    setSubmitting(false)
  }, [selectedVoter, isBoothAgent, draft, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Read-only summary values (for admin / non-booth-agent view)
  const selectedChecklist = selectedVoterId ? checklists[selectedVoterId] : null
  const selectedNeedOption = selectedChecklist?.need
    ? NEED_OPTIONS.find(opt => opt.value === selectedChecklist.need) : null
  const selectedNeedLabel = selectedNeedOption
    ? t(selectedNeedOption.en, selectedNeedOption.ta)
    : t('Not captured yet', 'இன்னும் பதிவு செய்யப்படவில்லை')

  const updateField = useCallback((idCode, field, val) => {
    setRows(prev => prev.map(v => v['ID Code'] === idCode ? { ...v, [field]: val } : v))
    setModified(prev => new Set([...prev, idCode]))
  }, [])

  // Filtering/sorting/pagination mostly happen server-side;
  // remainingMode applies an additional client-side checklist filter.
  const pageData = useMemo(() => {
    if (!remainingMode) return rows
    return rows.filter(v => {
      const voterId = getVoterId(v)
      const checklist = voterId ? checklists[voterId] : null
      return !checklist?.party || !checklist?.confirmed
    })
  }, [rows, remainingMode, checklists])
  const totalPages = remainingMode ? 1 : Math.ceil(totalCount / pageSize)
  const shownCount = remainingMode ? pageData.length : totalCount

  const handleRowClick = (voter) => setSelectedVoter(voter)
  const closeDetailView = () => setSelectedVoter(null)
  const handleSort = (key) => { setSort(s => ({ key, dir: s.key === key ? s.dir * -1 : 1 })); setPage(1) }
  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1) }
  const handleMultiChange = (name, val) => {
    setFilters(f => {
      const cur = f[name]
      const next = { ...f, [name]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] }
      // When division changes, clear ward/village selections that no longer apply
      if (name === 'division') {
        const validWards = new Set(
          raw.filter(r =>
            (!f.part || String(r.part) === String(f.part)) &&
            (next.division.length === 0 || next.division.includes(r.division))
          ).map(r => r.ward)
        )
        next.ward    = next.ward.filter(w => validWards.has(w))
        next.village = []
      }
      // When ward changes, clear village selections that no longer apply
      if (name === 'ward') {
        const validVillages = new Set(
          raw.filter(r =>
            (!f.part || String(r.part) === String(f.part)) &&
            (next.division.length === 0 || next.division.includes(r.division)) &&
            (next.ward.length === 0 || next.ward.includes(r.ward))
          ).map(r => r.village)
        )
        next.village = next.village.filter(v => validVillages.has(v))
      }
      return next
    })
    setPage(1)
  }

  // When booth changes, reset location sub-filters (they're booth-specific)
  const handlePartChange = (val) => {
    setFilters(f => ({ ...f, part: val, division: [], ward: [], village: [] }))
    setPage(1)
  }
  const resetFilters = () => {
    setFilters({ constituency: '', division: [], ward: [], village: [], gender: '', part: '', search: '', idSearch: '', houseNo: '', remainingOnly: false })
    setPage(1)
  }

  const activeFilterCount = [
    filters.constituency, filters.gender, filters.part, filters.search, filters.idSearch, filters.houseNo,
    filters.remainingOnly ? 'remainingOnly' : '',
    ...filters.division, ...filters.ward, ...filters.village,
  ].filter(Boolean).length

  // Cascading options — ward narrows by selected divisions, village narrows by both
  const raw = valueOptions._raw || []

  // When a booth is selected, narrow division options to that booth only
  const divisionOptions = useMemo(() => {
    if (!filters.part) return valueOptions.division
    const counts = {}
    raw.filter(r => String(r.part) === String(filters.part)).forEach(r => {
      if (r.division) counts[r.division] = (counts[r.division] || 0) + (r._count || 1)
    })
    return Object.entries(counts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [raw, filters.part, valueOptions.division]) // eslint-disable-line react-hooks/exhaustive-deps

  const wardOptions = useMemo(() => {
    const subset = raw.filter(r => {
      if (filters.part && String(r.part) !== String(filters.part)) return false
      if (filters.division?.length && !filters.division.includes(r.division)) return false
      return true
    })
    const counts = {}
    subset.forEach(r => { if (r.ward) counts[r.ward] = (counts[r.ward] || 0) + (r._count || 1) })
    return Object.entries(counts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [raw, filters.division, filters.part]) // eslint-disable-line react-hooks/exhaustive-deps

  const villageOptions = useMemo(() => {
    const subset = raw.filter(r => {
      if (filters.part && String(r.part) !== String(filters.part)) return false
      if (filters.division?.length && !filters.division.includes(r.division)) return false
      if (filters.ward?.length    && !filters.ward.includes(r.ward))          return false
      return true
    })
    const counts = {}
    subset.forEach(r => { if (r.village) counts[r.village] = (counts[r.village] || 0) + (r._count || 1) })
    return Object.entries(counts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [raw, filters.division, filters.ward, filters.part]) // eslint-disable-line react-hooks/exhaustive-deps

  const openFamilyPanel = (voter) => {
    const running = voter['One Roof Running Number']
    const roofName = voter['One Roof']
    if (!running && !roofName) { setFamilyRoof(null); return }
    const roof = { running, roofName, house: voter['House No'], village: voter['Village'], ward: voter['Ward'], division: voter['Division'] }
    setFamilyRoof(roof)
    setFamilyRows([])
    setFamilyLoading(true)
    fetchFamilyMembers({
      oneRoofRunningNumber: running,
      houseNo:  voter['House No'],
      oneRoof:  roofName,
      ward:     voter['Ward'],
      village:  voter['Village'],
      division: voter['Division'],
    })
      .then(r => { setFamilyRows(r); setFamilyLoading(false) })
      .catch(() => setFamilyLoading(false))
  }
  const closeFamilyPanel = () => { setFamilyRoof(null); setFamilyRows([]) }

  // familyMembers alias so the render code below stays unchanged
  const familyMembers = familyRows

  const detailSections = useMemo(() => ([
    { title: t('Electoral Overview','தேர்தல் சுருக்கம்'), fields: [
      { key: 'ID Code', label: t('Electoral ID','வாக்காளர் எண்') },
      { key: 'S.No', label: t('Serial Number','வரிசை எண்') },
      { key: 'Part', label: t('Booth / Part','வாக்குச்சாவடி / பகுதி') },
      { key: 'One Roof', label: t('One Roof Family','ஒரே கூரை குடும்பம்') },
      { key: 'One Roof Running Number', label: t('Roof Running No.','கூரை ஓட்ட எண்') },
    ]},
    { title: t('Personal Profile','தனிப்பட்ட விவரம்'), fields: [
      { key: 'Name', label: t('Name','பெயர்') },
      { key: 'Gender', label: t('Gender','பாலினம்') },
      { key: 'Age', label: t('Age','வயது') },
      { key: 'House No', label: t('House Number','வீட்டு எண்') },
    ]},
    { title: t('Location Footprint','இட அடையாளம்'), fields: [
      { key: 'Constituency', label: t('Constituency','தொகுதி') },
      { key: 'Division', label: t('Division','பிரிவு') },
      { key: 'Ward', label: t('Ward','வார்டு') },
      { key: 'Village', label: t('Village','கிராமம்') },
    ]},
    { title: t('Notes & Remarks','குறிப்புகள்'), fields: [
      { key: 'notes', label: t('Field Notes','பயிர் குறிப்புகள்') },
    ]},
  ]), [t])

  const inputStyle = {
    background: C.white, border: `1px solid ${C.line}`, color: C.ink,
    padding: '7px 11px', borderRadius: 6, fontFamily: "'Outfit',sans-serif",
    fontSize: '.82rem', outline: 'none', width: '100%',
  }

  const TH = ({ k, children }) => (
    <th onClick={() => handleSort(k)} style={{
      padding: '.65rem 1rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif",
      fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
      color: sort.key === k ? C.au2 : 'rgba(255,255,255,.55)',
      cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      {children}{sort.key === k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  )

  // ── LOADING / ERROR ──────────────────────────────────────────────────────────

  if (dataLoading) {
    return (
      <div style={{ paddingTop: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16, fontFamily: "'Outfit',sans-serif" }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${C.line}`, borderTopColor: C.g600,
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ color: C.ink3, fontSize: '.9rem' }}>{t('Loading voters…', 'வாக்காளர்கள் ஏற்றுகிறது…')}</span>
      </div>
    )
  }

  if (dataError) {
    return (
      <div style={{ paddingTop: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', fontFamily: "'Outfit',sans-serif" }}>
        <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '1.5rem 2rem', color: '#c0392b', maxWidth: 480 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('Failed to load voters', 'வாக்காளர்களை ஏற்ற முடியவில்லை')}</div>
          <div style={{ fontSize: '.85rem', opacity: .8 }}>{dataError}</div>
        </div>
      </div>
    )
  }

  // ── MAIN RENDER ──────────────────────────────────────────────────────────────

  return (
    <div style={{ paddingTop: 96, background: C.bg, minHeight: '100vh', position: 'relative' }}>
      {/* Thin progress bar when changing pages */}
      {pageLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: C.g600,
            animation: 'progress 1.2s ease-in-out infinite',
            transformOrigin: 'left',
          }} />
          <style>{`@keyframes progress { 0%{transform:scaleX(0) translateX(0)} 50%{transform:scaleX(0.6) translateX(50%)} 100%{transform:scaleX(0) translateX(200%)} }`}</style>
        </div>
      )}

      {/* Agent banner */}
      {isAgentView && (
        <div style={{
          margin: '0 1.5rem 0', padding: '.75rem 1.2rem',
          borderBottom: `1px solid rgba(62,179,112,.25)`,
          background: 'rgba(62,179,112,.10)',
          fontFamily: "'Outfit',sans-serif", color: C.g700, fontSize: '.82rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontWeight: 700 }}>🔒</span>
          {user?.role === 'booth_agent'
            ? t('Locked to Booth {{num}} · showing only your assigned voters.', 'பூத் {{num}} மட்டும் காட்டப்படுகிறது.').replace('{{num}}', user?.booth_number || '')
            : user?.role === 'ward_agent'
              ? t('Showing voters for Ward {{w}}.', 'வார்டு {{w}} வாக்காளர்கள்.').replace('{{w}}', user?.ward || '')
              : t('Showing voters for your assigned wards.', 'உங்கள் மண்டல வாக்காளர்கள்.')
          }
        </div>
      )}

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div style={{
        padding: '1rem 1.5rem',
        background: C.white,
        borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
            {t('Voter Registry', 'வாக்காளர் பதிவேடு')}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {[
              [t('Total','மொத்தம்'), totalCount, C.g600],
              [t('This page','இப்பக்கம்'), pageData.length, C.au],
              [t('Modified','திருத்தம்'), modified.size, C.ink3],
            ].map(([label, val, color]) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: C.line2, borderRadius: 20, padding: '2px 10px',
                fontSize: '.7rem', color: C.ink3, fontFamily: "'Outfit',sans-serif",
              }}>
                {label}: <strong style={{ color, fontWeight: 700 }}>{val.toLocaleString()}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Filter toggle */}
        <button onClick={() => setFiltersOpen(o => !o)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Outfit',sans-serif", fontSize: '.75rem', fontWeight: 700,
          letterSpacing: '.05em', textTransform: 'uppercase',
          background: filtersOpen ? C.g700 : C.white,
          color: filtersOpen ? '#fff' : C.g700,
          border: `1px solid ${C.g400}`,
          transition: 'all .15s',
        }}>
          <span>⚙</span>
          {t('Filters', 'வடிகட்டிகள்')}
          {activeFilterCount > 0 && (
            <span style={{
              background: filtersOpen ? 'rgba(255,255,255,.3)' : C.g100,
              color: filtersOpen ? '#fff' : C.g700,
              borderRadius: 10, padding: '0 6px', fontSize: '.65rem', fontWeight: 800,
            }}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ── FILTER PANEL ─────────────────────────────────────────────────── */}
      {filtersOpen && (
        <div style={{
          background: C.line2, borderBottom: `1px solid ${C.line}`,
          padding: '1.2rem 1.5rem',
        }}>
          {/* Quick search row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(5, 1fr)',
            gap: 10, marginBottom: 14,
          }}>
            <FilterField title={t('Search Name','பெயர் தேடல்')}>
              <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
                placeholder={t('Type name…','பெயர்…')} style={inputStyle} />
            </FilterField>
            <FilterField title={t('Electoral ID','வாக்காளர் எண்')}>
              <input value={filters.idSearch} onChange={e => setFilter('idSearch', e.target.value)}
                placeholder={t('Search ID…','ID தேட…')} style={inputStyle} />
            </FilterField>
            <FilterField title={t('House Number','வீட்டு எண்')}>
              <input value={filters.houseNo} onChange={e => setFilter('houseNo', e.target.value)}
                placeholder={t('House No…','வீட்டு எண்…')} style={inputStyle} />
            </FilterField>
            <FilterField title={t('Gender','பாலினம்')}>
              <select value={filters.gender} onChange={e => setFilter('gender', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="">{t('All Genders','அனைத்தும்')}</option>
                {valueOptions.gender.map(({ value, label, count }) => (
                  <option key={value} value={value}>{label} ({count})</option>
                ))}
              </select>
            </FilterField>
            <FilterField title={t('Booth / Part','பூத் / பகுதி')}>
              <select value={filters.part} onChange={e => handlePartChange(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="">{t('All Booths','அனைத்து பூத்')}</option>
                {valueOptions.part.map(({ value, count }) => (
                  <option key={value} value={value}>{t('Booth','பூத்')} {value} ({count})</option>
                ))}
              </select>
            </FilterField>
            {isBoothAgent && (
              <FilterField title={t('Pending Check','நிலுவை சரிபார்ப்பு')}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.white, fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', color: C.ink2, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(filters.remainingOnly)}
                    onChange={e => setFilter('remainingOnly', e.target.checked)}
                    style={{ accentColor: C.g600 }}
                  />
                  {t('Show remaining only','நிலுவையில் உள்ளவர்கள் மட்டும்')}
                </label>
              </FilterField>
            )}
          </div>

          {/* Location multi-selects */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'repeat(4, 1fr)',
            gap: 10, marginBottom: 12,
          }}>
            <FilterField title={t('Constituency','தொகுதி')}>
              <select value={filters.constituency} onChange={e => setFilter('constituency', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="">{t('All','அனைத்தும்')}</option>
                {valueOptions.constituency.map(({ value, label, count }) => (
                  <option key={value} value={value}>{label} ({count})</option>
                ))}
              </select>
            </FilterField>
            <FilterField title={`${t('Division','பிரிவு')}${filters.division.length ? ` (${filters.division.length})` : ''}`}>
              <MultiSelect options={divisionOptions} selected={filters.division}
                onChange={v => handleMultiChange('division', v)} filterName="division" />
            </FilterField>
            <FilterField title={`${t('Ward','வார்டு')}${filters.ward.length ? ` (${filters.ward.length})` : ''}`}>
              <MultiSelect options={wardOptions} selected={filters.ward}
                onChange={v => handleMultiChange('ward', v)} filterName="ward" />
            </FilterField>
            <FilterField title={`${t('Village','கிராமம்')}${filters.village.length ? ` (${filters.village.length})` : ''}`}>
              <MultiSelect options={villageOptions} selected={filters.village}
                onChange={v => handleMultiChange('village', v)} filterName="village" />
            </FilterField>
          </div>

          {activeFilterCount > 0 && (
            <Btn onClick={resetFilters} style={{ marginTop: 2 }}>
              ✕ {t('Clear all filters','வடிகட்டிகளை நீக்கு')} ({activeFilterCount})
            </Btn>
          )}
        </div>
      )}

      {/* ── PAGINATION (TOP) ─────────────────────────────────────────────── */}
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        total={shownCount} filtered={shownCount} t={t}
      />

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem', minWidth: 900 }}>
          <thead>
            <tr style={{ background: C.g900 }}>
              <TH k="S.No">{t('S.No','வ.எண்')}</TH>
              <TH k="ID Code">{t('Electoral ID','வாக்காளர் எண்')}</TH>
              <TH k="Name">{t('Name','பெயர்')}</TH>
              <TH k="Age">{t('Age','வயது')}</TH>
              <TH k="Gender">{t('Gender','பாலினம்')}</TH>
              <TH k="Village">{t('Village','கிராமம்')}</TH>
              <TH k="One Roof">{t('One Roof','ஒரே கூரை')}</TH>
              <TH k="One Roof Running Number">{t('Roof No.','கூரை எண்')}</TH>
              <th style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>{t('Party','கட்சி')}</th>
              <th style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>{t('Family','குடும்பம்')}</th>
              <th style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>{t('Notes','குறிப்பு')}</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>
                  {t('No voters match your filters.','வடிகட்டிகளுக்கு பொருந்தும் வாக்காளர்கள் இல்லை.')}
                </td>
              </tr>
            ) : pageData.map((v, idx) => {
              const voterId = getVoterId(v)
              const checklist = voterId ? checklists[voterId] : null
              const isConfirmed = Boolean(checklist?.confirmed)
              const isHovered = hoveredRow === (v['ID Code'] || v['S.No'])
              const isRisk = !isConfirmed && checklist?.party && checklist.party !== 'AIADMK'
              const rowBg = isConfirmed
                ? 'rgba(62,179,112,.12)'
                : isRisk
                ? 'rgba(234,88,12,.18)'
                : isHovered ? C.line2
                : C.white
              const hoverText = isConfirmed && checklist?.agent
                ? `${t('Secured by','பாதுகாத்தவர்')}: ${checklist.agent}${checklist?.boothNumber ? ` · ${t('Booth','பூத்')} ${checklist.boothNumber}` : ''}`
                : undefined

              return (
                <tr
                  key={v['ID Code'] || v['S.No']}
                  onClick={() => handleRowClick(v)}
                  onMouseEnter={() => setHoveredRow(v['ID Code'] || v['S.No'])}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: `1px solid ${C.line}`, background: rowBg, cursor: 'pointer', transition: 'background .1s' }}
                  title={hoverText}
                >
                  <td style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: C.g600 }}>{v['S.No']}</td>
                  <td style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontSize: '.75rem', color: C.ink2, letterSpacing: '.02em' }}>{v['ID Code']}</td>
                  <td style={{ padding: '.65rem 1rem', fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: C.ink }}>
                    {v['Name']}
                    {isConfirmed && <span style={{ marginLeft: 6, display: 'inline-block', background: C.g100, color: C.g700, borderRadius: 4, padding: '0 5px', fontSize: '.58rem', fontWeight: 700, verticalAlign: 'middle' }}>✓</span>}
                  </td>
                  <td style={{ padding: '.65rem 1rem', color: C.ink2 }}>{v['Age']}</td>
                  <td style={{ padding: '.65rem 1rem', color: C.ink3 }}>{v['Gender']}</td>
                  <td style={{ padding: '.65rem 1rem', fontSize: '.73rem', color: C.ink3 }}>{v['Village']}</td>
                  <td style={{ padding: '.65rem 1rem', color: C.ink2 }}>{v['One Roof']}</td>
                  <td style={{ padding: '.65rem 1rem', color: C.ink2 }}>{v['One Roof Running Number']}</td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    {(() => {
                      const party = checklist?.party
                      if (!party) return <span style={{ color: C.ink4, fontSize: '.7rem' }}>—</span>
                      const opt = PARTY_OPTIONS.find(p => p.value === party)
                      return (
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                          fontSize: '.65rem', fontWeight: 700,
                          background: opt?.bg || '#f1f5f9', color: opt?.color || '#64748b',
                          fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap',
                        }}>{party}</span>
                      )
                    })()}
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <button
                      onClick={e => { e.stopPropagation(); openFamilyPanel(v) }}
                      style={{
                        padding: '3px 9px', borderRadius: 5, cursor: 'pointer',
                        fontFamily: "'Outfit',sans-serif", fontSize: '.62rem', fontWeight: 700,
                        letterSpacing: '.05em', textTransform: 'uppercase',
                        background: 'transparent', color: C.ink3, border: `1px solid ${C.line}`,
                        transition: 'all .12s',
                      }}
                    >
                      {t('Family','குடும்பம்')}
                    </button>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <input
                      defaultValue={v.notes || ''}
                      placeholder={t('Note…','குறிப்பு…')}
                      onBlur={e => updateField(v['ID Code'], 'notes', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        background: 'transparent', border: 'none', color: C.ink2,
                        fontFamily: "'Outfit',sans-serif", fontSize: '.78rem',
                        width: '100%', outline: 'none', minWidth: 90,
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION (BOTTOM) ──────────────────────────────────────────── */}
      <Pagination
        page={page} totalPages={totalPages} pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        total={shownCount} filtered={shownCount} t={t}
      />

      {/* ── FAMILY MODAL ─────────────────────────────────────────────────── */}
      {familyRoof && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}
          onClick={closeFamilyPanel}>
          <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 1100, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', border: `1px solid ${C.line}` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.2rem 1.6rem', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>{t('Family Cluster','குடும்பக் குழு')}</div>
                <h3 style={{ margin: '.2rem 0 .2rem', fontSize: '1.2rem', color: C.ink, fontWeight: 800 }}>
                  {t('Roof Number','கூரை எண்')} {familyRoof.running || familyRoof.roofName || '—'}
                </h3>
                <div style={{ fontSize: '.78rem', color: C.ink3 }}>
                  {familyMembers.length} {t('members','உறுப்பினர்கள்')} · {t('House','வீடு')} {familyRoof.house || '—'} · {[familyRoof.village, familyRoof.ward && `${t('Ward','வார்டு')} ${familyRoof.ward}`].filter(Boolean).join(', ')}
                </div>
              </div>
              <Btn onClick={closeFamilyPanel}>{t('Close','மூடு')}</Btn>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.6rem' }}>
              {familyLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.ink3, fontSize: '.85rem', padding: '1rem 0' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${C.line}`, borderTopColor: C.g600, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  {t('Loading family members…', 'குடும்ப உறுப்பினர்களை ஏற்றுகிறது…')}
                </div>
              ) : familyMembers.length === 0 ? (
                <div style={{ color: C.ink3, fontSize: '.85rem', padding: '1rem 0' }}>{t('No linked voters.','இணைக்கப்பட்ட வாக்காளர்கள் இல்லை.')}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ background: C.line2 }}>
                      {[t('S.No','வ.எண்'), t('Electoral ID','வாக்காளர் எண்'), t('Name','பெயர்'), t('Age','வயது'), t('Gender','பாலினம்'), t('House','வீடு'), t('Village','கிராமம்'), t('Roof No.','கூரை எண்')].map(col => (
                        <th key={col} style={{ padding: '.55rem 1rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, borderBottom: `1px solid ${C.line}` }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map((m, idx) => (
                      <tr key={m['ID Code'] || m['S.No'] || idx} style={{ borderBottom: `1px solid ${C.line}`, background: idx % 2 ? C.white : C.bg }}>
                        <td style={{ padding: '.55rem 1rem', fontWeight: 600, color: C.g600 }}>{idx + 1}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink2 }}>{m['ID Code']}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink, fontWeight: 600 }}>{m['Name']}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink2 }}>{m['Age']}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink3 }}>{m['Gender']}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink2 }}>{m['House No'] || '—'}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink2 }}>{m['Village'] || '—'}</td>
                        <td style={{ padding: '.55rem 1rem', color: C.ink2 }}>{m['One Roof Running Number'] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VOTER DETAIL MODAL ───────────────────────────────────────────── */}
      {selectedVoter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: C.white, borderRadius: 14, padding: '1.5rem', width: '100%', maxWidth: 960, maxHeight: '87vh', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${C.line}`, paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <div style={{ fontSize: '.62rem', letterSpacing: '.16em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>{t('Voter Detail Card','வாக்காளர் விரிவுரை')}</div>
                <h2 style={{ margin: '.2rem 0 0', fontSize: '1.35rem', color: C.ink, fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>{selectedVoter['Name'] || t('Unknown Voter','அறியாதவர்')}</h2>
                <div style={{ fontSize: '.78rem', color: C.ink3, marginTop: 3 }}>
                  {selectedVoter['ID Code']} · {t('Booth','பூத்')} {selectedVoter['Part']} · {selectedVoter['Village']}
                </div>
              </div>
              <Btn onClick={closeDetailView}>{t('Close','மூடு')}</Btn>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Field intake / checklist */}
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: '1.1rem 1.2rem', background: C.line2 }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: C.ink3, fontWeight: 800, marginBottom: '1rem' }}>
                  {isAgentView ? t('Booth Agent Field Intake','பூத் ஏஜெண்ட் பதிவு') : t('Field Intake Summary','களப் பதிவு சுருக்கம்')}
                </div>
                {isBoothAgent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.72rem', letterSpacing: '.07em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                      {t('Need Prioritised','தேவை முன்னுரிமை')}
                      <select value={draft.need || ''} onChange={e => handleDraftChange('need', e.target.value)}
                        style={{ padding: '.7rem 1rem', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: '.9rem', fontFamily: "'Outfit',sans-serif", background: C.white }}>
                        <option value="">{t('Select voter need','வாக்காளர் தேவையைத் தேர்வுசெய்க')}</option>
                        {NEED_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.en, o.ta)}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.72rem', letterSpacing: '.07em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                      {t('Contact Phone (Optional)','தொடர்பு எண் (விருப்பம்)')}
                      <input type="tel" value={draft.phone || ''} onChange={e => handleDraftChange('phone', e.target.value)}
                        placeholder={t('Enter voter phone if shared','வாக்காளர் எண்')}
                        style={{ padding: '.7rem 1rem', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: '.9rem', fontFamily: "'Outfit',sans-serif" }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.72rem', letterSpacing: '.07em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                      {t('Party Preference','ஆதரவு கட்சி')}
                      <select value={draft.party || ''} onChange={e => handleDraftChange('party', e.target.value)}
                        style={{ padding: '.7rem 1rem', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: '.9rem', fontFamily: "'Outfit',sans-serif", background: '#fff', cursor: 'pointer' }}>
                        <option value="">{t('Select party…','கட்சியைத் தேர்வுசெய்க')}</option>
                        {PARTY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.7rem', border: `1px dashed ${C.g500}`, borderRadius: 10, padding: '.75rem 1rem', background: 'rgba(62,179,112,.07)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={Boolean(draft.confirmed)} onChange={e => handleDraftChange('confirmed', e.target.checked)} style={{ width: 18, height: 18, accentColor: C.g600 }} />
                      <span style={{ fontSize: '.88rem', fontWeight: 700, color: C.g700 }}>{t('Mark this vote as confirmed','இந்த வாக்கை உறுதிப்படுத்தவும்')}</span>
                    </label>
                    {/* Submit button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.2rem' }}>
                      <button
                        onClick={submitAssessment}
                        disabled={submitting}
                        style={{
                          padding: '.75rem 1.8rem', borderRadius: 8, border: 'none',
                          background: submitting ? C.g300 : C.g700, color: '#fff',
                          fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', fontWeight: 800,
                          letterSpacing: '.06em', textTransform: 'uppercase',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {submitting ? t('Saving…','சேமிக்கிறது…') : t('Submit','சமர்ப்பிக்கவும்')}
                      </button>
                      {submitMsg === 'saved' && (
                        <span style={{ color: C.g600, fontSize: '.82rem', fontWeight: 700 }}>
                          ✓ {t('Saved to database','தரவுத்தளத்தில் சேமிக்கப்பட்டது')}
                        </span>
                      )}
                      {submitMsg?.startsWith('error') && (
                        <span style={{ color: C.red, fontSize: '.78rem' }}>{submitMsg}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: t('Need Prioritised','தேவை'), value: selectedNeedLabel },
                      { label: t('Contact Phone','தொடர்பு எண்'), value: selectedChecklist?.phone || t('Not shared','பகிரவில்லை') },
                      { label: t('Party Preference','கட்சி'), value: selectedChecklist?.party || t('Not recorded','பதிவில்லை') },
                      { label: t('Confirmation State','வாக்கு நிலை'), value: selectedChecklist?.confirmed ? t('Confirmed ✓','உறுதி ✓') : t('Pending','நிலுவை') },
                      { label: t('Captured By','பதிவேற்றியவர்'), value: selectedChecklist?.agent ? `${selectedChecklist.agent}${selectedChecklist?.boothNumber ? ` · ${t('Booth','பூத்')} ${selectedChecklist.boothNumber}` : ''}` : t('Not assigned','ஒதுக்கப்படவில்லை') },
                    ].map(item => (
                      <div key={item.label} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '.8rem', background: C.white }}>
                        <div style={{ fontSize: '.6rem', letterSpacing: '.06em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.35rem', fontWeight: 700 }}>{item.label}</div>
                        <div style={{ fontSize: '.92rem', fontWeight: 600, color: C.ink }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail sections */}
              {detailSections.map(section => (
                <div key={section.title} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: '1rem 1.2rem', background: C.line2 }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700, marginBottom: '.9rem' }}>{section.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.8rem' }}>
                    {section.fields.map(field => (
                      <div key={field.key} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '.65rem .9rem', background: C.white }}>
                        <div style={{ fontSize: '.6rem', letterSpacing: '.07em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.3rem', fontWeight: 700 }}>{field.label}</div>
                        <div style={{ color: C.ink, fontSize: '.92rem', fontWeight: 600 }}>{(selectedVoter[field.key] ?? '—') || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
