import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { C, ELECTION_DATA } from '../data'
import { Label, Heading, Card, ProgBar, Chip, Insight, Grid, Section, Wrap, StatBar, Footer } from '../components/ui'

export default function Overview() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const id = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(id) }, [])
  const PB = (props) => <ProgBar {...props} animated={animated} />

  const latest = ELECTION_DATA[ELECTION_DATA.length - 1]

  return (
    <div style={{ paddingTop: 96 }}>
      {/* ── HERO ── */}
      <div style={{ background: C.g800, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 380px at 18% 55%,rgba(46,132,79,.22) 0%,transparent 65%),radial-gradient(ellipse 380px 260px at 78% 18%,rgba(200,160,48,.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <Wrap>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 460, position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '3.5rem 1.8rem 3.5rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '1.3rem' }}>
                {[
                  [t('Lalgudi AC · Constituency 143','லால்குடி தொகுதி 143'), false],
                  [t('Tiruchirappalli District','திருச்சிராப்பள்ளி மாவட்டம்'), false],
                  [t('Polling: 23 April 2026','வாக்குப்பதிவு: 23 ஏப்ரல்'), true],
                ].map(([txt, gold]) => (
                  <span key={txt} style={{
                    background: gold ? C.au4 : 'rgba(255,255,255,.07)',
                    border: `1px solid ${gold ? C.auBorder : 'rgba(255,255,255,.13)'}`,
                    color: gold ? C.au2 : 'rgba(255,255,255,.65)',
                    fontFamily: "'Outfit',sans-serif", fontSize: '.62rem', fontWeight: 600,
                    letterSpacing: '.07em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
                  }}>{txt}</span>
                ))}
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2rem,4.5vw,3.5rem)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.02, color: '#fff', marginBottom: '.5rem' }}>
                {t('Field','தேர்தல்')}<br/>
                <span style={{ color: C.au2 }}>{t('Intelligence','தகவல்')}</span><br/>
                <span style={{ color: C.g300 }}>{t('Report 2026','அறிக்கை 2026')}</span>
              </h1>

              {/* Quote */}
              <p style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: 'italic', fontSize: '.9rem', color: 'rgba(255,255,255,.5)', marginBottom: '1.8rem', lineHeight: 1.65 }}>
                {t(
                  '"Lalgudi has waited 25 years for a leader who delivers — not just promises. Dr. Leema Rose Martin and the AIADMK–BJP–PMK alliance bring Central government access, Amma\'s welfare legacy, and a triple booth network to finally close that gap on 23 April 2026."',
                  '"லால்குடி 25 ஆண்டுகளாக வெறும் வாக்குறுதிகள் அல்ல — செயல்படும் தலைமையை எதிர்பார்க்கிறது. டாக்டர் லீமா ரோஸ் மார்ட்டினும் அதிமுக–BJP–PMK கூட்டணியும் 23 ஏப்ரல் 2026 அன்று வரலாற்றை மாற்ற தயாராக உள்ளனர்."'
                )}
              </p>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, overflow: 'hidden', maxWidth: 370, marginBottom: '1.3rem' }}>
                {[
                  [t('AIADMK Candidate','அதிமுக வேட்பாளர்'), 'Dr. M. Leema Rose Martin'],
                  [t('Alliance','கூட்டணி'), 'AIADMK + BJP + PMK'],
                  [t('Electorate (2021)','வாக்காளர்கள்'), '2,18,131'],
                  [t('2021 Turnout','திரட்சி'), '79.56% (1,73,554)'],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: 'rgba(0,0,0,.2)', padding: '.7rem 1rem' }}>
                    <div style={{ fontSize: '.57rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: '.18rem' }}>{l}</div>
                    <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'rgba(255,255,255,.84)' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/caste')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Outfit',sans-serif", fontSize: '.7rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 17px', borderRadius: 5, cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)' }}>
                  {t('Caste Analysis →','சாதி பகுப்பாய்வு →')}
                </button>
              </div>
            </div>

            {/* Candidate photo */}
            <div style={{ position: 'relative', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#143320 0%,transparent 38%),linear-gradient(to top,#143320 0%,transparent 28%)', zIndex: 1 }} />
              <img
                src="/images/L1.png"
                alt="Dr. M. Leema Rose Martin"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', transform: 'scale(.85)', transformOrigin: 'center top' }}
                onError={e => { e.target.parentElement.style.background = 'rgba(255,255,255,.04)'; e.target.style.display = 'none' }}
              />
              <div style={{ position: 'absolute', bottom: '1.4rem', left: 0, right: 0, zIndex: 2, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.98rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,.7)' }}>Dr. M. Leema Rose Martin</div>
                <div style={{ fontSize: '.68rem', color: C.au2, letterSpacing: '.06em' }}>{t('AIADMK NDA Candidate · Lalgudi AC-143','அதிமுக NDA வேட்பாளர் · 143')}</div>
              </div>
            </div>
            {/* Primary hero CTAs: Map + Voter List */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '30%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: '0.6rem',
              padding: '0.35rem 0.5rem',
              borderRadius: 10,
              background: 'rgba(0,0,0,.22)',
              boxShadow: '0 10px 28px rgba(0,0,0,.45)',
              zIndex: 3,
            }}>
              <button
                onClick={() => navigate('/map')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: '.9rem',
                  fontWeight: 800,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  padding: '8px 18px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `2px solid ${C.au2}`,
                  background: 'transparent',
                  color: C.au2,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('Field Map 🗺️','வரைபடம் 🗺️')}
              </button>
              <button
                onClick={() => navigate('/voters')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: '.9rem',
                  fontWeight: 800,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  padding: '8px 18px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: '2px solid #ffffff',
                  background: 'transparent',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('Voter List','வாக்காளர் பட்டியல்')}
              </button>
            </div>
          </div>
        </Wrap>
      </div>

      {/* ── STAT BAR ── */}
      <StatBar stats={[
        { n: '2,00,000+', l: t('Electorate','வாக்காளர்கள்'), s: '218,131 on 2021 roll' },
        { n: '80%+',      l: t('Consistent Turnout','திரட்சி'), s: 'All elections since 2011' },
        { n: '16,949',    l: t('DMK Margin 2021','DMK இடைவெளி'), s: '84,914 vs 67,965' },
        { n: '10 × 2',    l: t('DMK vs AIADMK Wins','DMK vs அதிமுக'), s: 'Since 1967' },
        { n: '9.36%',     l: t('NTK Swing Pool','NTK ஊஞ்சல்'), s: '16,248 protest votes 2021' },
      ]} />

      {/* ── CONTENT ── */}
      <Wrap>
        <Section style={{ borderTop: 'none' }}>
          <Label>{t('Constituency Snapshot','தொகுதி கண்ணோட்டம்')}</Label>
          <Heading>{t(<>What the Numbers <span style={{ color: C.ink3, fontWeight: 500 }}>Actually Say</span></>, 'உண்மையான தரவு என்ன சொல்கிறது')}</Heading>

          <Grid cols={3} style={{ marginBottom: '1.2rem' }}>
            {/* Demographics */}
            <Card variant="dark">
              <Label light>Demographics</Label>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: '.3rem 0 .8rem' }}>2,54,865</div>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', marginBottom: '1rem' }}>{t('Total population · 2011 Census','மொத்த மக்கள்தொகை · 2011')}</div>
              <PB label={t('Rural Population','கிராமப்புறம்')} pct={76.76} color="au" dark />
              <PB label={t('Urban Population','நகர்ப்புறம்')} pct={23.24} color="ink" dark />
              <PB label={t('SC Population share','SC மக்கள்தொகை')} pct={20.95} color="g" dark />
            </Card>

            {/* 2021 Result */}
            <Card>
              <Label>{t('2021 Election Result','2021 தேர்தல் முடிவு')}</Label>
              <PB label="DMK · A. Soundara Pandian" pct={48.93} color="r" val="48.93% · 84,914" />
              <PB label="AIADMK · D.R. Dharmaraj" pct={39.16} color="g" val="39.16% · 67,965" />
              <PB label="NTK · I. Malar Tamil Prabha" pct={9.36} color="au" val="9.36% · 16,248" />
              <PB label="AMMK + Others" pct={2.55} color="ink" val="2.55% · 4,141" />
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between' }}>
                {[['DMK votes','84,914',C.red],['AIADMK votes','67,965',C.g600],['NTK votes','16,248',C.au]].map(([l,v,c]) => (
                  <div key={l}><div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', color: C.ink3, marginBottom: '.18rem' }}>{l}</div><div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.2rem', fontWeight: 800, color: c }}>{v}</div></div>
                ))}
              </div>
            </Card>

            {/* Turnout */}
            <Card>
              <Label>{t('Comparative Turnout','திரட்சி ஒப்பீடு')}</Label>
              <PB label="2021 Assembly" pct={79.56} color="g" />
              <PB label="2019 Lok Sabha" pct={78.98} color="au" />
              <PB label="2016 Assembly" pct={81.68} color="g" />
              <Insight variant="green">
                {t('Lalgudi is a high-turnout constituency — consistently above 78%. Turnout mobilisation is as important as vote conversion.', 'லால்குடி அதிக திரட்சி தொகுதி — 78% மேல். திரட்சி அணிதிரட்டல் வாக்கு மாற்றம் போல் முக்கியம்.')}
              </Insight>
            </Card>
          </Grid>

          {/* Swing math */}
          <Card variant="sl" style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', marginBottom: '1.4rem' }}>
              {[
                [t('Gap to Close','இடைவெளி'), '−16,949', C.red, t('DMK margin in 2021','2021 DMK இடைவெளி')],
                [t('NTK Pool Available','NTK வாக்கு குளம்'), '16,248', C.au, t('2021 protest votes — mostly anti-DMK','எதிர்ப்பு வாக்குகள்')],
                [t('If 60% NTK Swings','60% NTK மாற்றம்'), '+9,800', C.g600, t('Gap remaining: ~7,150','மீதமுள்ள இடைவெளி: ~7,150')],
                [t('Win Probability','வெற்றி சாத்தியம்'), '48–55%', C.g600, t('With full 30-day plan','30 நாள் திட்டத்துடன்')],
              ].map(([l,v,c,s]) => (
                <div key={l}><div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.3rem' }}>{l}</div><div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: c }}>{v}</div><div style={{ fontSize: '.72rem', color: C.ink3, marginTop: '.2rem' }}>{s}</div></div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <span style={{ fontSize: '.77rem', fontWeight: 700, color: C.ink2 }}>{t('Campaign Progress (dummy — update daily)','பிரச்சார முன்னேற்றம் (மாதிரி)')}</span>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.77rem', fontWeight: 700, color: C.g600 }}>Day 3 / 30</span>
              </div>
              <div style={{ height: 13, background: C.line, borderRadius: 7, overflow: 'hidden' }}>
                <div style={{ height: 13, borderRadius: 7, background: `linear-gradient(90deg,${C.g600},${C.g400})`, width: animated ? '10%' : '0%', transition: 'width 1.2s ease' }} />
              </div>
            </div>
          </Card>

          {/* Key cards */}
          <Grid cols={3}>
            {[
              { icon: '🏛️', label: t('Historical Dominance','வரலாற்று ஆதிக்கம்'), title: t('DMK won this seat 10 times','DMK 10 முறை வென்றது'), desc: t('AIADMK has won Lalgudi only twice — 1977 and 2001. Both during statewide anti-DMK waves. This is not a swing seat; it is a fortress breachable only with maximum execution.','அதிமுக 1977, 2001 மட்டுமே வென்றது. இது கோட்டை. அதிகபட்ச செயல்பாட்டுடன் மட்டுமே வெல்ல முடியும்.'), v: 'slAu' },
              { icon: '📊', label: t('2016 vs 2021 Trend','2016–2021 போக்கு'), title: t('DMK margin doubled','DMK இடைவெளி இரட்டித்தது'), desc: t('2016: DMK won by just 3,837 votes. 2021: margin exploded to 16,949. The post-Jayalalithaa AIADMK slump is real and quantified.','2016: 3,837 ஓட்டுகள். 2021: 16,949 ஆனது. அம்மாவுக்கு பிந்தைய வீழ்ச்சி.'), v: 'slAu' },
              { icon: '🔑', label: t('Structural Advantage','அமைப்பு சாதகம்'), title: t('NDA Central government access','NDA மத்திய அரசு தொடர்பு'), desc: t('Kollidam bridge and Vaigai Express halt can only be delivered by the NDA alliance. DMK as a state party cannot escalate to Union ministries.','கொள்ளிடம் பாலம், வைகை எக்ஸ்பிரஸ் — NDA மட்டுமே நிறைவேற்ற முடியும்.'), v: 'sl' },
            ].map(item => (
              <Card key={item.label} variant={item.v}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{item.icon}</div>
                <Label>{item.label}</Label>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 700, color: C.ink, margin: '.3rem 0 .5rem' }}>{item.title}</div>
                <div style={{ fontSize: '.78rem', color: C.ink3, lineHeight: 1.55 }}>{item.desc}</div>
              </Card>
            ))}
          </Grid>

          {/* Photo slots */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            {[['L2.jpg','Lalgudi fields and Cauvery-side villages'],['L3.jpg','Lalgudi town and voters']].map(([src, alt]) => (
              <div key={src} style={{ background: C.white, border: `1px dashed ${C.line}`, borderRadius: 8, padding: '.7rem', display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                <div style={{ borderRadius: 6, overflow: 'hidden', background: C.line2, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`/images/${src}`} alt={alt} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} onError={e => { e.target.parentElement.innerHTML = `<span style="font-size:.8rem;color:${C.ink3};padding:1rem">Add ${src} to /public/images/</span>` }} />
                </div>
                <span style={{ fontSize: '.72rem', color: C.ink3 }}>{alt}</span>
              </div>
            ))}
          </div>
        </Section>
      </Wrap>

      <Footer />
    </div>
  )
}
