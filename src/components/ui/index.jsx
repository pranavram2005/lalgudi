import { C } from '../../data'

// ─── LABEL ────────────────────────────────────────────────────────────────────
export const Label = ({ children, light, style }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
    fontFamily: "'Outfit',sans-serif", fontSize: '.61rem', fontWeight: 700,
    letterSpacing: '.16em', textTransform: 'uppercase',
    color: light ? C.g300 : C.g500, ...style
  }}>
    <span style={{ width: 13, height: 2, background: light ? C.g300 : C.g500, borderRadius: 1, flexShrink: 0, display: 'block' }} />
    {children}
  </div>
)

// ─── HEADING ─────────────────────────────────────────────────────────────────
export const Heading = ({ children, style }) => (
  <h2 style={{
    fontFamily: "'Outfit',sans-serif",
    fontSize: 'clamp(1.4rem,2.4vw,2rem)', fontWeight: 800,
    letterSpacing: '-.025em', color: C.ink, lineHeight: 1.15,
    marginBottom: '1.6rem', ...style
  }}>{children}</h2>
)

// ─── CARD ────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, variant }) => {
  const base = { background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: '1.3rem', transition: 'box-shadow .2s,border-color .2s' }
  const variants = {
    dark:  { background: C.g800, borderColor: C.g800 },
    sl:    { borderLeft: `3px solid ${C.g500}` },
    slAu:  { borderLeft: `3px solid ${C.au}` },
    slR:   { borderLeft: `3px solid ${C.red}` },
    gold:  { background: C.au4, borderColor: C.auBorder },
    green: { background: C.g050, borderColor: C.g300 },
  }
  return <div style={{ ...base, ...(variants[variant] || {}), ...style }}>{children}</div>
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export const ProgBar = ({ label, pct, color = 'g', val, dark, animated = true }) => {
  const fills = {
    g:   `linear-gradient(90deg,${C.g600},${C.g400})`,
    au:  `linear-gradient(90deg,${C.au},${C.au2})`,
    r:   `linear-gradient(90deg,#bf3c3c,#e06060)`,
    ink: `linear-gradient(90deg,${C.ink3},${C.ink4})`,
    blue:`linear-gradient(90deg,#3b6bb5,#6a9de0)`,
  }
  return (
    <div style={{ marginBottom: '.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.26rem' }}>
        <span style={{ fontSize: '.8rem', fontWeight: 500, color: dark ? 'rgba(255,255,255,.65)' : C.ink2 }}>{label}</span>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.8rem', fontWeight: 700, color: dark ? '#fff' : C.ink, whiteSpace: 'nowrap' }}>{val || `${pct}%`}</span>
      </div>
      <div style={{ height: 9, background: dark ? 'rgba(255,255,255,.12)' : C.line, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 20,
          background: fills[color] || fills.g,
          width: `${pct}%`,
          transition: animated ? 'width 1.1s cubic-bezier(.4,0,.2,1)' : 'none',
        }} />
      </div>
    </div>
  )
}

// ─── CHIP ────────────────────────────────────────────────────────────────────
export const Chip = ({ children, variant = 'g' }) => {
  const styles = {
    g:  { background: C.g100, color: C.g700 },
    r:  { background: C.red2, color: C.red },
    au: { background: C.au4, color: '#7a5f10', border: `1px solid ${C.auBorder}` },
    k:  { background: C.line2, color: C.ink3 },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20,
      fontFamily: "'Outfit',sans-serif", fontSize: '.59rem', fontWeight: 700,
      letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      ...(styles[variant] || styles.k)
    }}>{children}</span>
  )
}

// ─── INSIGHT BOX ─────────────────────────────────────────────────────────────
export const Insight = ({ children, title, variant }) => {
  const map = {
    default: { border: C.au,    bg: C.au4,   tc: '#7a5f10' },
    green:   { border: C.g500,  bg: C.g050,  tc: C.g700    },
    red:     { border: C.red,   bg: C.red2,  tc: C.red     },
  }
  const s = map[variant || 'default']
  return (
    <div style={{ padding: '1rem 1.2rem', borderRadius: 8, borderLeft: `3px solid ${s.border}`, background: s.bg, marginTop: '1rem' }}>
      {title && <strong style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.75rem', fontWeight: 700, color: s.tc, display: 'block', marginBottom: '.25rem' }}>{title}</strong>}
      <p style={{ fontSize: '.77rem', color: C.ink2, lineHeight: 1.55 }}>{children}</p>
    </div>
  )
}

// ─── GRID ────────────────────────────────────────────────────────────────────
export const Grid = ({ cols = 2, gap = '1rem', children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap, ...style }}>
    {children}
  </div>
)

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
export const Section = ({ children, style }) => (
  <div style={{ padding: '3rem 0', borderTop: `1px solid ${C.line}`, ...style }}>
    {children}
  </div>
)

