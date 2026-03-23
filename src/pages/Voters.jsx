import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { C } from '../data'
import { Footer } from '../components/ui'
import { useBreakpoint } from '../hooks/useBreakpoint'
import data from '../voters/output_with_roof_laalgui.jsx'
import { useAuth } from '../context/AuthContext'

const CHECKLIST_KEY = 'voterChecklists'

const NEED_OPTIONS = [
  { value: 'medical',    en: 'Medical Needs',        ta: 'மருத்துவ தேவைகள்' },
  { value: 'jobs',       en: 'Job Opportunities',    ta: 'வேலை வாய்ப்புகள்' },
  { value: 'financial',  en: 'Financial Needs',      ta: 'நிதி தேவைகள்' },
  { value: 'education',  en: 'Educational Needs',    ta: 'கல்வி தேவைகள்' },
  { value: 'others',     en: 'Other Needs',          ta: 'மற்ற தேவைகள்' },
]

const getVoterId = (row = {}) => {
  const code = row['ID Code'] || row['id'] || row['ID']
  if (code) return String(code)
  const serial = row['S.No'] || row['serial']
  return serial ? String(serial) : undefined
}

const loadChecklistData = () => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '{}')
  } catch (err) {
    return {}
  }
}

const persistChecklistData = (payload) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(payload))
}

const Btn = ({ children, onClick, variant = 'o', style }) => {  
  const styles = {
    g: { background: C.g600, color: '#fff', border: 'none' },
    o: { background: 'transparent', color: C.ink3, border: `1px solid ${C.line}` },
  }
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit',sans-serif", fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', ...styles[variant], ...style }}>
      {children}
    </button>
  )
}

const FilterGroup = ({ label, children, compact }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '.6rem' : '10px' }}>
    <label style={{
      color: C.ink3,
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      {label}
    </label>
    <div style={{ display: 'flex', flexDirection: compact ? 'column' : 'row', flexWrap: 'wrap', gap: compact ? '.8rem' : '1rem', alignItems: 'stretch' }}>
      {children}
    </div>
  </div>
);

const MultiSelect = ({ options = [], selected, onChange, compact }) => (
  <div style={{
    maxHeight: '140px',
    overflowY: 'auto',
    padding: '8px',
    background: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: '6px',
    display: 'grid',
    gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(160px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px'
  }}>
    {options.map(({ value, label, count }) => (
      <label key={value} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        fontSize: '12px',
        color: C.ink,
        transition: 'all 0.2s'
      }}
      >
        <input
          type="checkbox"
          checked={selected.includes(value)}
          onChange={() => onChange(value)}
          style={{
            accentColor: C.au2
          }}
        />
        <span>{label}{count ? ` (${count})` : ''}</span>
      </label>
    ))}
  </div>
);

const FilterField = ({ title, children, compact }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: compact ? '1 0 100%' : '1 0 220px', minWidth: compact ? '100%' : 220 }}>
    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3 }}>
      {title}
    </span>
    {children}
  </div>
);

