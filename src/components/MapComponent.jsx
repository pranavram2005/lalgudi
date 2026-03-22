import { useEffect, useRef, useState } from 'react'
import { C, VILLAGES, INFRA_MARKERS, COMM_ZONES, BOOTH_SAMPLES, HEAT_ZONES } from '../data'

const LAYER_CONFIG = [
  { key: 'comm',  label: 'Community Zones',    color: C.g500,    defaultOn: true  },
  { key: 'booth', label: 'Booth Priority',     color: '#7b52c8', defaultOn: false },
  { key: 'heat',  label: 'Vote Affinity Heat', color: C.red,     defaultOn: false },
  { key: 'infra', label: 'Infrastructure',     color: '#e07a20', defaultOn: true  },
  { key: 'pins',  label: 'Villages & Towns',   color: '#1a6fa8', defaultOn: true  },
]

function popupHTML(v) {
  const barRow = (lbl, pct, col) => `
    <div style="margin-bottom:.45rem">
      <div style="display:flex;justify-content:space-between;font-size:.74rem;margin-bottom:.2rem">
        <span style="color:#617060">${lbl}</span>
        <strong style="color:${col}">${pct}%</strong>
      </div>
      <div style="height:6px;background:#ddeadf;border-radius:10px">
        <div style="height:100%;width:${pct}%;background:${col};border-radius:10px"></div>
      </div>
    </div>`
  return `
    <div style="font-family:'Outfit',sans-serif;min-width:250px">
      <div style="background:${v.aiadmk > v.dmk ? '#1b4d2e' : '#8b1c1c'};padding:.7rem 1rem">
        <div style="font-size:.9rem;font-weight:800;color:#fff">${v.name}</div>
        <div style="font-size:.64rem;color:rgba(255,255,255,.6)">${v.type === 'town' ? 'Town' : 'Village'} · ${v.booths} Booths</div>
      </div>
      <div style="padding:.7rem 1rem;border-bottom:1px solid #ddeadf">
        ${barRow('AIADMK', v.aiadmk, '#23673d')}
        ${barRow('DMK', v.dmk, '#bf3c3c')}
        ${barRow('NTK / Others', v.ntk + 2, '#c8a030')}
      </div>
      <div style="padding:.6rem 1rem">
        <div style="display:flex;justify-content:space-between;font-size:.72rem;padding:.2rem 0;border-bottom:1px dashed #ddeadf">
          <span style="color:#617060">2026 Target</span>
          <strong style="color:#23673d">${v.target}%</strong>
        </div>
        <div style="font-size:.72rem;color:#2e3d2c;line-height:1.5;margin-top:.5rem">${v.desc}</div>
        <div style="font-size:.68rem;color:#c8a030;margin-top:.35rem;font-style:italic">Issue: ${v.issue}</div>
      </div>
    </div>`
}

function infraPopupHTML(inf) {
  return `
    <div style="font-family:'Outfit',sans-serif;padding:.85rem 1.1rem;min-width:240px">
      <div style="font-size:.88rem;font-weight:800;color:#10180f;margin-bottom:.4rem">${inf.icon} ${inf.title}</div>
      <span style="background:${inf.color}22;color:${inf.color};font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:3px;text-transform:uppercase;letter-spacing:.04em">${inf.status}</span>
      <div style="font-size:.74rem;color:#2e3d2c;line-height:1.55;margin-top:.55rem">${inf.desc}</div>
    </div>`
}