// ─── PAGE WRAP ────────────────────────────────────────────────────────────────
export const Wrap = ({ children }) => (
  <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 1.6rem' }}>
    {children}
  </div>
)

// ─── STAT BAR ────────────────────────────────────────────────────────────────
export const StatBar = ({ stats }) => (
  <div style={{ background: C.g900, display: 'grid', gridTemplateColumns: `repeat(${stats.length},1fr)` }}>
    {stats.map(({ n, l, s }, i) => (
      <div key={i} style={{ padding: '1.3rem 1rem', borderRight: `1px solid rgba(255,255,255,.05)`, textAlign: 'center', borderRight: i < stats.length - 1 ? `1px solid rgba(255,255,255,.05)` : 'none' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.9rem', fontWeight: 900, color: C.au2, lineHeight: 1, marginBottom: '.2rem' }}>{n}</div>
        <div style={{ fontSize: '.63rem', color: 'rgba(255,255,255,.42)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{l}</div>
        {s && <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.22)', marginTop: '.1rem' }}>{s}</div>}
      </div>
    ))}
  </div>
)

// ─── FOOTER ──────────────────────────────────────────────────────────────────
export const Footer = () => (
  <div style={{ background: C.g900, padding: '1.4rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.6rem', marginTop: '3rem' }}>
    <span style={{ fontSize: '.66rem', color: 'rgba(255,255,255,.28)' }}>by Makkal Padhai</span>
    <strong style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, color: C.au2 }}>AIADMK · Lalgudi AC-143 · 2026</strong>
    <span style={{ fontSize: '.66rem', color: 'rgba(255,255,255,.28)' }}>Confidential — Do Not Distribute</span>
  </div>
)

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
export const ResultCard = ({ data, animated }) => (
  <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
    <div style={{ background: C.g800, padding: '.75rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>{data.year}</div>
        <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)' }}>{data.tag}</div>
      </div>
      <Chip variant="r">DMK Win</Chip>
    </div>
    <div style={{ padding: '1rem 1.1rem' }}>
      {data.results.map(r => (
        <ProgBar key={r.p} label={r.p} pct={r.pct} color={r.color} val={`${r.pct}% · ${r.v.toLocaleString()}`} animated={animated} />
      ))}
      <div style={{ fontSize: '.7rem', color: C.ink3, marginTop: '.6rem', paddingTop: '.6rem', borderTop: `1px solid ${C.line}` }}>
        Margin: <strong style={{ color: C.red }}>{data.margin.toLocaleString()} votes</strong> · Turnout: {data.turnout}% · Electors: {data.electors.toLocaleString()}
      </div>
      <div style={{ fontSize: '.72rem', color: C.ink2, marginTop: '.4rem', lineHeight: 1.55, fontStyle: 'italic' }}>{data.note}</div>
    </div>
  </div>
)

// ─── TIMELINE ITEM ────────────────────────────────────────────────────────────
export const TlItem = ({ item }) => {
  const dotColor = item.party === 'aiadmk' ? C.g500 : item.party === 'dmk' ? C.red : C.au
  return (
    <div style={{ position: 'relative', paddingBottom: '1.4rem', paddingLeft: '1.6rem' }}>
      <div style={{ position: 'absolute', left: 0, top: 5, width: 10, height: 10, borderRadius: '50%', background: dotColor, border: `2px solid ${dotColor}` }} />
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.62rem', fontWeight: 700, color: C.ink3, letterSpacing: '.07em', marginBottom: '.1rem' }}>{item.year}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.84rem', fontWeight: 700, color: item.party === 'aiadmk' ? C.g700 : C.ink }}>{item.winner}</div>
      <div style={{ fontSize: '.74rem', color: C.ink3, lineHeight: 1.55, marginTop: '.1rem' }}>{item.detail}</div>
    </div>
  )
}
