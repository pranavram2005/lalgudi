import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { C } from '../data'
import voters from '../voters/output_with_roof_laalgui.jsx'

const AGENT_KEY = 'boothAgents'
const CHECKLIST_KEY = 'voterChecklists'

const loadAgents = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(AGENT_KEY) || '[]')
  } catch (err) {
    return []
  }
}

const loadChecklists = () => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '{}')
  } catch (err) {
    return {}
  }
}

const getVoterId = (row = {}) => {
  const code = row['ID Code'] || row['id'] || row['ID']
  if (code) return String(code)
  const serial = row['S.No'] || row['serial']
  return serial ? String(serial) : undefined
}

export default function AdminProgress() {
  const { t, lang } = useLang()
  const { isTablet } = useBreakpoint()
  const navigate = useNavigate()
  const dataset = voters || []
  const [agents, setAgents] = useState(() => loadAgents())
  const [checklists, setChecklists] = useState(() => loadChecklists())

  useEffect(() => {
    setAgents(loadAgents())
    setChecklists(loadChecklists())
  }, [])

  const confirmedEntries = useMemo(() => {
    return Object.entries(checklists).filter(([, entry]) => Boolean(entry?.confirmed))
  }, [checklists])

  const totalVoters = dataset.length
  const confirmedCount = confirmedEntries.length
  const progressPercent = totalVoters ? (confirmedCount / totalVoters) * 100 : 0

  const agentRows = useMemo(() => {
    const statsByAgent = confirmedEntries.reduce((acc, [voterId, entry]) => {
      if (!entry?.agent) return acc
      const bucket = acc[entry.agent] || { confirmed: 0, latest: null }
      bucket.confirmed += 1
      if (entry.updatedAt) {
        const ts = new Date(entry.updatedAt).getTime()
        if (!bucket.latest || ts > bucket.latest) bucket.latest = ts
      }
      acc[entry.agent] = bucket
      return acc
    }, {})

    return agents.map(agent => {
      const stat = statsByAgent[agent.username] || { confirmed: 0, latest: null }
      return {
        ...agent,
        confirmed: stat.confirmed,
        latest: stat.latest,
      }
    })
  }, [agents, confirmedEntries])

  return (
    <div style={{ paddingTop: 96, background: C.g50, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isTablet ? '1.5rem' : '2.5rem 2.6rem 3.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header style={{ background: C.white, borderRadius: 20, padding: isTablet ? '1.4rem' : '2rem', border: `1px solid ${C.line}`, boxShadow: '0 24px 60px rgba(15,42,26,.08)' }}>
          <p style={{ fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.35rem' }}>
            {lang === 'ta' ? 'நிலை அறிக்கை · 23 ஏப்ரல் 2026' : 'Status Report · 23 April 2026'}
          </p>
          <h1 style={{ margin: 0, fontSize: isTablet ? '2rem' : '2.4rem', fontWeight: 900, color: C.ink }}>
            {t('Vote Confirmation Control Room', 'வாக்கு உறுதி கட்டுப்பாட்டு அறை')}
          </h1>
          <p style={{ fontSize: '.95rem', color: C.ink2, marginTop: '.5rem', maxWidth: 720 }}>
            {t('Live snapshot of booth agent performance and field requests. Use the agent table below to audit secured votes and citizen needs.', 'பூத் ஏஜெண்ட்களின் செயல்பாடும் களத் தேவைகளும் ஒரே இடத்தில். உறுதிப்படுத்தப்பட்ட வாக்குகளையும் தேவைகளையும் கீழுள்ள அட்டவணையில் ஆய்வு செய்யுங்கள்.')}
          </p>
          <div style={{ marginTop: '1.4rem', border: `1px solid ${C.line}`, borderRadius: 16, padding: '1.2rem 1.4rem', background: C.line2 }}>
            <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: '1rem', alignItems: isTablet ? 'flex-start' : 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.4rem' }}>
                  {t('Overall Confirmation Progress', 'மொத்த உறுதி முன்னேற்றம்')}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: C.ink }}>
                  {confirmedCount.toLocaleString()} / {totalVoters.toLocaleString()} · {progressPercent.toFixed(1)}%
                </div>
              </div>
              <div style={{ flex: 2, width: '100%' }}>
                <div style={{ height: 16, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: `linear-gradient(90deg, ${C.g500}, ${C.g700})`, transition: 'width .4s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section style={{ background: C.white, borderRadius: 20, padding: isTablet ? '1.2rem' : '1.6rem', border: `1px solid ${C.line}`, boxShadow: '0 18px 50px rgba(15,42,26,.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isTablet ? 'flex-start' : 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: C.ink, fontWeight: 900 }}>{t('Booth Agent Performance', 'பூத் ஏஜெண்ட் செயல்திறன்')}</h2>
              <p style={{ marginTop: '.2rem', color: C.ink3, fontSize: '.9rem' }}>
                {t('Click an agent row to open their detailed dossier and secured voters.', 'ஏஜெண்ட் வரியை சொடுக்கி அவர்களின் விவரமும் உறுதி செய்த வாக்காளர்களையும் காண்க.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setAgents(loadAgents()); setChecklists(loadChecklists()); }}
              style={{ border: `1px solid ${C.g500}`, background: 'transparent', color: C.g700, borderRadius: 999, padding: '.6rem 1.2rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}
            >
              {t('Refresh Data', 'தரவைப் புதுப்பிக்க')}
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ background: C.g900, color: '#fff' }}>
                  {[t('Agent', 'ஏஜெண்ட்'), t('Booth', 'பூத்'), t('Phone', 'தொலைபேசி'), t('Website', 'இணையதளம்'), t('Confirmed Votes', 'உறுதி வாக்குகள்'), t('Last Update', 'கடைசி புதுப்பிப்பு')].map(header => (
                    <th key={header} style={{ padding: '.75rem .9rem', textAlign: 'left', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentRows.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: C.ink3 }}>{t('No booth agents available. Add agents to start tracking.', 'பூத் ஏஜெண்ட்கள் இல்லை. கண்காணிக்க ஏஜெண்ட்களை சேர்க்கவும்.')}</td></tr>
                ) : agentRows.map(agent => {
                  const lastUpdate = agent.latest
                    ? new Date(agent.latest).toLocaleString()
                    : '—'
                  return (
                    <tr
                      key={agent.id}
                      onClick={() => navigate(`/admin/agents/${agent.id}`)}
                      style={{
                        borderBottom: `1px solid ${C.line}`,
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '.85rem .9rem', fontWeight: 700, color: C.ink }}>{agent.username}</td>
                      <td style={{ padding: '.85rem .9rem', color: C.ink2 }}>{agent.boothNumber || '—'}</td>
                      <td style={{ padding: '.85rem .9rem', color: C.ink3 }}>{agent.phoneNumber || '—'}</td>
                      <td style={{ padding: '.85rem .9rem', color: C.g500 }}>
                        {agent.websiteLink ? (
                          <a href={agent.websiteLink} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ color: C.g600 }}>
                            {t('Open Site', 'தளத்தைத் திற')}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '.85rem .9rem', color: C.g700, fontWeight: 700 }}>{agent.confirmed}</td>
                      <td style={{ padding: '.85rem .9rem', color: C.ink3 }}>{lastUpdate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
