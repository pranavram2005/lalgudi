import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { C, PHASES } from '../data'
import { Label, Heading, Card, ProgBar, Insight, Grid, Section, Wrap, Footer } from '../components/ui'

const RISKS = [
  { icon: '🔴', enT: 'SP Fights at Full Strength', taT: 'SP முழு வலிமையில் போராடுகிறார்', enD: "DMK renews SP's ticket and he campaigns with full Udaiyar network. Win probability drops to ~30–35%.", taD: 'DMK SP-க்கு டிக்கெட் கொடுத்தால் வெற்றி சாத்தியம் 30–35% ஆகும்.', pct: 72, col: 'r', bg: 'red2' },
  { icon: '🔴', enT: 'TVK Pulls from AIADMK Base', taT: 'TVK அதிமுக வாக்கு எடுக்கிறது', enD: 'Strong TVK local candidate peels 3–5% from AIADMK youth and BC voters — net negative.', taD: 'TVK வலிமையான வேட்பாளர் அதிமுகவிலிருந்து 3–5% எடுக்கலாம்.', pct: 55, col: 'r', bg: 'red2' },
  { icon: '🟡', enT: 'NTK Stays in Race', taT: 'NTK தொடர்கிறது', enD: 'If NTK re-contests with a strong candidate, the 16,248 protest votes stay split and cannot be absorbed.', taD: 'NTK மீண்டும் போட்டியிட்டால் 16,248 வாக்குகள் பிரிந்தே இருக்கும்.', pct: 48, col: 'au', bg: 'au4' },
]

const STRENGTHS = [
  { icon: '🟢', enT: 'NDA Central Government Access', taT: 'NDA மத்திய அரசு தொடர்பு', enD: 'Kollidam bridge + Vaigai Express halt. Only NDA alliance can petition Railway/Road ministries. Pre-poll Central announcement = game-changer.', taD: 'கொள்ளிடம் பாலம் + வைகை எக்ஸ்பிரஸ். NDA கூட்டணிக்கு மட்டுமே ரயில்வே/சாலை அமைச்சக தொடர்பு.', pct: 78, col: 'g', bg: 'g100' },
  { icon: '🟢', enT: 'Triple Alliance Booth Machine', taT: 'முக்கூட்டணி சாவடி இயந்திரம்', enD: 'AIADMK+BJP+PMK covering all 300 booths. Strongest ground operation Lalgudi has seen in 20 years.', taD: 'AIADMK+BJP+PMK 300 சாவடிகளிலும். 20 ஆண்டுகளில் மிகவும் வலிமையான களம்.', pct: 82, col: 'g', bg: 'g100' },
  { icon: '✨', enT: 'Candidate Identity (Christian Woman)', taT: 'வேட்பாளர் அடையாளம் (கிறிஸ்தவ பெண்)', enD: 'Activates Christian (~18%), women (51.8%), and Dalit-proximate votes simultaneously. Historically unique for AIADMK in Lalgudi.', taD: 'கிறிஸ்தவர் (~18%), பெண்கள் (51.8%), தலித் அருகில் ஒரே நேரத்தில். அதிமுகவுக்கு தனித்துவம்.', pct: 68, col: 'au', bg: 'au4' },
]

const fillColor = (col) => col === 'g' ? `linear-gradient(90deg,${C.g600},${C.g400})` : col === 'au' ? `linear-gradient(90deg,${C.au},${C.au2})` : 'linear-gradient(90deg,#bf3c3c,#e06060)'

