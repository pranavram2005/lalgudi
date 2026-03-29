import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import data1 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-1-WI_with_roof'
import data2 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-2-WI_with_roof'
import data3 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-3-WI_with_roof'
import data4 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-4-WI_with_roof'
import data5 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-5-WI_with_roof'
import data6 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-6-WI_with_roof'
import data7 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-7-WI_with_roof'
import data8 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-8-WI_with_roof'
import data9 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-9-WI_with_roof'
import data10 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-10-WI_with_roof'

const allVotersData = [
  ...data1,
  ...data2,
  ...data3,
  ...data4,
  ...data5,
  ...data6,
  ...data7,
  ...data8,
  ...data9,
  ...data10,
]
import { C } from '../data'

const LS_AGENTS_KEY = 'boothAgents'
const LS_CHECKLIST_KEY = 'voterChecklists'

const NEED_LABELS = {
  housing: { en: 'Housing', ta: 'வீடு' },
  education: { en: 'Education', ta: 'கல்வி' },
  employment: { en: 'Employment', ta: 'வேலை' },
  medical: { en: 'Medical', ta: 'மருத்துவம்' },
  infrastructure: { en: 'Infrastructure', ta: 'அடிக்கட்டமைப்பு' },
  welfare: { en: 'Welfare', ta: 'நலத்திட்டம்' },
  partySupport: { en: 'Party Support', ta: 'கட்சி ஆதரவு' },
  other: { en: 'Other', ta: 'மற்றவை' },
}