export default function MapComponent() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const layerGroups = useRef({})
  const [layers, setLayers] = useState(() => Object.fromEntries(LAYER_CONFIG.map(l => [l.key, l.defaultOn])))
  const [leafletReady, setLeafletReady] = useState(!!window.L)

  // Load Leaflet if not already loaded
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
  }, [])

  // Init map once Leaflet is ready
  useEffect(() => {
    if (!leafletReady || mapInstance.current || !mapRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { center: [10.879, 78.812], zoom: 12, zoomControl: true })
    mapInstance.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CartoDB', maxZoom: 18,
    }).addTo(map)

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map)

    // Constituency boundary
    const bdry = [[10.830,78.758],[10.835,78.800],[10.832,78.840],[10.838,78.870],[10.850,78.895],[10.868,78.902],[10.890,78.900],[10.910,78.898],[10.930,78.892],[10.950,78.878],[10.962,78.858],[10.965,78.825],[10.958,78.790],[10.948,78.758],[10.928,78.748],[10.908,78.745],[10.888,78.748],[10.870,78.748],[10.852,78.752]]
    L.polygon(bdry, { color: '#0c2318', fillColor: 'transparent', weight: 2.5, dashArray: '7,4', opacity: .7 })
      .addTo(map)
      .bindTooltip('Lalgudi AC-143 Boundary (approx.)', { sticky: true })

    // Kollidam river
    L.polyline([[10.960,78.758],[10.952,78.775],[10.940,78.790],[10.928,78.810],[10.920,78.825],[10.910,78.838],[10.900,78.850],[10.888,78.862],[10.875,78.872],[10.860,78.878]], { color: '#4a90d9', weight: 3, opacity: .55, dashArray: '6,3' })
      .addTo(map).bindTooltip('Kollidam River', { sticky: true })

    // NH-227
    L.polyline([[10.830,78.808],[10.880,78.812],[10.944,78.813]], { color: '#e07a20', weight: 2, opacity: .5 })
      .addTo(map).bindTooltip('NH-227', { sticky: true })

    // ── LAYER: Community Zones ──
    const commGroup = L.layerGroup()
    COMM_ZONES.forEach(z => {
      L.polygon(z.coords, { color: z.border, fillColor: z.fill, fillOpacity: 1, weight: 1.5, dashArray: '4,3' })
        .bindTooltip(`<b style="font-family:'Outfit',sans-serif;font-size:.72rem">${z.name}</b>`, { sticky: true })
        .on('click', function() {
          L.popup({ maxWidth: 280 }).setLatLng(this.getBounds().getCenter())
            .setContent(`<div style="font-family:'Outfit',sans-serif;padding:.7rem .9rem"><b style="font-size:.85rem;color:#10180f">${z.name}</b><p style="font-size:.75rem;color:#617060;line-height:1.55;margin-top:.4rem">${z.desc}</p></div>`)
            .openOn(map)
        })
        .addTo(commGroup)
    })
    layerGroups.current.comm = commGroup
    commGroup.addTo(map)

    // ── LAYER: Heat Zones ──
    const heatGroup = L.layerGroup()
    HEAT_ZONES.forEach(h => {
      L.rectangle(h.bounds, { color: 'transparent', fillColor: h.color, fillOpacity: 1, weight: 0 })
        .bindTooltip(`<span style="font-family:'Outfit',sans-serif;font-size:.7rem;font-weight:700">${h.label}</span>`, { sticky: true })
        .addTo(heatGroup)
    })
    layerGroups.current.heat = heatGroup

    // ── LAYER: Booth Bubbles ──
    const boothGroup = L.layerGroup()
    BOOTH_SAMPLES.forEach(b => {
      const col = b.affinity === 'aiadmk' ? C.g500 : b.affinity === 'dmk' ? C.red : '#e07a20'
      const label = b.affinity === 'aiadmk' ? 'AIADMK Lean' : b.affinity === 'dmk' ? 'DMK Lean' : 'Swing Zone'
      L.circleMarker([b.lat, b.lng], { radius: 8 + (b.priority / 100) * 20, color: col, fillColor: col, fillOpacity: .25, weight: 2 })
        .on('click', function() {
          L.popup({ maxWidth: 260 }).setLatLng([b.lat, b.lng])
            .setContent(`<div style="font-family:'Outfit',sans-serif;padding:.7rem .9rem"><b style="font-size:.85rem">${b.name}</b><br><span style="font-size:.68rem;color:#617060">${b.voters} registered voters</span><div style="margin-top:.6rem;font-size:.75rem;color:#617060">AIADMK: <strong style="color:#23673d">${b.aiadmk}%</strong> · DMK: <strong style="color:#bf3c3c">${b.dmk}%</strong><br>Priority: <strong style="color:${col}">${b.priority}/100</strong> · ${label}</div></div>`)
            .openOn(map)
        })
        .bindTooltip(`<span style="font-family:'Outfit',sans-serif;font-size:.7rem;font-weight:700">Priority: ${b.priority} · ${label}</span>`, { sticky: true })
        .addTo(boothGroup)
    })
    layerGroups.current.booth = boothGroup

    // ── LAYER: Infrastructure ──
    const infraGroup = L.layerGroup()
    INFRA_MARKERS.forEach(inf => {
      const icon = L.divIcon({ html: `<div style="font-size:1.4rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));cursor:pointer">${inf.icon}</div>`, iconSize: [28, 28], iconAnchor: [14, 14], className: '' })
      L.marker([inf.lat, inf.lng], { icon })
        .on('click', function() { L.popup({ maxWidth: 290 }).setLatLng([inf.lat, inf.lng]).setContent(infraPopupHTML(inf)).openOn(map) })
        .addTo(infraGroup)
      if (inf.status === 'MISSING' || inf.status === 'CRISIS')
        L.circleMarker([inf.lat, inf.lng], { radius: 18, color: inf.color, fillColor: 'transparent', weight: 1.5, opacity: .4, dashArray: '4,3' }).addTo(infraGroup)
    })
    layerGroups.current.infra = infraGroup
    infraGroup.addTo(map)

    // ── LAYER: Village Pins ──
    const pinsGroup = L.layerGroup()
    VILLAGES.forEach(v => {
      const col = v.aiadmk > v.dmk ? C.g500 : v.dmk > v.aiadmk + 5 ? C.red : '#e07a20'
      const sz = v.type === 'town' ? 13 : 9
      const icon = L.divIcon({
        html: `<div style="width:${sz*2}px;height:${sz*2}px;border-radius:50%;background:${col};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>`,
        iconSize: [sz*2, sz*2], iconAnchor: [sz, sz], className: '',
      })
      L.marker([v.lat, v.lng], { icon })
        .on('click', function() { L.popup({ maxWidth: 300 }).setLatLng([v.lat, v.lng]).setContent(popupHTML(v)).openOn(map) })
        .bindTooltip(`<b style="font-family:'Outfit',sans-serif;font-size:.72rem">${v.name}</b>`, { direction: 'top' })
        .addTo(pinsGroup)
      const lblIcon = L.divIcon({
        html: `<div style="font-family:'Outfit',sans-serif;font-size:${v.type==='town'?'10':'9'}px;font-weight:${v.type==='town'?700:600};color:${v.type==='town'?'#0c2318':'#2e3d2c'};background:rgba(255,255,255,.85);padding:1px 4px;border-radius:3px;white-space:nowrap;pointer-events:none">${v.name}</div>`,
        iconSize: [0, 0], iconAnchor: [0, -14], className: '',
      })
      L.marker([v.lat, v.lng], { icon: lblIcon, interactive: false }).addTo(pinsGroup)
    })
    layerGroups.current.pins = pinsGroup
    pinsGroup.addTo(map)

    map.on('click', () => map.closePopup())
    window.addEventListener('resize', () => map.invalidateSize())
    return () => window.removeEventListener('resize', () => map.invalidateSize())
  }, [leafletReady])

  const toggleLayer = (key) => {
    const map = mapInstance.current
    const L = window.L
    if (!map || !L) return
    const next = !layers[key]
    setLayers(prev => ({ ...prev, [key]: next }))
    if (layerGroups.current[key]) {
      if (next) layerGroups.current[key].addTo(map)
      else map.removeLayer(layerGroups.current[key])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: '.55rem 1rem', display: 'flex', gap: '.35rem', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
        {LAYER_CONFIG.map(l => (
          <button key={l.key} onClick={() => toggleLayer(l.key)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px',
            borderRadius: 20, fontFamily: "'Outfit',sans-serif", fontSize: '.67rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap',
            border: `1.5px solid ${layers[l.key] ? l.color : C.line}`,
            background: layers[l.key] ? l.color : C.white,
            color: layers[l.key] ? '#fff' : C.ink3,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: layers[l.key] ? 'rgba(255,255,255,.7)' : l.color, flexShrink: 0, display: 'block' }} />
            {l.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: C.line, margin: '0 .2rem' }} />
        <button onClick={() => mapInstance.current?.setView([10.879, 78.812], 12)} style={{
          padding: '5px 12px', borderRadius: 20, fontFamily: "'Outfit',sans-serif", fontSize: '.63rem', fontWeight: 700,
          cursor: 'pointer', border: `1px solid ${C.line}`, background: C.line2, color: C.ink3, marginLeft: 'auto',
        }}>⌖ Reset View</button>
      </div>

      {/* Map + Overlays */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!leafletReady && (
          <div style={{ position: 'absolute', inset: 0, background: C.g050, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1rem', fontWeight: 700, color: C.g600 }}>Loading map…</div>
              <div style={{ fontSize: '.8rem', color: C.ink3, marginTop: '.4rem' }}>Initialising Leaflet</div>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Stats overlay */}
        <div style={{ position: 'absolute', top: '.8rem', left: '.8rem', zIndex: 900, background: 'rgba(255,255,255,.97)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '.85rem 1rem', width: 190, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.5rem', borderBottom: `1px solid ${C.line}`, paddingBottom: '.4rem' }}>AC-143 Stats</div>
          {[['Electorate','2,18,131',''],['2021 Turnout','79.56%',''],['DMK 2021','84,914','r'],['AIADMK 2021','67,965','g'],['NTK Pool','16,248','au'],['Gap to Close','16,949','r'],['Booths','300','']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.18rem 0', borderBottom: `1px dashed ${C.line}` }}>
              <span style={{ fontSize: '.63rem', color: C.ink3 }}>{l}</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.72rem', fontWeight: 700, color: c === 'g' ? C.g600 : c === 'r' ? C.red : c === 'au' ? C.au : C.ink }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '.8rem', zIndex: 900, background: 'rgba(255,255,255,.97)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '1rem 1.1rem', minWidth: 200, maxHeight: '60vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.6rem', borderBottom: `1px solid ${C.line}`, paddingBottom: '.4rem' }}>Legend</div>
          {layers.comm && (
            <>
              <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink4, marginBottom: '.3rem' }}>Community Zones</div>
              {[['rgba(46,132,79,.4)','Muthuraja Belt'],['rgba(200,160,48,.4)','Udaiyar / DMK Zone'],['rgba(26,111,168,.4)','Christian Area'],['rgba(191,60,60,.35)','Dalit/SC Belt'],['rgba(108,60,168,.35)','Thevar Zone']].map(([bg, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '.2rem 0', fontSize: '.7rem', color: C.ink2 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, flexShrink: 0, display: 'block' }} />{lbl}
                </div>
              ))}
            </>
          )}
          {layers.booth && (
            <>
              <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink4, marginTop: '.6rem', marginBottom: '.3rem' }}>Booth Priority</div>
              {[[C.g500,'AIADMK Lean'],['#e07a20','Swing Zone'],[C.red,'DMK Lean']].map(([col, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '.2rem 0', fontSize: '.7rem', color: C.ink2 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: col + '55', border: `2px solid ${col}`, flexShrink: 0, display: 'block' }} />{lbl}
                </div>
              ))}
            </>
          )}
          {layers.infra && (
            <>
              <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink4, marginTop: '.6rem', marginBottom: '.3rem' }}>Infrastructure</div>
              {[['🌉','Missing bridge'],['🚆','Railway demand'],['🛣️','Road gap'],['💧','Water/irrigation']].map(([icon, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '.18rem 0', fontSize: '.7rem', color: C.ink2 }}>
                  <span style={{ fontSize: '.9rem' }}>{icon}</span>{lbl}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.g900, padding: '.3rem .8rem', display: 'flex', gap: '1.2rem', zIndex: 900, flexWrap: 'wrap' }}>
          {['Lalgudi AC-143 · Tiruchirappalli District · Tamil Nadu','Centre: 10.879°N, 78.812°E','⚠️ Approximate boundaries — for campaign planning only · Not official ECI data'].map((t, i) => (
            <span key={i} style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.35)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
