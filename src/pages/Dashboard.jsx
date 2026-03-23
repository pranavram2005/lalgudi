import { useEffect, useMemo, useState } from 'react'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { Footer } from '../components/ui'
import { C } from '../data'
import voters from '../voters/output_with_roof_laalgui.jsx'
import { useAuth } from '../context/AuthContext'

const initialAgeGroups = () => ({
  '18-20': 0,
  '21-25': 0,
  '26-40': 0,
  '41-50': 0,
  '51-70+': 0,
})

const normaliseText = (value) => (value ?? '').toString().trim()

const computeBaseStats = (dataset) => {
  const totals = {
    totalVoters: dataset.length,
    constituencies: 0,
    wards: 0,
    taluks: 0,
    booths: 0,
    streets: 0,
    maleVoters: 0,
    femaleVoters: 0,
    transgenderVoters: 0,
    ageGroups: initialAgeGroups(),
  }

  const constituencySet = new Set()
  const wardSet = new Set()
  const talukSet = new Set()
  const boothSet = new Set()
  const streetSet = new Set()

  dataset.forEach(voter => {
    const constituency = normaliseText(voter['Constituency'])
    const ward = normaliseText(voter['Ward'])
    const taluk = normaliseText(voter['Division'])
    const street = normaliseText(voter['Village'])
    const booth = voter['Part']

    if (constituency) constituencySet.add(constituency)
    if (ward) wardSet.add(ward)
    if (taluk) talukSet.add(taluk)
    if (street) streetSet.add(street)
    if (booth !== undefined && booth !== null && booth !== '') boothSet.add(String(booth))

    const gender = normaliseText(voter['Gender']).toLowerCase()
    if (!gender) {
      return
    }
    if (gender.includes('பெண்') || gender === 'f' || gender.includes('female')) {
      totals.femaleVoters += 1
    } else if (gender.includes('திரு') || gender.includes('trans') || gender === 'other') {
      totals.transgenderVoters += 1
    } else {
      totals.maleVoters += 1
    }

    const age = Number(voter['Age'])
    if (!Number.isFinite(age)) return
    if (age >= 18 && age <= 20) totals.ageGroups['18-20'] += 1
    else if (age >= 21 && age <= 25) totals.ageGroups['21-25'] += 1
    else if (age >= 26 && age <= 40) totals.ageGroups['26-40'] += 1
    else if (age >= 41 && age <= 50) totals.ageGroups['41-50'] += 1
    else if (age >= 51) totals.ageGroups['51-70+'] += 1
  })

  totals.constituencies = constituencySet.size
  totals.wards = wardSet.size
  totals.taluks = talukSet.size
  totals.streets = streetSet.size
  totals.booths = boothSet.size
  return totals
}

const StatCard = ({ number = 0, label, accent = C.au2 }) => (
  <div
    style={{
      border: `1px solid ${accent}`,
      borderRadius: 14,
      padding: '1.1rem',
      background: C.white,
      boxShadow: '0 10px 28px rgba(12,53,34,.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '.35rem',
      minHeight: 120,
    }}
  >
    <span style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 900, color: C.ink, letterSpacing: '-.01em' }}>
      {Number(number).toLocaleString()}
    </span>
    <span style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.ink3 }}>
      {label}
    </span>
  </div>
)

const GenderStat = ({ icon, label, count, accent }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderRadius: 14,
    border: `1px solid ${accent}`,
    padding: '1rem',
    background: C.white,
    boxShadow: '0 10px 24px rgba(12,53,34,.06)'
  }}>
    <div style={{
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.4rem',
      color: C.white,
      fontWeight: 700,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: C.ink }}>{Number(count).toLocaleString()}</div>
      <div style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', color: C.ink3, marginTop: '.1rem' }}>{label}</div>
    </div>
  </div>
)

