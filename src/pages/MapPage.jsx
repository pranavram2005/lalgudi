import { useLang } from '../context/LangContext'
import { C } from '../data'
import MapComponent from '../components/MapComponent'

export default function MapPage() {
  const { t } = useLang()
  return (
    <div style={{ paddingTop: 96 }}>
      {/* Page header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: '.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 800, color: C.ink }}>
            {t('Lalgudi AC-143 · Electoral Field Map 2026','லால்குடி 143 · தேர்தல் வரைபடம் 2026')}
          </div>
          <div style={{ fontSize: '.72rem', color: C.ink3, marginTop: 2 }}>
            {t('Interactive constituency map — community zones, booth priority, infrastructure issues, vote affinity heat','ஊடாடும் தொகுதி வரைபடம் — சமூக மண்டலங்கள், சாவடி முன்னுரிமை, உள்கட்டமைப்பு பிரச்னைகள்')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[
            [t('Centre: 10.879°N, 78.812°E','மையம்: 10.879°N, 78.812°E'), C.g100, C.g700],
            [t('⚠️ Approximate boundaries','⚠️ தோராயமான எல்லைகள்'), 'rgba(200,160,48,.1)', '#7a5f10'],
          ].map(([txt, bg, color]) => (
            <span key={txt} style={{ background: bg, color, fontFamily: "'Outfit',sans-serif", fontSize: '.65rem', fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{txt}</span>
          ))}
        </div>
      </div>
      <MapComponent />
    </div>
  )
}
