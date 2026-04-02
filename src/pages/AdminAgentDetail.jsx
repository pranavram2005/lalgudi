import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { C } from '../data'
import { supabase } from '../lib/supabase'

const NEED_LABELS = {
  medical:   'Medical',
  jobs:      'Jobs',
  financial: 'Financial',
  education: 'Education',
  others:    'Others',
}

export default function AdminAgentDetail() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const { isTablet } = useBreakpoint()

  const [agent,       setAgent]       = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [{ data: agentData, error: agentErr }, { data: assmData, error: assmErr }] = await Promise.all([
          supabase.from('agents').select('*').eq('id', agentId).single(),
          supabase.from('voter_assessments').select('*').eq('agent_id', agentId).order('updated_at', { ascending: false }),
        ])
        if (agentErr || !agentData) { setNotFound(true); setLoading(false); return }
        setAgent(agentData)
        setAssessments(assmData || [])
      } catch (err) {
        console.error(err)
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [agentId])

  const confirmed = useMemo(() => assessments.filter(a => a.confirmed), [assessments])

  const needBreakdown = useMemo(() => {
    const counts = {}
    assessments.forEach(a => { if (a.need) counts[a.need] = (counts[a.need] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [assessments])

  const lastTouch = assessments[0]?.updated_at
    ? new Date(assessments[0].updated_at).toLocaleString()
    : t('Not yet recorded', 'இன்னும் பதிவு செய்யப்படவில்லை')

  const cell = { padding: '.6rem .8rem', fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', color: C.ink, borderBottom: `1px solid ${C.line}` }
  const th   = { padding: '.6rem .8rem', background: C.g900, color: 'rgba(255,255,255,.6)', fontFamily: "'Outfit',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'left' }

  if (loading) {
    return (
      <div style={{ paddingTop: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', fontFamily: "'Outfit',sans-serif", color: C.ink3 }}>
        {t('Loading…', 'ஏற்றுகிறது…')}
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ paddingTop: 96, maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate('/admin/progress')} style={{ background: 'transparent', border: 'none', color: C.g700, fontWeight: 700, cursor: 'pointer', marginBottom: '1rem', fontFamily: "'Outfit',sans-serif" }}>
          ← {t('Back', 'திரும்பவும்')}
        </button>
        <div style={{ background: C.white, borderRadius: 12, padding: '2rem', border: `1px solid ${C.line}`, textAlign: 'center' }}>
          <h2 style={{ color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{t('Agent not found', 'ஏஜெண்ட் கிடைக்கவில்லை')}</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 96, background: C.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isTablet ? '1.5rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Back */}
        <button onClick={() => navigate('/admin/progress')} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: C.g700, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.9rem' }}>
          ← {t('Back to Progress', 'முன்னேற்றத்திற்கு திரும்பவும்')}
        </button>

        {/* Header */}
        <div style={{ background: C.white, borderRadius: 14, padding: '1.4rem 1.6rem', border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.3rem', fontFamily: "'Outfit',sans-serif" }}>
            {t('Booth Agent', 'பூத் ஏஜெண்ட்')}
          </div>
          <h1 style={{ margin: 0, fontSize: isTablet ? '1.6rem' : '2rem', fontWeight: 900, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
            {agent.full_name || agent.username}
          </h1>
          <div style={{ marginTop: '.5rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontSize: '.82rem', color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>
            <span>🏛 {t('Booth', 'பூத்')} <strong style={{ color: C.g700 }}>{agent.booth_number || '—'}</strong></span>
            {agent.phone && <span>📞 {agent.phone}</span>}
            {agent.email && <span>✉ {agent.email}</span>}
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            {
              label: t('Total Assessed', 'மொத்த பதிவு'),
              value: assessments.length,
              color: C.ink,
              bg: '#f1f5f9',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.g700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ),
            },
            {
              label: t('Needs Captured', 'தேவைகள் பதிவு'),
              value: assessments.filter(a => a.need).length,
              color: '#92400e',
              bg: '#fef3c7',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ),
            },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.07em', color: C.ink3, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color, fontFamily: "'Outfit',sans-serif", lineHeight: 1.1 }}>{value.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Needs + Last touch */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 .8rem', fontSize: '.9rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>{t('Needs Breakdown', 'தேவைகள் பிரிவு')}</h3>
            {needBreakdown.length === 0
              ? <p style={{ color: C.ink3, fontSize: '.82rem', fontFamily: "'Outfit',sans-serif" }}>{t('No needs recorded.', 'தேவைகள் பதிவு இல்லை.')}</p>
              : needBreakdown.map(([need, count]) => (
                <div key={need} style={{ marginBottom: '.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 600, color: C.ink, marginBottom: 3, fontFamily: "'Outfit',sans-serif" }}>
                    <span>{NEED_LABELS[need] || need}</span>
                    <span style={{ color: C.ink3 }}>{count}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / needBreakdown[0][1]) * 100}%`, background: C.g600 }} />
                  </div>
                </div>
              ))
            }
          </div>
          {/* Agent Details card */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '.9rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif", textTransform: 'uppercase', letterSpacing: '.07em' }}>
              {t('Agent Details', 'ஏஜெண்ட் விவரம்')}
            </h3>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[
                { icon: '🏛', label: t('Booth', 'பூத்'), value: agent.booth_number },
                { icon: '📞', label: t('Phone', 'தொலைபேசி'), value: agent.phone },
                { icon: '⏱', label: t('Last Activity', 'கடைசி செயல்'), value: lastTouch },
              ].filter(r => r.value).map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '.6rem', fontSize: '.82rem', fontFamily: "'Outfit',sans-serif" }}>
                  <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: C.ink3, minWidth: 80, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: C.ink, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Links & Donation */}
            {(agent.yt_link || agent.website_link || agent.donation_amount != null) && (
              <>
                <div style={{ height: 1, background: C.line }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {agent.yt_link && (
                    <a href={agent.yt_link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.82rem', fontFamily: "'Outfit',sans-serif", color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>
                      <span>▶</span> <span style={{ wordBreak: 'break-all' }}>{agent.yt_link}</span>
                    </a>
                  )}
                  {agent.website_link && (
                    <a href={agent.website_link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.82rem', fontFamily: "'Outfit',sans-serif", color: C.g700, fontWeight: 600, textDecoration: 'none' }}>
                      <span>🌐</span> <span style={{ wordBreak: 'break-all' }}>{agent.website_link}</span>
                    </a>
                  )}
                  {agent.donation_amount != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.82rem', fontFamily: "'Outfit',sans-serif" }}>
                      <span>💰</span>
                      <span style={{ color: C.ink3 }}>{t('Donation', 'நன்கொடை')}</span>
                      <strong style={{ color: C.ink }}>₹{Number(agent.donation_amount).toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Confirmed voters table */}
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '1rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.g600, flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {t('Confirmed Voters', 'உறுதி வாக்காளர்கள்')}
              <span style={{ marginLeft: 8, background: '#dcfce7', color: C.g700, borderRadius: 20, padding: '2px 10px', fontSize: '.72rem', fontWeight: 700 }}>{confirmed.length}</span>
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  {[t('Voter Name', 'பெயர்'), t('Voter ID', 'வாக்காளர் எண்'), t('Need', 'தேவை'), t('Party', 'கட்சி'), t('Phone', 'தொலைபேசி'), t('Confirmed On', 'உறுதி தேதி')].map(h => (
                    <th key={h} style={{ ...th, background: C.g700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...cell, textAlign: 'center', color: C.ink3, padding: '2rem' }}>
                    {t('No confirmed voters yet.', 'உறுதி வாக்காளர்கள் இல்லை.')}
                  </td></tr>
                ) : confirmed.map((a, idx) => (
                  <tr key={a.voter_id_code} style={{ background: idx % 2 ? '#f0fdf4' : C.white }}>
                    <td style={{ ...cell, fontWeight: 600 }}>{a.voter_name || '—'}</td>
                    <td style={{ ...cell, fontSize: '.75rem', color: C.ink3 }}>{a.voter_id_code}</td>
                    <td style={cell}>{NEED_LABELS[a.need] || a.need || '—'}</td>
                    <td style={cell}>{a.party || '—'}</td>
                    <td style={{ ...cell, color: C.ink3 }}>{a.phone || '—'}</td>
                    <td style={{ ...cell, color: C.ink3, fontSize: '.75rem' }}>
                      {a.confirmed_at ? new Date(a.confirmed_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending / unconfirmed voters table */}
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '1rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {t('Pending / Not Confirmed', 'நிலுவை வாக்காளர்கள்')}
              <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '2px 10px', fontSize: '.72rem', fontWeight: 700 }}>{assessments.filter(a => !a.confirmed).length}</span>
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  {[t('Voter Name', 'பெயர்'), t('Voter ID', 'வாக்காளர் எண்'), t('Need', 'தேவை'), t('Party', 'கட்சி'), t('Phone', 'தொலைபேசி'), t('Last Updated', 'புதுப்பிக்கப்பட்டது')].map(h => (
                    <th key={h} style={{ ...th, background: '#78350f' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.filter(a => !a.confirmed).length === 0 ? (
                  <tr><td colSpan={6} style={{ ...cell, textAlign: 'center', color: C.ink3, padding: '2rem' }}>
                    {t('All assessed voters are confirmed!', 'அனைத்து வாக்காளர்களும் உறுதி செய்யப்பட்டுள்ளனர்!')}
                  </td></tr>
                ) : assessments.filter(a => !a.confirmed).map((a, idx) => (
                  <tr key={a.voter_id_code} style={{ background: idx % 2 ? '#fffbeb' : C.white }}>
                    <td style={{ ...cell, fontWeight: 600 }}>{a.voter_name || '—'}</td>
                    <td style={{ ...cell, fontSize: '.75rem', color: C.ink3 }}>{a.voter_id_code}</td>
                    <td style={cell}>{NEED_LABELS[a.need] || a.need || '—'}</td>
                    <td style={cell}>{a.party || '—'}</td>
                    <td style={{ ...cell, color: C.ink3 }}>{a.phone || '—'}</td>
                    <td style={{ ...cell, color: C.ink3, fontSize: '.75rem' }}>
                      {a.updated_at ? new Date(a.updated_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
