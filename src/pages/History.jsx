import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { C, ELECTION_DATA, TIMELINE } from '../data'
import { Label, Heading, Insight, Grid, Section, Wrap, Footer, ResultCard, TlItem } from '../components/ui'

export default function History() {
  const { t } = useLang()
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const id = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(id) }, [])

  return (
    <div style={{ paddingTop: 96 }}>
      <Wrap>
        <Section style={{ borderTop: 'none', paddingTop: '3rem' }}>
          <Label>{t('Complete Election Record · Source: ECI + Wikipedia','முழுமையான தேர்தல் பதிவு')}</Label>
          <Heading>{t(<>Lalgudi 1967–2021 <span style={{ color: C.ink3, fontWeight: 500 }}>— Every Result, Every Story</span></>, 'லால்குடி 1967–2021 — ஒவ்வொரு முடிவும்')}</Heading>

          {/* Era label */}
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.8rem' }}>
            Soundara Pandian Era — Exact Vote Data (ECI Verified)
          </div>

          {/* 2006–2021 result cards */}
          <Grid cols={2} style={{ marginBottom: '2rem' }}>
            {ELECTION_DATA.map(d => <ResultCard key={d.year} data={d} animated={animated} />)}
          </Grid>

          {/* Pre-2006 timeline */}
          <Label>{t('Pre-2006 History · Source: ECI Data','2006-க்கு முந்தைய வரலாறு')}</Label>
          <Grid cols={2} style={{ marginTop: '.8rem' }}>
            {[TIMELINE.slice(0, 5), TIMELINE.slice(5)].map((half, hi) => (
              <div key={hi} style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: 4, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom,${C.g400},${C.au},${C.g300})`, borderRadius: 2 }} />
                {half.map(item => <TlItem key={item.year} item={item} />)}
              </div>
            ))}
          </Grid>

          <Insight title={t('🔑 The Pattern Nobody Talks About','🔑 யாரும் பேசாத போக்கு')}>
            {t(
              'AIADMK\'s two wins (1977: +1,533; 2001: +1,610) came during massive statewide waves. Even then, both margins were under 2,000 votes. The 2016 result (−3,837) was the closest recent approach. Combining NTK 2021 votes (+16,248) with AMMK splinter (+2,941) nearly closes the entire 2021 gap of 16,949.',
              'அதிமுக இரண்டு வெற்றிகளும் மாநில அலையில் வந்தன. 2016-ல் 3,837 இடைவெளி மட்டுமே. NTK 2021 (16,248) + AMMK (2,941) = கிட்டத்தட்ட 2021 முழு இடைவெளியை மூடுகிறது.'
            )}
          </Insight>
        </Section>

        {/* Margin trend section */}
        <Section>
          <Label>{t('Vote Share Trend 2006–2021','வாக்கு போக்கு 2006–2021')}</Label>
          <Heading>{t(<>Party Performance <span style={{ color: C.ink3, fontWeight: 500 }}>Over Four Elections</span></>, 'நான்கு தேர்தல்களில் கட்சி செயல்திறன்')}</Heading>
          <div style={{ overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
              <thead>
                <tr style={{ background: C.line2 }}>
                  {[t('Year','ஆண்டு'), t('DMK %','DMK %'), t('AIADMK %','அதிமுக %'), t('Third Party','மூன்றாம் கட்சி'), t('Margin','இடைவெளி'), t('Turnout','திரட்சி')].map(h => (
                    <th key={h} style={{ padding: '.65rem .9rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif", fontSize: '.59rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ELECTION_DATA.map(d => (
                  <tr key={d.year} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: '.65rem .9rem', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: C.ink }}>{d.year}</td>
                    <td style={{ padding: '.65rem .9rem', color: C.red, fontWeight: 600 }}>{d.results[0].pct}%</td>
                    <td style={{ padding: '.65rem .9rem', color: C.g600, fontWeight: 600 }}>{d.results[1].pct}%</td>
                    <td style={{ padding: '.65rem .9rem', color: C.ink3, fontSize: '.75rem' }}>{d.results[2].p.split('·')[0].trim()}: {d.results[2].pct}%</td>
                    <td style={{ padding: '.65rem .9rem', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: C.red }}>−{d.margin.toLocaleString()}</td>
                    <td style={{ padding: '.65rem .9rem', color: C.ink2 }}>{d.turnout}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem 1.2rem', background: C.au4, borderRadius: 8, border: `1px solid ${C.auBorder}` }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, color: '#8a6d1a', marginBottom: '.3rem' }}>
              ⚠️ {t('Key Insight: The 2016 result is AIADMK\'s actual benchmark','முக்கிய நுண்ணறிவு: 2016 முடிவு அதிமுகவின் உண்மையான அளவுகோல்')}
            </div>
            <div style={{ fontSize: '.75rem', color: C.ink3, lineHeight: 1.55 }}>
              {t('2016 is the most comparable reference year — same MLA, similar alliance structure, no NTK spoiler. 3,837-vote gap was closeable. The 2021 collapse was driven by post-Jayalalithaa AIADMK crisis + NTK emergence. With EPS consolidation and NDA alliance, 2026 arithmetic is closer to 2016 than 2021.',
              '2016 மிகவும் ஒப்பிடக்கூடிய ஆண்டு. 3,837 இடைவெளி மூடக்கூடியது. 2021 வீழ்ச்சி அம்மாவுக்கு பிந்தைய நெருக்கடி + NTK உதயம்.')}
            </div>
          </div>
        </Section>
      </Wrap>
      <Footer />
    </div>
  )
}