export default function Strategy() {
  const { t } = useLang()
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const id = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(id) }, [])
  const PB = (props) => <ProgBar {...props} animated={animated} />

  return (
    <div style={{ paddingTop: 96 }}>
      <Wrap>
        <Section style={{ borderTop: 'none', paddingTop: '3rem' }}>
          <Label>{t('2026 Arithmetic & Execution Plan','2026 கணிதம் & செயல் திட்டம்')}</Label>
          <Heading>{t(<>From <span style={{ color: C.ink3, fontWeight: 500 }}>−16,949</span> to <span style={{ color: C.au }}>+1</span> — The Path</>, '−16,949 இலிருந்து +1 வரை — வழி')}</Heading>

          {/* 4 levers */}
          <Grid cols={4} style={{ marginBottom: '1.4rem' }}>
            {[
              { icon: '🗳️', label: t('NTK 60% Absorption','NTK 60% உள்வாங்கல்'), val: '+9,749', pct: 60, col: 'g', sub: t('60% of 16,248 votes','16,248 வாக்குகளில் 60%') },
              { icon: '⚡', label: t('DMK Rift Bonus','DMK பிளவு வெகுமதி'), val: '+4,000–6,000', pct: 30, col: 'au', sub: t('Conditional on SP scenario','SP சூழ்நிலையை பொறுத்தது') },
              { icon: '👩', label: t('Women Surge','பெண்கள் எழுச்சி'), val: '+3,500', pct: 22, col: 'g', sub: t('Mahila Morcha activation','மகிளா மோர்ச்சா செயல்பாடு') },
              { icon: '⛪', label: t('AMMK Re-absorption','AMMK மீண்டும் உள்வாங்கல்'), val: '+2,941', pct: 18, col: 'au', sub: t("Vijayamurthy's 2021 AMMK bloc","விஜயமூர்த்தியின் 2021 AMMK") },
            ].map(item => (
              <Card key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.35rem' }}>{item.icon}</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.7rem', fontWeight: 900, color: item.col === 'g' ? C.g600 : C.au, lineHeight: 1 }}>{item.val}</div>
                <div style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: C.ink3, margin: '.2rem 0 .6rem' }}>{item.label}</div>
                <div style={{ height: 7, background: C.line, borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 20, background: fillColor(item.col), width: animated ? `${item.pct}%` : '0%', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '.63rem', color: C.ink3, marginTop: '.2rem' }}>{item.sub}</div>
              </Card>
            ))}
          </Grid>

          {/* Dark summary */}
          <Card variant="dark" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '1.4rem' }}>
              {[
                [t('Gap to Close','இடைவெளி'), '16,949', C.red, t('2021 DMK margin','2021 DMK இடைவெளி')],
                [t('All 4 Levers Fire','4 நெம்புகோல்கள்'), '~22,190', C.au2, t('Net vote shift available','கிடைக்கக்கூடிய மொத்த மாற்றம்')],
                [t('Win Probability','வெற்றி சாத்தியம்'), '48–55%', C.g300, t('With full plan executed','முழு திட்டத்துடன்')],
              ].map(([l,v,c,s]) => (
                <div key={l}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.g300, marginBottom: '.3rem' }}>{l}</div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '2.2rem', fontWeight: 900, color: c, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.38)', marginTop: '.2rem' }}>{s}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <span style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.g300 }}>{t('Overall Campaign Confidence (dummy — update weekly)','ஒட்டுமொத்த பிரச்சார நம்பிக்கை')}</span>
                <span style={{ fontSize: '.63rem', color: C.au2, fontWeight: 700 }}>10% — Day 3/30</span>
              </div>
              <div style={{ height: 14, background: 'rgba(255,255,255,.1)', borderRadius: 7, overflow: 'hidden' }}>
                <div style={{ height: 14, borderRadius: 7, background: `linear-gradient(90deg,${C.au},${C.au2})`, width: animated ? '10%' : '0%', transition: 'width 1.2s ease' }} />
              </div>
            </div>
          </Card>

          {/* Risk + Strength */}
          <Grid cols={2} style={{ marginBottom: '1.5rem' }}>
            <Card>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: C.ink3, marginBottom: '.8rem' }}>⚠️ {t('Top Risks','முக்கிய அபாயங்கள்')}</div>
              {RISKS.map(r => (
                <div key={r.enT} style={{ display: 'flex', gap: '.9rem', padding: '.9rem 0', borderBottom: `1px solid ${C.line}`, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', background: r.col === 'r' ? C.red2 : C.au4 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.83rem', fontWeight: 700, color: C.ink, marginBottom: '.12rem' }}>{t(r.enT, r.taT)}</div>
                    <div style={{ fontSize: '.76rem', color: C.ink3, lineHeight: 1.55, marginBottom: '.4rem' }}>{t(r.enD, r.taD)}</div>
                    <div style={{ height: 6, background: C.line, borderRadius: 20, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 20, background: fillColor(r.col), width: animated ? `${r.pct}%` : '0%', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ fontSize: '.62rem', color: C.ink3, marginTop: '.15rem' }}>{t('Risk likelihood','அபாய சாத்தியம்')}: {r.pct}%</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: C.ink3, marginBottom: '.8rem' }}>✅ {t('Structural Advantages','அமைப்பு சாதகங்கள்')}</div>
              {STRENGTHS.map(s => (
                <div key={s.enT} style={{ display: 'flex', gap: '.9rem', padding: '.9rem 0', borderBottom: `1px solid ${C.line}`, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', background: s.col === 'g' ? C.g100 : C.au4 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.83rem', fontWeight: 700, color: C.ink, marginBottom: '.12rem' }}>{t(s.enT, s.taT)}</div>
                    <div style={{ fontSize: '.76rem', color: C.ink3, lineHeight: 1.55, marginBottom: '.4rem' }}>{t(s.enD, s.taD)}</div>
                    <div style={{ height: 6, background: C.line, borderRadius: 20, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 20, background: fillColor(s.col), width: animated ? `${s.pct}%` : '0%', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ fontSize: '.62rem', color: C.ink3, marginTop: '.15rem' }}>{t('Advantage strength','சாதக வலிமை')}: {s.pct}%</div>
                  </div>
                </div>
              ))}
            </Card>
          </Grid>
        </Section>

        {/* 30-Day plan */}
        <Section>
          <Label>{t('Campaign Blueprint','பிரச்சார வரைபடம்')}</Label>
          <Heading>{t('30-Day Blitz Plan', '30 நாள் திட்டம்')}</Heading>
          <div style={{ marginBottom: '.8rem' }}>
            <PB label={t('Overall campaign completion','ஒட்டுமொத்த பிரச்சார முடிவு')} pct={10} color="g" val="Day 3 / 30 · 10%" />
          </div>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', overflowX: 'auto' }}>
            {PHASES.map(ph => (
              <div key={ph.name} style={{ flex: 1, minWidth: 160, padding: '1.1rem .9rem', borderRight: `1px solid ${C.line}`, background: ph.active ? C.g700 : C.white }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: ph.active ? C.au2 : C.ink3, marginBottom: '.2rem' }}>{ph.days}{ph.active ? ' · NOW' : ''}</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', fontWeight: 800, textTransform: 'uppercase', color: ph.active ? '#fff' : C.ink, marginBottom: '.55rem', paddingBottom: '.45rem', borderBottom: `1px solid ${ph.active ? 'rgba(255,255,255,.13)' : C.line}` }}>
                  {t(ph.name, ph.tname)}
                </div>
                <ul style={{ listStyle: 'none', marginBottom: '.7rem' }}>
                  {ph.items.map(item => (
                    <li key={item} style={{ fontSize: '.7rem', color: ph.active ? 'rgba(255,255,255,.8)' : C.ink3, padding: '.18rem 0 .18rem .85rem', position: 'relative', lineHeight: 1.45 }}>
                      <span style={{ position: 'absolute', left: 0, color: C.g400, fontSize: '1.1rem', lineHeight: 1 }}>·</span>{item}
                    </li>
                  ))}
                </ul>
                <div style={{ height: 5, background: ph.active ? 'rgba(255,255,255,.12)' : C.line, borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 20, background: `linear-gradient(90deg,${C.au},${C.au2})`, width: animated ? `${ph.progress}%` : '0%', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '.58rem', color: ph.active ? 'rgba(255,255,255,.4)' : C.ink4, marginTop: '.18rem' }}>{ph.progress > 0 ? `~${ph.progress}% complete` : 'Not started'}</div>
              </div>
            ))}
          </div>
        </Section>
      </Wrap>
      <Footer />
    </div>
  )
}