export default function Voters() {
  const { t } = useLang()
  const { isTablet } = useBreakpoint()
  const { user } = useAuth()
  const isAgentView = user?.role === 'agent'
  const scopedDataset = useMemo(() => {
    if (isAgentView) {
      const booth = (user?.boothNumber ?? '').toString()
      return (data || []).filter(row => String(row?.Part ?? '') === booth)
    }
    return data || []
  }, [isAgentView, user])
  const [voters, setVoters] = useState(() => scopedDataset.map(row => ({ ...row, notes: '' })))
  const [filters, setFilters] = useState({
    constituency: '',
    division: [],
    ward: [],
    village: [],
    gender: '',
    search: '',
    idSearch: '',
    houseNo: '',
  })
  const [selectedVoter, setSelectedVoter] = useState(null)
  const [familyRoof, setFamilyRoof] = useState(null)
  const [sort, setSort] = useState({ key: 'S.No', dir: 1 })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [modified, setModified] = useState(new Set())
  const [checklists, setChecklists] = useState(() => loadChecklistData())

  useEffect(() => {
    setVoters(scopedDataset.map(row => ({ ...row, notes: '' })))
    setModified(new Set())
    setPage(1)
  }, [scopedDataset])

  const updateChecklist = useCallback((voterId, updates) => {
    if (!voterId) return
    setChecklists(prev => {
      const existing = prev[voterId] || {}
      const nextEntry = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      if (updates.confirmed !== undefined) {
        nextEntry.confirmed = updates.confirmed
        nextEntry.confirmedAt = updates.confirmed ? new Date().toISOString() : null
        if (updates.confirmed && user?.role === 'agent') {
          nextEntry.agent = user.username
          nextEntry.boothNumber = user.boothNumber
        }
      }
      if (user?.role === 'agent') {
        nextEntry.agent = user.username
        nextEntry.boothNumber = user.boothNumber
      }
      const next = { ...prev, [voterId]: nextEntry }
      persistChecklistData(next)
      return next
    })
  }, [user])

  const selectedVoterId = selectedVoter ? getVoterId(selectedVoter) : null
  const selectedChecklist = selectedVoterId ? checklists[selectedVoterId] : null
  const selectedNeedOption = selectedChecklist?.need
    ? NEED_OPTIONS.find(opt => opt.value === selectedChecklist.need)
    : null
  const selectedNeedLabel = selectedNeedOption
    ? t(selectedNeedOption.en, selectedNeedOption.ta)
    : t('Not captured yet', 'இன்னும் பதிவு செய்யப்படவில்லை')

  const handleChecklistChange = useCallback((field, value) => {
    if (!isAgentView || !selectedVoterId) return
    updateChecklist(selectedVoterId, { [field]: value })
  }, [isAgentView, selectedVoterId, updateChecklist])

  const handleConfirmToggle = useCallback((checked) => {
    if (!isAgentView || !selectedVoterId) return
    updateChecklist(selectedVoterId, { confirmed: checked })
  }, [isAgentView, selectedVoterId, updateChecklist])

  const updateField = useCallback((idCode, field, val) => {
    setVoters(prev => prev.map(v => v['ID Code'] === idCode ? { ...v, [field]: val } : v))
    setModified(prev => new Set([...prev, idCode]))
  }, [])

  const filteredSorted = useMemo(() => {
    const f = voters.filter(v => {
      if (filters.constituency && v['Constituency'] !== filters.constituency) return false
      if (filters.division.length > 0 && !filters.division.includes(v['Division'])) return false
      if (filters.ward.length > 0 && !filters.ward.includes(v['Ward'])) return false
      if (filters.village.length > 0 && !filters.village.includes(v['Village'])) return false
      if (filters.gender && v['Gender'] !== filters.gender) return false
      if (filters.search) {
        const s = filters.search.toLowerCase()
        const name = (v['Name'] || '').toString().toLowerCase()
        if (!name.includes(s)) return false
      }
      if (filters.idSearch) {
        const s = filters.idSearch.toLowerCase()
        const idCode = (v['ID Code'] || '').toString().toLowerCase()
        if (!idCode.includes(s)) return false
      }
      if (filters.houseNo && v['House No'] !== filters.houseNo) return false
      return true
    })
    return [...f].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      return typeof av === 'number' ? (av - bv) * sort.dir : String(av).localeCompare(String(bv)) * sort.dir
    })
  }, [voters, filters, sort])

  const totalPages = Math.ceil(filteredSorted.length / pageSize)
  const pageData = filteredSorted.slice((page - 1) * pageSize, page * pageSize)

  const handleRowClick = (voter) => {
    setSelectedVoter(voter)
  }

  const closeDetailView = () => {
    setSelectedVoter(null)
  }

  const handleSort = (key) => { setSort(s => ({ key, dir: s.key === key ? s.dir * -1 : 1 })); setPage(1) }
  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1) }
  const handleMultiSelectChange = (filterName, value) => {
    setFilters(f => {
      const current = f[filterName];
      const newSelection = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...f, [filterName]: newSelection };
    });
    setPage(1);
  };

  const formatFilterLabel = (key, label) => {
    const count = Array.isArray(filters[key]) ? filters[key].length : 0
    return `${label} (${count})`
  }

  const resetFilters = () => { 
    setFilters({ 
      constituency: '', 
      division: [], 
      ward: [], 
      village: [], 
      gender: '', 
      search: '',
      idSearch: '',
      houseNo: '',
    }); 
    setPage(1); 
  }

  const stats = {
    total: voters.length,
    showing: filteredSorted.length,
  }

  const detailSections = useMemo(() => ([
    {
      title: t('Electoral Overview','தேர்தல் சுருக்கம்'),
      fields: [
        { key: 'ID Code', label: t('Electoral ID','வாக்காளர் எண்') },
        { key: 'S.No', label: t('Serial Number','வரிசை எண்') },
        { key: 'Part', label: t('Booth / Part','வாக்குச்சாவடி / பகுதி') },
        { key: 'One Roof', label: t('One Roof Family','ஒரே கூரை குடும்பம்') },
        { key: 'One Roof Running Number', label: t('Roof Running No.','கூரை ஓட்ட எண்') },
      ],
    },
    {
      title: t('Personal Profile','தனிப்பட்ட விவரம்'),
      fields: [
        { key: 'Name', label: t('Name','பெயர்') },
        { key: 'Gender', label: t('Gender','பாலினம்') },
        { key: 'Age', label: t('Age','வயது') },
        { key: 'House No', label: t('House Number','வீட்டு எண்') },
      ],
    },
    {
      title: t('Location Footprint','இட அடையாளம்'),
      fields: [
        { key: 'Constituency', label: t('Constituency','தொகுதி') },
        { key: 'Division', label: t('Division','பிரிவு') },
        { key: 'Ward', label: t('Ward','வார்டு') },
        { key: 'Village', label: t('Village','கிராமம்') },
      ],
    },
    {
      title: t('Notes & Remarks','குறிப்புகள்'),
      fields: [
        { key: 'notes', label: t('Field Notes','பயிர் குறிப்புகள்') },
      ],
    },
  ]), [t])

  const familyMembers = useMemo(() => {
    if (!familyRoof) return []
    return voters.filter(v => {
      if (familyRoof.running && v['One Roof Running Number']) {
        return v['One Roof Running Number'] === familyRoof.running
      }
      if (familyRoof.roofName) {
        return v['One Roof'] === familyRoof.roofName
      }
      return false
    })
  }, [familyRoof, voters])

  const openFamilyPanel = (voter) => {
    const running = voter['One Roof Running Number']
    const roofName = voter['One Roof']
    if (!running && !roofName) {
      setFamilyRoof(null)
      return
    }
    setFamilyRoof({
      running,
      roofName,
      house: voter['House No'],
      village: voter['Village'],
      ward: voter['Ward'],
      division: voter['Division'],
    })
  }

  const closeFamilyPanel = () => setFamilyRoof(null)

  const valueOptions = useMemo(() => {
    const make = (key) => {
      const counts = voters.reduce((acc, voter) => {
        const val = voter[key]
        if (!val) return acc
        acc[val] = (acc[val] || 0) + 1
        return acc
      }, {})
      return Object.entries(counts)
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => String(a.label).localeCompare(String(b.label)))
    }
    return {
      constituency: make('Constituency'),
      division: make('Division'),
      ward: make('Ward'),
      village: make('Village'),
      gender: make('Gender'),
    }
  }, [voters])

  const TH = ({ k, children }) => (
    <th onClick={() => handleSort(k)} style={{ padding: '.6rem .85rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: sort.key === k ? C.au2 : 'rgba(255,255,255,.48)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}{sort.key === k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  )

  const selStyle = { background: C.white, border: `1px solid ${C.line}`, color: C.ink, padding: '6px 9px', borderRadius: 4, fontFamily: "'Outfit',sans-serif", fontSize: '.77rem', outline: 'none', appearance: 'none', minWidth: 110, width: '100%', maxWidth: '100%' }

  return (
    <div style={{ paddingTop: 96 }}>
      {isAgentView && (
        <div style={{
          margin: '0 1.5rem 1.2rem',
          padding: '.9rem 1.2rem',
          borderRadius: 14,
          border: '1px solid rgba(62,179,112,.35)',
          background: 'rgba(62,179,112,.12)',
          fontFamily: "'Outfit',sans-serif",
          color: C.g700,
          fontSize: '.85rem',
        }}>
          {t('Locked to Booth {{num}} · you can search/sort only within your assigned voters.', 'பூத் {{num}} மட்டும் காட்டப்படுகிறது · உங்களுக்கு ஒதுக்கப்பட்ட வாக்காளர்களுக்குள் மட்டுமே தேடலாம்.').replace('{{num}}', user?.boothNumber || '')}
        </div>
      )}
      {/* Filter bar */}
      <div style={{ background: C.line2, borderBottom: `1px solid ${C.line}`, padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FilterGroup label={t('Location Filters', 'இடம் வடிகட்டிகள்')} compact={isTablet}>
            <FilterField title={t('Constituency','தொகுதி')} compact={isTablet}>
              <select value={filters.constituency} onChange={e => setFilter('constituency', e.target.value)} style={selStyle}>
                <option value="">{t('All Constituencies','அனைத்து தொகுதிகள்')}</option>
                {valueOptions.constituency.map(({ value, label, count }) => (
                  <option key={value} value={value}>{label} ({count})</option>
                ))}
              </select>
            </FilterField>
            <FilterField title={formatFilterLabel('division', t('Division','பிரிவு'))} compact={isTablet}>
              <MultiSelect
                options={valueOptions.division}
                selected={filters.division}
                onChange={(val) => handleMultiSelectChange('division', val)}
                compact={isTablet}
              />
            </FilterField>
            <FilterField title={formatFilterLabel('ward', t('Village','கிராமம்'))} compact={isTablet}>
              <MultiSelect
                options={valueOptions.ward}
                selected={filters.ward}
                onChange={(val) => handleMultiSelectChange('ward', val)}
                compact={isTablet}
              />
            </FilterField>
            <FilterField title={formatFilterLabel('village', t('Ward','வார்டு'))} compact={isTablet}>
              <MultiSelect
                options={valueOptions.village}
                selected={filters.village}
                onChange={(val) => handleMultiSelectChange('village', val)}
                compact={isTablet}
              />
            </FilterField>
          </FilterGroup>

          <FilterGroup label={t('Personal Filters', 'தனிப்பட்ட வடிகட்டிகள்')} compact={isTablet}>
            <FilterField title={t('Search Name','பெயர் தேடல்')} compact={isTablet}>
              <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder={t('Type name…','பெயர் உள்ளிடவும்…')} style={{ ...selStyle, minWidth: 'unset', width: '100%' }} />
            </FilterField>
            <FilterField title={t('Electoral ID','வாக்காளர் எண்')} compact={isTablet}>
              <input value={filters.idSearch} onChange={e => setFilter('idSearch', e.target.value)} placeholder={t('Search ID…','ID தேட…')} style={{ ...selStyle, minWidth: 'unset', width: '100%' }} />
            </FilterField>
            <FilterField title={t('House Number','வீட்டு எண்')} compact={isTablet}>
              <input value={filters.houseNo} onChange={e => setFilter('houseNo', e.target.value)} placeholder={t('House No…','வீட்டு எண்…')} style={{ ...selStyle, minWidth: 'unset', width: '100%' }} />
            </FilterField>
            <FilterField title={t('Gender','பாலினம்')} compact={isTablet}>
              <select value={filters.gender} onChange={e => setFilter('gender', e.target.value)} style={selStyle}>
                <option value="">{t('All Genders','அனைத்து பாலினங்களும்')}</option>
                {valueOptions.gender.map(({ value, label, count }) => (
                  <option key={value} value={value}>{label} ({count})</option>
                ))}
              </select>
            </FilterField>
          </FilterGroup>
        </div>
        <div style={{marginTop: '1.5rem'}}>
          <Btn onClick={resetFilters}>{t('Reset All Filters','அனைத்து வடிகட்டிகளையும் மீட்டமை')}</Btn>
        </div>
      </div>

      {/* Stats chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', padding: '.6rem 1.5rem', background: C.white, borderBottom: `1px solid ${C.line}`, justifyContent: isTablet ? 'center' : 'flex-start' }}>
        {[
          [t('Total','மொத்தம்'), stats.total],
          [t('Showing','காட்டுகிறது'), stats.showing],
          [t('Modified','திருத்தப்பட்டது'), modified.size],
        ].map(([l, v]) => (
          <div key={l} style={{ background: C.line2, borderRadius: 20, padding: '2px 11px', fontSize: '.69rem', color: C.ink3 }}>
            {l}: <strong style={{ color: C.g700, fontWeight: 700 }}>{v}</strong>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.77rem', minWidth: 900 }}>
          <thead>
            <tr style={{ background: C.g900 }}>
              <TH k="S.No">{t('S.No','வரிசை எண்')}</TH>
              <TH k="ID Code">{t('Electoral ID','வாக்காளர் அடையாள எண்')}</TH>
              <TH k="Name">{t('Name','பெயர்')}</TH>
              <TH k="Age">{t('Age','வயது')}</TH>
              <TH k="Gender">{t('Gender','பாலினம்')}</TH>
              <TH k="Village">{t('Village','கிராமம்')}</TH>
              <TH k="One Roof">{t('One Roof','ஒரே கூரை')}</TH>
              <TH k="One Roof Running Number">{t('Roof No.','கூரை எண்')}</TH>
              <th style={{ padding: '.6rem .85rem', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.48)' }}>{t('Family','குடும்பம்')}</th>
              <th style={{ padding: '.6rem .85rem', fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.48)' }}>{t('Notes','குறிப்புகள்')}</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: C.ink3 }}>{t('No voters match your filters. Try adjusting filters.','வடிகட்டிகளுக்கு பொருந்தும் வாக்காளர்கள் இல்லை.')}</td></tr>
            ) : pageData.map(v => {
              const voterId = getVoterId(v)
              const checklist = voterId ? checklists[voterId] : null
              const isConfirmed = Boolean(checklist?.confirmed)
              const rowBg = isConfirmed
                ? 'rgba(62,179,112,.18)'
                : (modified.has(v['ID Code']) ? 'rgba(200,160,48,.04)' : C.white)
              const hoverText = isConfirmed && checklist?.agent
                ? `${t('Secured by','பாதுகாத்தவர்')}: ${checklist.agent}${checklist?.boothNumber ? ` · ${t('Booth','பூத்')} ${checklist.boothNumber}` : ''}`
                : undefined
              return (
                <tr
                  key={v['ID Code'] || v['S.No']}
                  onClick={() => handleRowClick(v)}
                  style={{ borderBottom: `1px solid ${C.line}`, background: rowBg, cursor: 'pointer' }}
                  title={hoverText}
                >
                <td style={{ padding: '.75rem .85rem', fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', fontWeight: 700, color: C.g600 }}>{v['S.No']}</td>
                <td style={{ padding: '.75rem .85rem', fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', color: C.ink2 }}>{v['ID Code']}</td>
                <td style={{ padding: '.75rem .85rem', fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', color: C.ink }}>{v['Name']}</td>
                <td style={{ padding: '.75rem .85rem', color: C.ink2 }}>{v['Age']}</td>
                <td style={{ padding: '.75rem .85rem', color: C.ink3 }}>{v['Gender']}</td>
                <td style={{ padding: '.75rem .85rem', fontSize: '.75rem', color: C.ink3 }}>{v['Village']}</td>
                <td style={{ padding: '.75rem .85rem', color: C.ink2 }}>{v['One Roof']}</td>
                <td style={{ padding: '.75rem .85rem', color: C.ink2 }}>{v['One Roof Running Number']}</td>
                <td style={{ padding: '.75rem .85rem' }}>
                  <Btn
                    onClick={(e) => { e.stopPropagation(); openFamilyPanel(v) }}
                    style={{ padding: '4px 10px', fontSize: '.6rem' }}
                  >
                    {t('Family','குடும்பம்')}
                  </Btn>
                </td>
                <td style={{ padding: '.75rem .85rem' }}>
                  <input
                    defaultValue={v.notes || ''}
                    placeholder={t('Add note…','குறிப்பு சேர்…')}
                    onBlur={e => updateField(v['ID Code'], 'notes', e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: C.ink2, fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', width: '100%', outline: 'none', padding: '2px 3px', minWidth: 100 }}
                  />
                </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {familyRoof && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1100 }}
          onClick={closeFamilyPanel}
        >
          <div
            style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 1100, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 18px 48px rgba(0,0,0,0.2)', border: `1px solid ${C.line}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.2rem 1.6rem', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: C.ink3 }}>{t('Family Cluster','குடும்பக் குழு')}</div>
                <h3 style={{ margin: '.2rem 0 0', fontSize: '1.25rem', color: C.ink }}>
                  {t('Roof Number','கூரை எண்')} {familyRoof.running || familyRoof.roofName || '—'}
                </h3>
                <div style={{ fontSize: '.78rem', color: C.ink3, marginTop: '.2rem' }}>
                  {familyMembers.length} {t('members share this roof','உறுப்பினர்கள் இந்த கூரையைப் பகிர்கின்றனர்')} · {t('House','வீடு')} {familyRoof.house || '—'}
                </div>
                <div style={{ fontSize: '.78rem', color: C.ink2, marginTop: '.15rem' }}>
                  {t('Address','முகவரி')}: {[
                    familyRoof.house && `${t('House','வீடு')} ${familyRoof.house}`,
                    familyRoof.village,
                    familyRoof.ward && `${t('Ward','வார்டு')} ${familyRoof.ward}`,
                    familyRoof.division && `${t('Division','பிரிவு')} ${familyRoof.division}`,
                  ].filter(Boolean).join(', ') || '—'}
                </div>
              </div>
              <Btn onClick={closeFamilyPanel}>
                {t('Close','மூடு')}
              </Btn>
            </div>
            <div style={{ padding: '1rem 1.6rem', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {familyMembers.length === 0 ? (
                  <div style={{ padding: '1rem', color: C.ink3, fontSize: '.85rem' }}>{t('No linked voters for this roof.','இந்த கூரைக்கு இணைக்கப்பட்ட வாக்காளர்கள் இல்லை.')}</div>
                ) : (
                  <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                        <thead>
                          <tr style={{ background: C.line2 }}>
                            {[t('S.No','வரிசை எண்'), t('Electoral ID','வாக்காளர் அடையாள எண்'), t('Name','பெயர்'), t('Age','வயது'), t('Gender','பாலினம்'), t('House','வீடு'), t('Village','கிராமம்'), t('Roof No.','கூரை எண்')].map(col => (
                              <th key={col} style={{ padding: '.55rem .85rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, borderBottom: `1px solid ${C.line}` }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {familyMembers.map((member, idx) => (
                            <tr key={member['ID Code'] || member['S.No'] || idx} style={{ borderBottom: `1px solid ${C.line}`, background: idx % 2 ? '#fff' : C.line2 }}>
                              <td style={{ padding: '.55rem .85rem', fontWeight: 600, color: C.g600 }}>{idx + 1}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink2 }}>{member['ID Code']}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink }}>{member['Name']}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink2 }}>{member['Age']}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink3 }}>{member['Gender']}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink2 }}>{member['House No'] || '—'}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink2 }}>{member['Village'] || '—'}</td>
                              <td style={{ padding: '.55rem .85rem', color: C.ink2 }}>{member['One Roof Running Number'] || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVoter && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: C.white, borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 960, maxHeight: '85vh', boxShadow: '0 18px 46px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.line}`, paddingBottom: '.8rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '.7rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3 }}>{t('Voter Detail Card','வாக்காளர் விரிவுரை')}</div>
                <h2 style={{ margin: '.2rem 0 0', fontSize: '1.35rem', color: C.ink, fontWeight: 800 }}>{selectedVoter['Name'] || t('Unknown Voter','அறியாதவர்')}</h2>
              </div>
              <Btn onClick={closeDetailView}>{t('Close','மூடு')}</Btn>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: '1.1rem 1.2rem', background: '#fff', boxShadow: '0 10px 28px rgba(15,42,26,.06)' }}>
                  <div style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', color: C.ink3, fontWeight: 800, marginBottom: '.9rem' }}>
                    {isAgentView ? t('Booth Agent Field Intake', 'பூத் ஏஜெண்ட் பதிவு') : t('Field Intake Summary', 'களப் பதிவு சுருக்கம்')}
                  </div>
                  {isAgentView ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                        {t('Need Prioritised', 'தேவை முன்னுரிமை')}
                        <select
                          value={selectedChecklist?.need || ''}
                          onChange={(e) => handleChecklistChange('need', e.target.value)}
                          style={{ padding: '.75rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, fontSize: '.95rem', fontFamily: "'Outfit',sans-serif" }}
                        >
                          <option value="">{t('Select voter need', 'வாக்காளர் தேவையைத் தேர்வுசெய்க')}</option>
                          {NEED_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{t(option.en, option.ta)}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                        {t('Contact Phone (Optional)', 'தொடர்பு எண் (விருப்பம்)')}
                        <input
                          type="tel"
                          value={selectedChecklist?.phone || ''}
                          onChange={(e) => handleChecklistChange('phone', e.target.value)}
                          placeholder={t('Enter voter phone if shared', 'வாக்காளர் பகிர்ந்தால் எண்ணை பதிவிடவும்')}
                          style={{ padding: '.75rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, fontSize: '.95rem', fontFamily: "'Outfit',sans-serif" }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                        {t('Party Preference', 'அவரது ஆதரவு கட்சி')}
                        <input
                          type="text"
                          value={selectedChecklist?.party || ''}
                          onChange={(e) => handleChecklistChange('party', e.target.value)}
                          placeholder={t('Record party they lean towards', 'அவர்கள் விரும்பும் கட்சியை பதிவு செய்யவும்')}
                          style={{ padding: '.75rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, fontSize: '.95rem', fontFamily: "'Outfit',sans-serif" }}
                        />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '.65rem', border: `1px dashed ${C.g500}`, borderRadius: 12, padding: '.75rem 1rem', background: 'rgba(62,179,112,.08)' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedChecklist?.confirmed)}
                          onChange={(e) => handleConfirmToggle(e.target.checked)}
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ fontSize: '.86rem', fontWeight: 700, color: C.g700 }}>
                          {t('Mark this vote as confirmed', 'இந்த வாக்கை உறுதிப்படுத்தவும்')}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {[{
                        label: t('Need Prioritised', 'தேவை முன்னுரிமை'),
                        value: selectedNeedLabel,
                      }, {
                        label: t('Contact Phone', 'தொடர்பு எண்'),
                        value: selectedChecklist?.phone || t('Not shared', 'பகிரப்படவில்லை'),
                      }, {
                        label: t('Party Preference', 'ஆதரவு கட்சி'),
                        value: selectedChecklist?.party || t('Not recorded', 'பதிவு செய்யப்படவில்லை'),
                      }, {
                        label: t('Confirmation State', 'வாக்கு நிலை'),
                        value: selectedChecklist?.confirmed ? t('Confirmed', 'உறுதி செய்யப்பட்டது') : t('Pending', 'நிலுவை'),
                      }, {
                        label: t('Captured By', 'பதிவேற்றியவர்'),
                        value: selectedChecklist?.agent ? `${selectedChecklist.agent}${selectedChecklist?.boothNumber ? ` · ${t('Booth','பூத்')} ${selectedChecklist.boothNumber}` : ''}` : t('Not assigned', 'ஒதுக்கப்படவில்லை'),
                      }].map(item => (
                        <div key={item.label} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: '.8rem', background: C.line2 }}>
                          <div style={{ fontSize: '.62rem', letterSpacing: '.06em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.35rem', fontWeight: 700 }}>{item.label}</div>
                          <div style={{ fontSize: '.95rem', fontWeight: 600, color: C.ink }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {detailSections.map(section => (
                  <div key={section.title} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: '1rem 1.2rem', background: C.line2 }}>
                    <div style={{ fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700, marginBottom: '.9rem' }}>{section.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {section.fields.map(field => (
                        <div key={field.key} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '.65rem .85rem', background: '#fff' }}>
                          <div style={{ fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.35rem', fontWeight: 700 }}>{field.label}</div>
                          <div style={{ color: C.ink, fontSize: '.95rem', fontWeight: 600 }}>{(selectedVoter[field.key] ?? '—') || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1.5rem', background: C.white, borderTop: `1px solid ${C.line}`, flexWrap: 'wrap', gap: '.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.7rem', color: C.ink3 }}>
          {t('Rows:','வரிசைகள்:')}
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }} style={{ background: C.line2, border: `1px solid ${C.line}`, padding: '3px 7px', borderRadius: 3, fontSize: '.7rem', outline: 'none' }}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)} style={{ width: 27, height: 27, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${page === p ? C.g700 : C.line}`, borderRadius: 4, fontFamily: "'Outfit',sans-serif", fontSize: '.68rem', fontWeight: 700, cursor: 'pointer', background: page === p ? C.g700 : C.white, color: page === p ? '#fff' : C.ink3, transition: 'all .15s' }}>{p}</button>
            )
          })}
        </div>
        <div style={{ fontSize: '.7rem', color: C.ink3 }}>
          {Math.min((page-1)*pageSize+1, filteredSorted.length)}–{Math.min(page*pageSize, filteredSorted.length)} {t('of','இல்')} {filteredSorted.length}
        </div>
      </div>

      <Footer />
    </div>
  )
}
