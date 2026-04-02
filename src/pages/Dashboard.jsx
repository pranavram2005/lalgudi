import { useEffect, useState, useRef } from 'react'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { Footer } from '../components/ui'
import { C } from '../data'
import { fetchBoothStats } from '../lib/fetchBoothStats'
import { fetchLocationCounts } from '../lib/supabase'
import BoothDropdown from '../components/BoothDropdown'
import { useAuth } from '../context/AuthContext'

// ─── Add to your index.html ──────────────────────────────────────
// <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

// ─── Design tokens — same C.* values, layered on top ────────────
const T = {
  g900:  '#0B2618',
  g800:  '#143D26',
  g700:  '#1A5C35',
  g600:  C.g600 || '#2E7D52',
  g400:  '#4CAF50',
  g200:  '#A8D5B5',
  g50:   '#F0FAF3',
  au2:   C.au2  || '#D4A017',
  white: C.white || '#FFFFFF',
  ink:   C.ink   || '#111111',
  ink2:  C.ink2  || '#333333',
  ink3:  C.ink3  || '#666666',
  line:  C.line  || '#E5E7EB',
}

// ─── Inject Chart.js if not already on page ──────────────────────
function ensureChartJS() {
  return new Promise((resolve) => {
    if (window.Chart) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

// ─── Stat Card ───────────────────────────────────────────────────
const StatCard = ({ number = 0, label, accent = T.au2, icon }) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 20,
      padding: '1.4rem 1.6rem',
      background: T.white,
      border: `1.5px solid ${T.line}`,
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(11,38,24,0.07)',
      display: 'flex',
      flexDirection: 'column',
      gap: '.5rem',
      minHeight: 130,
      transition: 'transform .2s, box-shadow .2s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform  = 'translateY(-3px)'
      e.currentTarget.style.boxShadow  = '0 8px 32px rgba(11,38,24,0.13)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform  = 'translateY(0)'
      e.currentTarget.style.boxShadow  = '0 2px 16px rgba(11,38,24,0.07)'
    }}
  >
    {/* top accent stripe */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: accent, borderRadius: '20px 20px 0 0',
    }} />
    {/* faint background circle */}
    <div style={{
      position: 'absolute', bottom: -24, right: -16,
      width: 90, height: 90, borderRadius: '50%',
      background: accent, opacity: .07,
    }} />
    {icon && (
      <span style={{ fontSize: 20, lineHeight: 1, marginBottom: 2 }}>{icon}</span>
    )}
    <span style={{
      fontFamily: "'Georgia','Times New Roman',serif",
      fontSize: 'clamp(1.8rem,3vw,2.4rem)',
      fontWeight: 900,
      color: T.g900,
      letterSpacing: '-.02em',
      lineHeight: 1,
    }}>
      {Number(number).toLocaleString()}
    </span>
    <span style={{
      fontSize: '.6rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '.12em', color: T.ink3,
    }}>
      {label}
    </span>
  </div>
)