export default function Dashboard() {
  const { lang, t } = useLang()
  const { isTablet, isMobile } = useBreakpoint()
  const { user } = useAuth()
  const isAgentView = user?.role === 'agent'
  const dataset = useMemo(() => {
    if (isAgentView) {
      const booth = (user?.boothNumber ?? '').toString()
      return (voters ?? []).filter(row => String(row?.Part ?? '') === booth)
    }
    return voters ?? []
  }, [isAgentView, user])
  const baseStats = useMemo(() => computeBaseStats(dataset), [dataset])
  const [confirmation, setConfirmation] = useState({ count: 0, percent: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    try {
      const raw = window.localStorage.getItem('voterChecklists')
      if (!raw) {
        setConfirmation({ count: 0, percent: 0 })
        return undefined
      }
      const parsed = JSON.parse(raw)
      const count = Object.values(parsed || {}).filter(entry => entry && entry.confirmed).length
      const percent = dataset.length ? (count / dataset.length) * 100 : 0
      setConfirmation({ count, percent })
    } catch (err) {
      setConfirmation({ count: 0, percent: 0 })
    }
    return undefined
  }, [dataset.length])

  const stats = {
    ...baseStats,
    confirmedCount: confirmation.count,
    confirmationPercent: confirmation.percent,
  }

  const label = {
    title: t('Voter Intelligence Dashboard', 'வாக்காளர் நுண்ணறிவு டாஷ்போர்டு'),
    subtitle: t('Live field intelligence snapshot · auto-refreshes with your checklist updates.', 'தங்களது களப் பட்டியல் புதுப்பிப்புகளுடன் ஒத்திசைக்கப்படும் நேரடி கண்காணிப்பு.'),
    boothTitle: t('Booth {{num}} Intelligence Dashboard', 'பூத் {{num}} நுண்ணறிவு டாஷ்போர்டு'),
    boothSubtitle: t('Showing live metrics for Booth {{num}} only.', 'பூத் {{num}} தொடர்பான தரவுகளை மட்டும் காட்டுகிறது.'),
    confirmation: t('Overall Vote Confirmation Progress', 'மொத்த வாக்கு உறுதி முன்னேற்றம்'),
    confirmedOf: t('voters confirmed', 'வாக்காளர்கள் உறுதி செய்யப்பட்டனர்'),
    constituencies: t('Constituencies', 'தொகுதிகள்'),
    booths: t('Booths', 'வாக்குச்சாவடிகள்'),
    wards: t('Wards', 'வார்டுகள்'),
    nagars: t('Nagars / Divisions', 'நகரங்கள் / பிரிவுகள்'),
    streets: t('Village / Streets', 'கிராமங்கள் / தெருக்கள்'),
    voters: t('Voters', 'வாக்காளர்கள்'),
    gender: t('Gender Split', 'பாலினப் பகிர்வு'),
    male: t('Male', 'ஆண்'),
    female: t('Female', 'பெண்'),
    transgender: t('Transgender', 'திருநங்கை'),
    voterAgeGraph: t('Voter Age Graph', 'வாக்காளர் வயது வரைபடம்'),
    voterAxis: t('No. of Voters', 'வாக்காளர்களின் எண்ணிக்கை'),
    guidance: t('Use the navigation above to jump between dashboard intelligence and detailed voter files.', 'டாஷ்போர்டு பொறிமுறையும் விரிவான வாக்காளர் பதிவுகளும் இடையே நகர மெனுவைப் பயன்படுத்தவும்.'),
  }

  const maxAgeCount = Math.max(0, ...Object.values(stats.ageGroups || {}))
  const midAgeCount = Math.round(maxAgeCount / 2)

  const scopedTitle = isAgentView
    ? label.boothTitle.replace('{{num}}', user?.boothNumber || '')
    : label.title
  const scopedSubtitle = isAgentView
    ? label.boothSubtitle.replace('{{num}}', user?.boothNumber || '')
    : label.subtitle

  return (
    <div style={{ paddingTop: 96, background: C.white }}>
      <div style={{
        background: C.white,
        color: C.ink,
        minHeight: 'calc(100vh - 96px)',
        padding: isTablet ? '1.6rem 1.2rem 2.2rem' : '2.6rem 3.2rem 3rem',
      }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <header>
            <p style={{ fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.4rem' }}>
              {lang === 'ta' ? 'அறிக்கை · 23 ஏப்ரல் 2026' : 'Report · 23 April 2026'}
            </p>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: isTablet ? '2rem' : '2.6rem', fontWeight: 900, margin: 0, color: C.ink }}>{scopedTitle}</h1>
            <p style={{ fontSize: '.95rem', color: C.ink2, marginTop: '.6rem', maxWidth: 720 }}>{scopedSubtitle}</p>
            {isAgentView && (
              <div style={{
                marginTop: '.9rem',
                padding: '.85rem 1rem',
                borderRadius: 14,
                border: '1px solid rgba(62,179,112,.35)',
                background: 'rgba(62,179,112,.12)',
                color: C.g700,
                fontSize: '.85rem',
                fontWeight: 600,
              }}>
                {t('You are seeing only the voters assigned to Booth {{num}}.', 'பூத் {{num}}-க்கு உங்களிடம் ஒதுக்கப்பட்ட வாக்காளர்கள் மட்டுமே காட்டப்படுகின்றனர்.').replace('{{num}}', user?.boothNumber || '')}
              </div>
            )}
          </header>

          <section style={{
            borderRadius: 16,
            border: `1px solid ${C.line}`,
            padding: isTablet ? '1.2rem' : '1.6rem',
            background: C.white,
            boxShadow: '0 10px 30px rgba(15,42,26,.08)',
          }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.3rem' }}>{label.confirmation}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.ink }}>
                  {stats.confirmedCount.toLocaleString()} / {stats.totalVoters.toLocaleString()} · {stats.confirmationPercent.toFixed(1)}%
                </div>
                <div style={{ fontSize: '.8rem', color: C.ink2, marginTop: '.2rem' }}>{label.confirmedOf}</div>
              </div>
              <div style={{ flex: 1, width: '100%' }}>
                <div style={{ height: 16, borderRadius: 999, background: C.line2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.confirmationPercent}%`, background: `linear-gradient(90deg, ${C.g500}, ${C.g300})`, transition: 'width .4s ease' }} />
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(auto-fit,minmax(180px,1fr))' : 'repeat(3,1fr)', gap: '1rem' }}>
            <StatCard number={stats.constituencies} label={label.constituencies} accent={C.au2} />
            <StatCard number={stats.booths} label={label.booths} accent={C.g500} />
            <StatCard number={stats.wards} label={label.wards} accent={C.g300} />
            <StatCard number={stats.taluks} label={label.nagars} accent={C.g600} />
            <StatCard number={stats.streets} label={label.streets} accent={C.ink2} />
            <StatCard number={stats.totalVoters} label={label.voters} accent={C.au} />
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.15fr 1fr', gap: isTablet ? '1.6rem' : '2.4rem' }}>
            <div style={{
              borderRadius: 16,
              border: `1px solid ${C.line}`,
              padding: isTablet ? '1.1rem' : '1.5rem',
              background: C.white,
              boxShadow: '0 8px 24px rgba(15,42,26,.08)',
            }}>
              <h3 style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: '1.2rem' }}>{label.gender}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                <GenderStat icon="♂" label={label.male} count={stats.maleVoters} accent="rgba(74,144,226,.45)" />
                <GenderStat icon="♀" label={label.female} count={stats.femaleVoters} accent="rgba(236,118,160,.45)" />
                <GenderStat icon="⚧" label={label.transgender} count={stats.transgenderVoters} accent="rgba(186,129,244,.45)" />
              </div>
            </div>

            <div style={{
              borderRadius: 16,
              border: `1px solid ${C.line}`,
              padding: isTablet ? '1.1rem' : '1.5rem',
              background: C.white,
              boxShadow: '0 8px 24px rgba(15,42,26,.08)',
            }}>
              <h3 style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: C.ink3, marginBottom: '1rem' }}>{label.voterAgeGraph}</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? '.6rem' : '1.2rem', minHeight: isMobile ? 200 : 240, paddingBottom: '1rem' }}>
                {Object.entries(stats.ageGroups).map(([range, count]) => {
                  const height = maxAgeCount > 0 ? (count / maxAgeCount) * 100 : 0
                  return (
                    <div key={range} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '.75rem', color: C.ink, fontWeight: 600, marginBottom: '.35rem' }}>{count.toLocaleString()}</div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                        <div style={{ width: '100%', height: `${height}%`, background: `linear-gradient(180deg, ${C.g500}, ${C.g300})`, borderRadius: '10px 10px 0 0', transition: 'height .4s ease', boxShadow: '0 6px 18px rgba(14,70,40,.2)' }} />
                      </div>
                      <div style={{ fontSize: '.7rem', color: C.ink3, marginTop: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{range}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: '.6rem', fontSize: '.68rem', color: C.ink3, textAlign: 'right' }}>{label.voterAxis}</div>
            </div>
          </section>

          <p style={{ textAlign: 'center', fontSize: '.78rem', color: C.ink3 }}>
            {isAgentView
              ? t('Use the tabs to review your booth dashboard and voter file. Other constituencies stay hidden.', 'உங்கள் பூத் டாஷ்போர்டும் வாக்காளர் பட்டியலும் மட்டுமே காண்பிக்கப்படுகின்றன; பிற தொகுதிகள் மறைக்கப்பட்டுள்ளன.')
              : label.guidance}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
