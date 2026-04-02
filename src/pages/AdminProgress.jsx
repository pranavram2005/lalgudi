import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { C } from '../data'
import { supabase, fetchAllAssessments } from '../lib/supabase'

const NEED_LABELS = {
  medical:   'Medical',
  jobs:      'Jobs',
  financial: 'Financial',
  education: 'Education',
  others:    'Others',
}

export default function AdminProgress() {
  const { t, lang } = useLang()
  const { isTablet } = useBreakpoint()
  const navigate = useNavigate()

  const [assessments, setAssessments] = useState([])
  const [agents,      setAgents]      = useState([])
  const [totalVoters, setTotalVoters] = useState(0)
  const [loading,     setLoading]     = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [assmData, agentData, votersMeta] = await Promise.all([
        fetchAllAssessments(),
        supabase.from('agents').select('id, username, full_name, booth_number, phone, website_link, ward, division, role, is_active').eq('role', 'booth_agent').eq('is_active', true).then(r => r.data || []),
        supabase.from('voters').select('*', { count: 'exact', head: true }),
      ])
      setAssessments(assmData)
      setAgents(agentData)
      setTotalVoters(votersMeta?.count ?? 0)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Overall stats
  const confirmed    = useMemo(() => assessments.filter(a => a.confirmed), [assessments])
  const totalFilled  = assessments.length
  const confirmedCnt = confirmed.length
  const progressPct  = totalVoters ? (confirmedCnt / totalVoters) * 100 : 0

  // Needs breakdown
  const needsCounts = useMemo(() => {
    const counts = {}
    assessments.forEach(a => { if (a.need) counts[a.need] = (counts[a.need] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [assessments])

  // Party preference breakdown
  const partyCounts = useMemo(() => {
    const counts = {}
    assessments.forEach(a => {
      if (a.party?.trim()) {
        const key = a.party.trim()
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [assessments])

  // Per-agent stats
  const agentRows = useMemo(() => {
    const statsByUsername = {}
    assessments.forEach(a => {
      const key = a.agent_username
      if (!key) return
      const b = statsByUsername[key] || { confirmed: 0, total: 0, latest: null }
      b.total += 1
      if (a.confirmed) b.confirmed += 1
      if (a.updated_at) {
        const ts = new Date(a.updated_at).getTime()
        if (!b.latest || ts > b.latest) b.latest = ts
      }
      statsByUsername[key] = b
    })
    return agents.map(agent => ({
      ...agent,
      confirmed: statsByUsername[agent.username]?.confirmed || 0,
      total:     statsByUsername[agent.username]?.total     || 0,
      latest:    statsByUsername[agent.username]?.latest    || null,
    })).sort((a, b) => (a.booth_number ?? Infinity) - (b.booth_number ?? Infinity))
  }, [agents, assessments])

  const cell = { padding: '.8rem .9rem', fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', color: C.ink, borderBottom: `1px solid ${C.line}` }
  const th   = { padding: '.65rem .9rem', background: C.g900, color: 'rgba(255,255,255,.6)', fontFamily: "'Outfit',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'left' }

  return (
    <div style={{ paddingTop: 96, background: C.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isTablet ? '1.5rem' : '2rem 2rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ background: C.white, borderRadius: 16, padding: '1.6rem', border: `1px solid ${C.line}` }}>
          <p style={{ fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, margin: '0 0 .3rem' }}>
            {lang === 'ta' ? 'நிலை அறிக்கை' : 'Status Report'}
          </p>
          <h1 style={{ margin: 0, fontSize: isTablet ? '1.8rem' : '2.2rem', fontWeight: 900, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
            {t('Vote Confirmation Control Room', 'வாக்கு உறுதி கட்டுப்பாட்டு அறை')}
          </h1>
          {/* Progress bar */}
          <div style={{ marginTop: '1.2rem', border: `1px solid ${C.line}`, borderRadius: 12, padding: '1rem 1.2rem', background: C.line2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem', flexWrap: 'wrap', gap: '.5rem' }}>
              <span style={{ fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                {t('Overall Confirmation Progress', 'மொத்த உறுதி முன்னேற்றம்')}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: C.ink }}>
                {confirmedCnt.toLocaleString()} / {totalVoters.toLocaleString()} · {progressPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 14, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg,${C.g500},${C.g700})`, transition: 'width .4s' }} />
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '1rem' }}>
         {[
  {
    label: t('Total Assessed', 'மொத்த பதிவு'),
    value: assessments.length,
    color: C.ink,
    bg: '#f1f5f9',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M4 7h16v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
        <path d="M9 14h.01" />
        <path d="M9 17h.01" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    label: t('Confirmed Votes', 'உறுதி வாக்குகள்'),
    value: confirmed.length,
    color: C.g700,
    bg: '#dcfce7',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.g700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    label: t('Needs Captured', 'தேவைகள் பதிவு'),
    value: assessments.filter(a => a.need).length,
    color: '#92400e',
    bg: '#fef3c7',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
].map(({ label, value, color, bg, icon }) => (
  <div key={label} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.07em', color: C.ink3, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color, fontFamily: "'Outfit',sans-serif", lineHeight: 1.1 }}>{value.toLocaleString()}</div>
    </div>
  </div>
))}
        </div>

        {/* Needs + Party breakdown side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

          {/* Needs */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {t('Voter Needs Breakdown', 'வாக்காளர் தேவை பிரிவு')}
            </h3>
            {needsCounts.length === 0 ? (
              <p style={{ color: C.ink3, fontSize: '.85rem' }}>{t('No needs recorded yet.','தேவைகள் பதிவு இல்லை.')}</p>
            ) : needsCounts.map(([need, count]) => {
              const max = needsCounts[0][1]
              return (
                <div key={need} style={{ marginBottom: '.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 600, color: C.ink, marginBottom: 3, fontFamily: "'Outfit',sans-serif" }}>
                    <span>{NEED_LABELS[need] || need}</span>
                    <span style={{ color: C.ink3 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: C.g600 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Party preference */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {t('Party Preference', 'கட்சி விருப்பம்')}
            </h3>
            {partyCounts.length === 0 ? (
              <p style={{ color: C.ink3, fontSize: '.85rem' }}>{t('No party data recorded yet.','கட்சி தரவு பதிவு இல்லை.')}</p>
            ) : partyCounts.map(([party, count]) => {
              const max = partyCounts[0][1]
              return (
                <div key={party} style={{ marginBottom: '.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 600, color: C.ink, marginBottom: 3, fontFamily: "'Outfit',sans-serif" }}>
                    <span>{party}</span>
                    <span style={{ color: C.ink3 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: '#7c3aed' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Agent performance table */}
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.8rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
                {t('Booth Agent Performance', 'பூத் ஏஜெண்ட் செயல்திறன்')}
              </h2>
              <p style={{ margin: '.2rem 0 0', color: C.ink3, fontSize: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
                {t('Click a row to view the agent profile.', 'ஏஜெண்ட் விவரம் காண வரியை சொடுக்கவும்.')}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              style={{ border: `1px solid ${C.g500}`, background: 'transparent', color: C.g700, borderRadius: 999, padding: '.5rem 1.1rem', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
            >
              {loading ? t('Loading…','ஏற்றுகிறது…') : t('Refresh','புதுப்பிக்க')}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>
              {t('Loading…','ஏற்றுகிறது…')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
                <thead>
                  <tr>
                    {[t('Agent','ஏஜெண்ட்'), t('Booth','பூத்'), t('Phone','தொலைபேசி'), t('Assessed','பதிவு'), t('Last Update','கடைசி புதுப்பிப்பு'),t('Confirmed','உறுதி')].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agentRows.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...cell, textAlign: 'center', color: C.ink3, padding: '2.5rem' }}>
                      {t('No booth agents found.','பூத் ஏஜெண்ட்கள் இல்லை.')}
                    </td></tr>
                  ) : agentRows.map((agent, idx) => (
                    <tr
                      key={agent.id}
                      onClick={() => navigate(`/admin/agents/${agent.id}`)}
                      style={{ background: idx % 2 ? C.bg : C.white, cursor: 'pointer' }}
                    >
                      <td style={{ ...cell, fontWeight: 700 }}>{agent.full_name || agent.username}</td>
                      <td style={{ ...cell, color: C.g600, fontWeight: 700 }}>{agent.booth_number || '—'}</td>
                      <td style={{ ...cell, color: C.ink3 }}>{agent.phone || '—'}</td>
                      <td style={cell}>{agent.total}</td>
                      <td style={{ ...cell, color: C.ink3, fontSize: '.75rem' }}>
                        {agent.latest ? new Date(agent.latest).toLocaleString() : '—'}
                      </td>
                      <td style={{ ...cell, fontWeight: 900, fontSize: '1.1rem', color: '#fff', background: C.g700, textAlign: 'center' }}>{agent.confirmed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
