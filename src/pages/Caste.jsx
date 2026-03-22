import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { C, COMMUNITY_DATA } from '../data'
import { Label, Heading, Card, ProgBar, Chip, Insight, Grid, Section, Wrap, Footer } from '../components/ui'

export default function Caste() {
  const { t } = useLang()
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const id = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(id) }, [])
  const PB = (props) => <ProgBar {...props} animated={animated} />

  const leanChip = (lean) => {
    if (lean.includes('Strong DMK') || lean.includes('Lean DMK')) return <Chip variant="r">{lean}</Chip>
    if (lean.includes('AIADMK')) return <Chip variant="g">{lean}</Chip>
    if (lean.includes('Float') || lean.includes('Split')) return <Chip variant="au">{lean}</Chip>
    return <Chip variant="k">{lean}</Chip>
  }

  return (
    <div style={{ paddingTop: 96 }}>
      <Wrap>
        <Section style={{ borderTop: 'none', paddingTop: '3rem' }}>
          <Label>{t('Caste & Community Analysis · Scribd MSU Report + Field Data','சாதி மற்றும் சமூக பகுப்பாய்வு · Scribd MSU அறிக்கை')}</Label>
          <Heading>{t(<>Who Controls <span style={{ color: C.ink3, fontWeight: 500 }}>Lalgudi's Votes</span> — <span style={{ color: C.au }}>And Why</span></>, 'லால்குடி வாக்குகளை யார் கட்டுப்படுத்துகிறார்கள்')}</Heading>

          {/* Udaiyar / IJK central finding */}
          <Card variant="slAu" style={{ marginBottom: '1.2rem', padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 210px', gap: '1.2rem' }}>
              <div>
                <Label>{t('Central Finding · Scribd MSU Report','Scribd MSU அறிக்கையின் முக்கிய கண்டுபிடிப்பு')}</Label>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 800, color: C.ink, margin: '.3rem 0 .5rem' }}>
                  {t('Soundara Pandian = Udaiyar Community + DMK–IJK Alliance','சவுண்டர பாண்டியன் = உடையார் சமூகம் + DMK–IJK கூட்டணி')}
                </div>
                <div style={{ fontSize: '.8rem', color: C.ink2, lineHeight: 1.65 }}>
                  {t("The MSU report's core finding: SP's 4-term dominance is built on (1) his personal Udaiyar community base, and (2) the formal DMK–IJK alliance with T.R. Pachamuthu's party, which commands Udaiyar loyalty in the Perambalur–Trichy belt. In 2011, IJK got 14,004 votes (9.58%) in Lalgudi alone — nearly equal to the NTK 2021 pool. This is Soundara Pandian's structural moat.",
                  'MSU அறிக்கையின் முக்கிய கண்டுபிடிப்பு: SP-ன் 4 தொடர் வெற்றிகள் (1) உடையார் சமூக தனிப்பட்ட தளம் (2) DMK–IJK கூட்டணி. 2011-ல் IJK மட்டும் 14,004 வாக்குகள் (9.58%). இதுவே SP-ன் அரண்.')}
                </div>
                <img src="/images/L5.jpg" alt="L5" style={{ width: '40%', maxWidth: 220, borderRadius: '8px', marginTop: '0.8rem' }} />
              </div>
              <div>
                <PB label={t('IJK 2011 (Udaiyar proxy)','IJK 2011 (உடையார் அளவீடு)')} pct={9.58} color="au" val="9.58% · 14,004 votes" />
                <PB label={t('IJK 2016 (weakened)','IJK 2016 (பலவீனமானது)')} pct={0.54} color="au" val="0.54% · 892 votes" />
                <Insight>
                  <strong style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#7a5f10', marginBottom: '.2rem' }}>
                    {t('Why IJK shrank 2011→2016','IJK 2011→2016 ஏன் சுருங்கியது')}
                  </strong>
                  {t("Pachamuthu's IJK moved away from DMK alliance in 2016 — reducing Udaiyar consolidation. This is why Vijayamurthy (AIADMK) nearly won with just a 3,837-vote margin.",
                  'பச்சமுத்துவின் IJK 2016-ல் DMK கூட்டணியிலிருந்து விலகியது. அதனால் விஜயமூர்த்தி (அதிமுக) 3,837 இடைவெளியில் தோற்றார்.')}
                </Insight>
              </div>
            </div>
          </Card>

          {/* Community table */}
          <div style={{ overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
              <thead>
                <tr style={{ background: C.line2 }}>
                  {[t('Community','சமூகம்'), t('Size','அளவு'), t('Lean','சார்பு'), t('2026 Target','இலக்கு'), t('Key Lever','முக்கிய நெம்புகோல்'), t('Conv. %','மாற்றம் %')].map(h => (
                    <th key={h} style={{ padding: '.65rem .9rem', textAlign: 'left', fontFamily: "'Outfit',sans-serif", fontSize: '.59rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMUNITY_DATA.map(r => (
                  <tr key={r.community} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: '.65rem .9rem', fontWeight: 700, color: C.ink }}>{t(r.community, r.tname)}</td>
                    <td style={{ padding: '.65rem .9rem', color: C.ink3, fontSize: '.75rem' }}>{r.size}</td>
                    <td style={{ padding: '.65rem .9rem' }}>{leanChip(r.lean)}</td>
                    <td style={{ padding: '.65rem .9rem', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: C.g600 }}>{r.target}</td>
                    <td style={{ padding: '.65rem .9rem', fontSize: '.75rem', color: C.ink2 }}>{r.lever}</td>
                    <td style={{ padding: '.65rem .9rem', minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 60, height: 6, background: C.line, borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: `linear-gradient(90deg,${C.g600},${C.g400})`, width: animated ? `${r.conv}%` : '0%', transition: 'width 1s ease', borderRadius: 10 }} />
                        </div>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.75rem', fontWeight: 700, color: C.g600 }}>{r.conv}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Grid cols={2}>
            {/* Women voters */}
            <Card variant="sl">
              <Label>{t('Women Voters — The Decisive Bloc','பெண் வாக்காளர்கள் — தீர்க்கும் பிரிவு')}</Label>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: C.g600, margin: '.3rem 0 .5rem' }}>51.8% · ~1,15,455</div>
              <div style={{ fontSize: '.78rem', color: C.ink2, lineHeight: 1.6, marginBottom: '.8rem' }}>
                {t("Women outnumber men in Lalgudi's electorate. In a high-turnout constituency (80%+), women's vote mobilisation is the mathematical backbone of any AIADMK win. The Amma legacy carries the strongest emotional resonance with Tamil women voters.",
                'பெண்கள் வாக்காளர் பட்டியலில் ஆண்களை விட அதிகம். 80%+ திரட்சி தொகுதியில் பெண் வாக்கு அணிதிரட்டல் கணித முதுகெலும்பு.')}
              </div>
              <PB label={t('Women as % of electorate','வாக்காளர்களில் பெண் %')} pct={51.8} color="g" />
              <PB label={t('Target AIADMK conversion','இலக்கு மாற்றம்')} pct={67.5} color="au" val="65–70%" />
              <Insight variant="green" title={t("Dr. Leema Rose Martin's Structural Edge","டாக்டர் லீமாவின் அமைப்பு சாதகம்")}>
                {t("A Christian woman candidate running as AIADMK's first such in Lalgudi activates the women's bloc (Amma legacy), Christian community (~18%), and Dalit-proximate bloc simultaneously — three distinct groups with one candidate identity.",
                'கிறிஸ்தவ பெண் வேட்பாளர் பெண்கள் (அம்மா பாரம்பரியம்), கிறிஸ்தவர் (~18%), தலித் அருகில் ஒரே நேரத்தில் அணிதிரட்டுகிறார்.')}
              </Insight>
            </Card>

            {/* SP wildcard */}
            <Card variant="sl">
              <Label>{t('The Soundara Pandian Wildcard','சவுண்டர பாண்டியன் சூதாட்டம்')}</Label>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.9rem', fontWeight: 700, color: C.ink, margin: '.3rem 0 .5rem' }}>
                {t('June 2024 Facebook Crisis — What It Means','ஜூன் 2024 Facebook நெருக்கடி')}
              </div>
              <div style={{ fontSize: '.78rem', color: C.ink2, lineHeight: 1.6, marginBottom: '.8rem' }}>
                {t("SP publicly posted 'The Lalgudi MLA is dead. The seat is vacant' in June 2024, reacting to Minister KN Nehru visiting his constituency without informing him. A documented breakdown between a 4-term incumbent and the most powerful DMK minister in Trichy.",
                "SP 2024 ஜூன்-ல் 'லால்குடி எம்எல்ஏ இறந்துவிட்டார்' என Facebook-ல் எழுதினார். 4 தொடர் வெற்றியாளருக்கும் திருச்சியின் சக்திவாய்ந்த DMK அமைச்சருக்கும் இடையே ஆவணப்படுத்தப்பட்ட முறிவு.")}
              </div>
              <PB label={t('Scenario A: SP fights at full strength','A: SP முழு வலிமையில்')} pct={32} color="r" val={t('AIADMK ~30–35%','அதிமுக ~30–35%')} />
              <PB label={t('Scenario B: SP demotivated, gets ticket','B: SP சோர்வு, டிக்கெட் கிடைக்கும்')} pct={45} color="au" val={t('AIADMK ~42–48%','அதிமுக ~42–48%')} />
              <PB label={t('Scenario C: SP denied ticket (Nehru parachute)','C: SP டிக்கெட் மறுக்கப்பட்டால்')} pct={53} color="g" val={t('AIADMK ~50–56%','அதிமுக ~50–56%')} />
              <Insight variant="red" title={t('Watch This First','இதை முதலில் கவனிக்கவும்')}>
                {t('The DMK ticket announcement is the single most important event before polling day. Pre-prepare responses for all three scenarios and deploy instantly on announcement.',
                'DMK டிக்கெட் அறிவிப்பு வாக்குப்பதிவுக்கு முன் மிக முக்கியமான நிகழ்வு. மூன்று சூழ்நிலைகளுக்கும் முன்கூட்டியே தயாரிக்கப்பட்ட பதில்கள் வேண்டும்.')}
              </Insight>
            </Card>
          </Grid>
        </Section>
      </Wrap>
      <Footer />
    </div>
  )
}