// ─── Gender Card ─────────────────────────────────────────────────
const GenderStat = ({ icon, label, count, accent, pct }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: '1.1rem',
      borderRadius: 18, border: `1.5px solid ${T.line}`,
      padding: '1.1rem 1.4rem', background: T.white, flex: 1,
      boxShadow: '0 2px 12px rgba(11,38,24,0.06)',
      position: 'relative', overflow: 'hidden',
      transition: 'transform .2s', cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    {/* bottom progress bar */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      height: 3, width: `${pct}%`,
      background: accent, borderRadius: 99, transition: 'width 1s ease',
    }} />
    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: accent + '22', border: `1.5px solid ${accent}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0, color: accent, fontWeight: 700,
    }}>
      {icon}
    </div>
    <div>
      <div style={{
        fontFamily: "'Georgia','Times New Roman',serif",
        fontSize: '1.35rem', fontWeight: 800,
        color: T.g900, lineHeight: 1, letterSpacing: '-.01em',
      }}>
        {Number(count).toLocaleString()}
      </div>
      <div style={{
        fontSize: '.6rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.1em',
        color: T.ink3, marginTop: 3,
      }}>
        {label}
      </div>
      <div style={{ fontSize: '.68rem', color: accent, fontWeight: 600, marginTop: 2 }}>
        {pct.toFixed(1)}%
      </div>
    </div>
  </div>
)

// ─── Confirmation Doughnut (Chart.js) ────────────────────────────
function ConfirmationRing({ confirmed, total }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const pct = total ? ((confirmed / total) * 100).toFixed(1) : 0

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [confirmed, Math.max(0, total - confirmed)],
          backgroundColor: [T.g600, T.line],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        cutout: '78%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 900 },
      }
    })
    return () => chartRef.current?.destroy()
  }, [confirmed, total])

  return (
    <div style={{
      borderRadius: 20, border: `1.5px solid ${T.line}`,
      background: T.white, padding: '1.6rem',
      boxShadow: '0 2px 16px rgba(11,38,24,0.07)',
      display: 'flex', alignItems: 'center', gap: '1.6rem',
      flex: 1, minWidth: 260,
    }}>
      <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
        <canvas ref={canvasRef} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Georgia','Times New Roman',serif",
            fontSize: '1.3rem', fontWeight: 900,
            color: T.g700, lineHeight: 1,
          }}>
            {pct}%
          </span>
          <span style={{
            fontSize: '.52rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.08em', color: T.ink3,
          }}>
            done
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <div style={{
          fontSize: '.6rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.12em', color: T.ink3,
        }}>
          Confirmation Status
        </div>
        <div>
          <div style={{
            fontFamily: "'Georgia','Times New Roman',serif",
            fontSize: '1.6rem', fontWeight: 900, color: T.g900, lineHeight: 1,
          }}>
            {Number(confirmed).toLocaleString()}
          </div>
          <div style={{ fontSize: '.7rem', color: T.ink3, marginTop: 2 }}>
            confirmed of {Number(total).toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '.2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Confirmed', color: T.g600 },
            { label: 'Pending',   color: T.line  },
          ].map(({ label: l, color }) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.65rem', color: T.ink3 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Age Bar Chart (Chart.js) ────────────────────────────────────
function AgeChart({ ageGroups }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return
    if (chartRef.current) chartRef.current.destroy()

    const labels = Object.keys(ageGroups)
    const values = Object.values(ageGroups)
    const maxVal  = Math.max(...values)

    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: values.map(v => v === maxVal ? T.g600 : T.g200),
          borderRadius: 10,
          borderSkipped: false,
          hoverBackgroundColor: T.au2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: T.g900,
            titleColor: '#fff',
            bodyColor: T.g200,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: ctx => `${Number(ctx.parsed.y).toLocaleString()} voters`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { family: 'inherit', size: 11, weight: '600' },
              color: T.ink3,
            }
          },
          y: {
            grid: { color: T.line, lineWidth: 1 },
            border: { display: false, dash: [4, 4] },
            ticks: {
              font: { family: 'inherit', size: 10 },
              color: T.ink3,
              maxTicksLimit: 5,
              callback: v => Number(v).toLocaleString(),
            }
          }
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
      }
    })
    return () => chartRef.current?.destroy()
  }, [ageGroups])

  return (
    <div style={{
      borderRadius: 20, border: `1.5px solid ${T.line}`,
      background: T.white, padding: '1.6rem',
      boxShadow: '0 2px 16px rgba(11,38,24,0.07)',
      flex: 2,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1.2rem',
      }}>
        <div>
          <div style={{
            fontSize: '.6rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.12em', color: T.ink3,
          }}>
            Age Distribution
          </div>
          <div style={{
            fontFamily: "'Georgia','Times New Roman',serif",
            fontSize: '1.1rem', fontWeight: 800, color: T.g900, marginTop: 2,
          }}>
            Voter Age Breakdown
          </div>
        </div>
        <div style={{
          fontSize: '.62rem', color: T.g700,
          background: T.g50, borderRadius: 8,
          padding: '4px 10px', border: `1px solid ${T.g200}`,
          fontWeight: 600,
        }}>
          Hover bars for detail
        </div>
      </div>
      <div style={{ height: 200 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

// ─── Section divider label ────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '.58rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.14em', color: T.ink3,
    display: 'flex', alignItems: 'center', gap: '.6rem',
    marginBottom: '-.2rem',
  }}>
    <span style={{ flex: 1, height: 1, background: T.line }} />
    {children}
    <span style={{ flex: 1, height: 1, background: T.line }} />
  </div>
)

// ─── Dashboard ───────────────────────────────────────────────────
export default function Dashboard() {
  const { t }        = useLang()
  const { isTablet } = useBreakpoint()
  const { user }     = useAuth()

  const isBoothAgent = user?.role === 'booth_agent'
  const isAgentView  = user && user.role !== 'superadmin'

  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [adminBooth, setAdminBooth] = useState('')
  const [chartReady, setChartReady] = useState(false)

  // Load Chart.js once on mount
  useEffect(() => {
    ensureChartJS().then(() => setChartReady(true))
  }, [])

  // ── Same fetch logic as original — untouched ──────────────────
  useEffect(() => {
    let boothNumber = null
    if (isBoothAgent && user?.booth_number != null) {
      boothNumber = String(user.booth_number)
    } else if (user?.role === 'superadmin' && adminBooth) {
      boothNumber = adminBooth
    }

    Promise.all([
      fetchBoothStats({ boothNumber }),
      fetchLocationCounts(boothNumber),
    ])
      .then(([data, locationCounts]) => {
        if (!data || data.length === 0) {
          setStats(null)
          setLoading(false)
          return
        }

        const sum = (arr, key) =>
          arr.reduce((acc, row) => acc + (Number(row[key]) || 0), 0)

        const totalVoters       = sum(data, 'total_voters')
        const maleVoters        = sum(data, 'male_voters')
        const femaleVoters      = sum(data, 'female_voters')
        const transgenderVoters = sum(data, 'transgender_voters')
        const confirmedCount    = sum(data, 'confirmed_count')
        const age_18_20         = sum(data, 'age_18_20')
        const age_21_25         = sum(data, 'age_21_25')
        const age_26_40         = sum(data, 'age_26_40')
        const age_41_50         = sum(data, 'age_41_50')
        const age_51_plus       = sum(data, 'age_51_plus')
        const unique_booths     = new Set(data.map(row => row.part)).size

        setStats({
          totalVoters,
          booths:    unique_booths,
          wards:     locationCounts.wards,
          streets:   locationCounts.streets,
          divisions: locationCounts.divisions,
          maleVoters,
          femaleVoters,
          transgenderVoters,
          confirmedCount,
          confirmationPercent: totalVoters ? (confirmedCount / totalVoters) * 100 : 0,
          ageGroups: {
            '18–20':  age_18_20,
            '21–25':  age_21_25,
            '26–40':  age_26_40,
            '41–50':  age_41_50,
            '51–70+': age_51_plus,
          }
        })
        setLoading(false)
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Dashboard: fetch error', err)
        setLoading(false)
      })
  }, [isBoothAgent, user, adminBooth])

  // ── Loading ───────────────────────────────────────────────────
  if (loading || !stats) {
    return (
      <div style={{
        paddingTop: 96, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: T.g600,
              animation: 'dash-bounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
        <span style={{
          fontSize: '.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.1em', color: T.ink3,
        }}>
          Loading dashboard…
        </span>
        <style>{`
          @keyframes dash-bounce {
            0%,80%,100% { transform: translateY(0); }
            40%          { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    )
  }

  // ── Labels (same as original) ─────────────────────────────────
  const label = {
    title:      t('Voter Dashboard',         'வாக்காளர் டாஷ்போர்டு'),
    boothTitle: t('Booth {{num}} Dashboard', 'பூத் {{num}} டாஷ்போர்டு'),
    voters:     t('Voters',                  'வாக்காளர்கள்'),
    booths:     t('Booths',                  'பூத்'),
    wards:      t('Wards',                   'வார்டுகள்'),
    streets:    t('Streets',                 'தெருக்கள்'),
    divisions:  t('Divisions',               'பிரிவுகள்'),
    male:       t('Male',                    'ஆண்'),
    female:     t('Female',                  'பெண்'),
    transgender:t('Transgender',             'திருநங்கை'),
  }

  const scopedTitle = isAgentView
    ? label.boothTitle.replace('{{num}}', user?.booth_number || '')
    : label.title

  const totalGender =
    (stats.maleVoters + stats.femaleVoters + stats.transgenderVoters) || 1

  return (
    <div style={{ paddingTop: 96, background: '#F7FAF8', minHeight: '100vh' }}>

      <style>{`
        @keyframes dash-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ds { animation: dash-fade-up .45s ease both; }
      `}</style>

      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: isTablet ? '1.5rem 1rem' : '2.5rem 2rem',
        display: 'flex', flexDirection: 'column', gap: '2.2rem',
      }}>

        {/* Header */}
        <div className="ds" style={{ animationDelay: '0s', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: T.g600, marginBottom: 6 }}>
              Election Management System
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: "'Georgia','Times New Roman',serif",
              fontSize: 'clamp(1.5rem,3vw,2.2rem)',
              fontWeight: 900, color: T.g900,
              letterSpacing: '-.02em', lineHeight: 1.1,
            }}>
              {scopedTitle}
            </h1>
          </div>
          {user?.role === 'superadmin' && (
            <div style={{
              background: T.white, border: `1.5px solid ${T.line}`,
              borderRadius: 12, padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <BoothDropdown onSelect={setAdminBooth} />
            </div>
          )}
        </div>

        {/* Overview stat cards */}
        <div className="ds" style={{ animationDelay: '.08s' }}>
          <SectionLabel>Overview</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(5,1fr)',
            gap: '1rem', marginTop: '1.2rem',
          }}>
            <StatCard number={stats.totalVoters} label={label.voters}    accent={T.g600}    icon="🗳" />
            <StatCard number={stats.booths}       label={label.booths}    accent={T.au2}     icon="🏛" />
            <StatCard number={stats.wards}        label={label.wards}     accent="#4A90E2"   icon="📍" />
            <StatCard number={stats.streets}      label={label.streets}   accent="#9B59B6"   icon="🛣" />
            <StatCard number={stats.divisions}    label={label.divisions} accent="#E67E22"   icon="🗺" />
          </div>
        </div>

        {/* Gender + Confirmation */}
        <div className="ds" style={{ animationDelay: '.16s' }}>
          <SectionLabel>Demographics &amp; Confirmation</SectionLabel>
          <div style={{
            display: 'flex', gap: '1rem', marginTop: '1.2rem',
            flexWrap: isTablet ? 'wrap' : 'nowrap',
          }}>
            {/* Gender stack */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '1rem',
              flex: 1.4, minWidth: isTablet ? '100%' : 0,
            }}>
              <GenderStat icon="♂" label={label.male}        count={stats.maleVoters}        accent="#4A90E2" pct={(stats.maleVoters        / totalGender) * 100} />
              <GenderStat icon="♀" label={label.female}      count={stats.femaleVoters}      accent="#EC7690" pct={(stats.femaleVoters      / totalGender) * 100} />
              <GenderStat icon="⚧" label={label.transgender} count={stats.transgenderVoters} accent="#BA81F4" pct={(stats.transgenderVoters / totalGender) * 100} />
            </div>

            {/* Age Bar Graph replaces Confirmation Status */}
            {chartReady && (
              <AgeChart ageGroups={stats.ageGroups} />
            )}
          </div>
        </div>

        {/* Age chart */}
       

      </div>

      <Footer />
    </div>
  )
}