const getStoredAgents = () => {
  try {
    const raw = localStorage.getItem(LS_AGENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to parse booth agents from storage', err)
    return []
  }
}

const getStoredChecklists = () => {
  try {
    const raw = localStorage.getItem(LS_CHECKLIST_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    console.error('Failed to parse voter checklists', err)
    return {}
  }
}

export default function AdminAgentDetail() {
    // Get number of confirmed checklists from localStorage
    const [confirmedCount, setConfirmedCount] = useState(0);
    useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('voterChecklists');
          if (raw) {
            const parsed = JSON.parse(raw);
            const count = Object.values(parsed || {}).filter(entry => entry && entry.confirmed).length;
            setConfirmedCount(count);
          } else {
            setConfirmedCount(0);
          }
        } catch {
          setConfirmedCount(0);
        }
      }
    }, []);
  const { agentId } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { isTablet } = useBreakpoint()
  const dataset = allVotersData || []
  const [agents, setAgents] = useState([])
  const [checklists, setChecklists] = useState({})
  const handleBack = () => navigate('/admin/progress')

  useEffect(() => {
    setAgents(getStoredAgents())
    setChecklists(getStoredChecklists())
  }, [dataset])

  const agent = useMemo(
    () => agents.find(item => item.id === agentId),
    [agents, agentId],
  )

  const voterMap = useMemo(() => {
    const map = new Map()
    dataset.forEach(row => {
      const id = row['ID Code'] || row.id || row.ID
      if (id) map.set(id, row)
    })
    return map
  }, [])

  const securedRows = useMemo(() => {
    if (!agent?.username) return []
    return Object.entries(checklists)
      .filter(([, entry]) => entry?.confirmed && entry?.agent === agent.username)
      .map(([voterId, entry]) => ({
        voterId,
        entry,
        voter: voterMap.get(voterId) || {},
      }))
      .sort((a, b) => {
        const aTime = a.entry?.updatedAt ? new Date(a.entry.updatedAt).getTime() : 0
        const bTime = b.entry?.updatedAt ? new Date(b.entry.updatedAt).getTime() : 0
        return bTime - aTime
      })
  }, [agent?.username, checklists, voterMap])

  const needBreakdown = useMemo(() => {
    return securedRows.reduce((acc, row) => {
      const key = row.entry?.need || 'other'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }, [securedRows])

  const lastTouch = securedRows[0]?.entry?.updatedAt
    ? new Date(securedRows[0].entry.updatedAt).toLocaleString()
    : t('Not yet recorded', 'இன்னும் பதிவு செய்யப்படவில்லை')

  const renderNeedLabel = needKey => NEED_LABELS[needKey]?.[lang === 'ta' ? 'ta' : 'en'] || needKey

  if (agents.length && !agent) {
    return (
      <div style={{ padding: isTablet ? '1.25rem' : '2.5rem' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.g700,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← {t('Back to Command Room', 'கமாண்டு ரூமுக்கு திரும்பவும்')}
        </button>
        <div style={{
          background: C.white,
          borderRadius: 16,
          padding: '2rem',
          border: `1px solid ${C.line}`,
          textAlign: 'center',
        }}>
          <h1 style={{ marginBottom: '.5rem', color: C.ink }}>{t('Agent not found', 'ஏஜெண்ட் கிடைக்கவில்லை')}</h1>
          <p style={{ color: C.ink3 }}>{t('The requested booth agent record no longer exists.', 'கோரிய பூத் ஏஜெண்ட் பதிவு இல்லை.')}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: isTablet ? '1.25rem' : '2.5rem', background: '#fbfffc', minHeight: '100vh' }}>
      <div style={{ fontWeight: 700, color: C.g700, fontSize: '1.1rem', marginBottom: '.7rem' }}>
        Division ({confirmedCount})
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.g700,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ← {t('Back to Command Room', 'கமாண்டு ரூமுக்கு திரும்பவும்')}
        </button>
        <span style={{ color: C.ink3, fontSize: '.85rem' }}>{t('Agent dossier', 'ஏஜெண்ட் சுயவிவரம்')}</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: isTablet ? '1.8rem' : '2.2rem', color: C.ink, fontWeight: 900 }}>
          {agent?.username || t('Loading agent…', 'ஏஜெண்ட் ஏற்றப்படுகிறது…')}
        </h1>
        <p style={{ color: C.ink3, marginTop: '.4rem' }}>
          {agent?.boothNumber
            ? t('Booth {{boothNumber}} · Phone {{phone}}', 'பூத் {{boothNumber}} · தொலை {{phone}}')
              .replace('{{boothNumber}}', agent.boothNumber)
              .replace('{{phone}}', agent.phoneNumber || '—')
            : t('Booth assignment pending', 'பூத் ஒதுக்கீடு நிலுவையில்')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : 'repeat(3, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ background: C.white, borderRadius: 16, padding: '1.25rem', border: `1px solid ${C.line}` }}>
          <p style={{ margin: 0, fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }}>{t('Confirmed Votes', 'உறுதி வாக்குகள்')}</p>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: C.g900 }}>{securedRows.length}</div>
          <p style={{ margin: 0, color: C.ink3 }}>{t('Total voters personally secured by this agent.', 'இந்த ஏஜெண்ட் உறுதி செய்த மொத்த வாக்காளர்கள்')}</p>
        </div>
        <div style={{ background: C.white, borderRadius: 16, padding: '1.25rem', border: `1px solid ${C.line}` }}>
          <p style={{ margin: 0, fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }}>{t('Top Needs', 'முக்கிய தேவைகள்')}</p>
          <div style={{ marginTop: '.4rem', color: C.ink, fontWeight: 700 }}>
            {Object.keys(needBreakdown).length
              ? Object.entries(needBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([need, count]) => `${renderNeedLabel(need)} (${count})`)
                  .join(' · ')
              : t('No needs logged yet', 'தேவைகள் பதிவு செய்யப்படவில்லை')}
          </div>
          <p style={{ margin: 0, color: C.ink3 }}>{t('What voters are asking for most often.', 'வாக்காளர்கள் கூறும் முக்கிய தேவைகள்')}</p>
        </div>
        <div style={{ background: C.white, borderRadius: 16, padding: '1.25rem', border: `1px solid ${C.line}` }}>
          <p style={{ margin: 0, fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }}>{t('Last Interaction', 'கடைசி தொடர்பு')}</p>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.ink }}>{lastTouch}</div>
          <p style={{ margin: 0, color: C.ink3 }}>{t('Most recent voter confirmation logged.', 'சமீபத்திய வாக்காளர் பதிவு')}</p>
        </div>
      </div>

      <div style={{
        background: C.white,
        borderRadius: 20,
        padding: isTablet ? '1.1rem' : '1.5rem',
        border: `1px solid ${C.line}`,
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ marginTop: 0, color: C.ink }}>{t('Agent Contacts & Assets', 'ஏஜெண்ட் தொடர்புகள் & வளங்கள்')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ color: C.ink3, marginBottom: '.25rem' }}>{t('Phone', 'தொலைபேசி')}</p>
            <div style={{ fontWeight: 700 }}>{agent?.phoneNumber || '—'}</div>
          </div>
          <div>
            <p style={{ color: C.ink3, marginBottom: '.25rem' }}>{t('WhatsApp', 'வாட்ஸ்அப்')}</p>
            <div style={{ fontWeight: 700 }}>{agent?.whatsappNumber || '—'}</div>
          </div>
          <div>
            <p style={{ color: C.ink3, marginBottom: '.25rem' }}>{t('Website', 'இணையதளம்')}</p>
            {agent?.websiteLink ? (
              <a href={agent.websiteLink} target="_blank" rel="noreferrer" style={{ color: C.g700, fontWeight: 700 }}>
                {agent.websiteLink}
              </a>
            ) : (
              <div style={{ fontWeight: 700 }}>—</div>
            )}
          </div>
          <div>
            <p style={{ color: C.ink3, marginBottom: '.25rem' }}>{t('YouTube', 'யூட்யூப்')}</p>
            {agent?.youtubeLink ? (
              <a href={agent.youtubeLink} target="_blank" rel="noreferrer" style={{ color: C.g700, fontWeight: 700 }}>
                {agent.youtubeLink}
              </a>
            ) : (
              <div style={{ fontWeight: 700 }}>—</div>
            )}
          </div>
        </div>
      </div>

      <section style={{ background: C.white, borderRadius: 20, padding: isTablet ? '1.1rem' : '1.5rem', border: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ marginTop: 0, color: C.ink }}>{t('Secured Voters', 'உறுதி வாக்காளர்கள்')}</h2>
            <p style={{ color: C.ink3 }}>{t('Full list of confirmations this agent logged.', 'இந்த ஏஜெண்ட் உறுதி செய்த வாக்காளர்கள் பட்டியல்')}</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: C.line2 }}>
                {[t('Voter', 'வாக்காளர்'), t('Booth / Part', 'பூத் / பகுதி'), t('Need Logged', 'தேவை பதிவு'), t('Party Preference', 'ஆதரவு கட்சி'), t('Phone', 'தொலைபேசி'), t('Confirmed On', 'உறுதி தேதி')].map(header => (
                  <th key={header} style={{ padding: '.65rem .8rem', textAlign: 'left', fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {securedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: C.ink3 }}>
                    {t('No confirmed voters yet. Encourage the agent to log their outreach.', 'இன்னும் உறுதி வாக்காளர்கள் இல்லை. தொடர் தொடர்பை பதிவு செய்ய ஊக்குவிக்கவும்.')}
                  </td>
                </tr>
              ) : (
                securedRows.map(({ voterId, entry, voter }) => {
                  const needLabel = entry.need ? renderNeedLabel(entry.need) : t('Not captured', 'பதிவு செய்யப்படவில்லை')
                  return (
                    <tr key={voterId} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: '.6rem .7rem', fontSize: '.8rem' }}>
                        <div style={{ fontWeight: 700, color: C.ink }}>{voter['Name'] || t('Unknown Voter', 'அறியாதவர்')}</div>
                        <div style={{ fontSize: '.7rem', color: C.ink3 }}>{voter['ID Code'] || voterId}</div>
                      </td>
                      <td style={{ padding: '.6rem .7rem', color: C.ink3, fontSize: '.78rem' }}>{voter['Part'] ? `${t('Booth', 'பூத்')} ${voter['Part']}` : '—'}</td>
                      <td style={{ padding: '.6rem .7rem', color: C.ink, fontSize: '.78rem' }}>{needLabel}</td>
                      <td style={{ padding: '.6rem .7rem', color: C.ink3, fontSize: '.78rem' }}>{entry.party || '—'}</td>
                      <td style={{ padding: '.6rem .7rem', color: C.ink3, fontSize: '.78rem' }}>{entry.phone || '—'}</td>
                      <td style={{ padding: '.6rem .7rem', color: C.ink3, fontSize: '.78rem' }}>{entry.confirmedAt ? new Date(entry.confirmedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ marginTop: '1.5rem', textAlign: isTablet ? 'center' : 'left' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            borderRadius: 999,
            border: `1px solid ${C.g500}`,
            background: '#fff',
            color: C.g700,
            padding: '.65rem 1.5rem',
            fontWeight: 700,
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ← {t('Back to Command Room', 'கமாண்டு ரூமுக்கு திரும்பவும்')}
        </button>
      </div>
    </div>
  )
}
