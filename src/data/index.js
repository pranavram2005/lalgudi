// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
export const C = {
  g900: '#0c2318', g800: '#143320', g700: '#1b4d2e', g600: '#23673d',
  g500: '#2d844f', g400: '#3ea463', g300: '#68c287', g100: '#d4f0de', g050: '#f2fbf5',
  au: '#c8a030', au2: '#e6bc52', au3: '#f7e49e', au4: 'rgba(200,160,48,0.10)',
  auBorder: 'rgba(200,160,48,0.22)',
  ink: '#10180f', ink2: '#2e3d2c', ink3: '#617060', ink4: '#9bb09a',
  line: '#ddeadf', line2: '#ecf5ee', bg: '#f5faf6', white: '#ffffff',
  red: '#bf3c3c', red2: 'rgba(191,60,60,0.09)',
}

// ─── ELECTION RESULTS ────────────────────────────────────────────────────────
export const ELECTION_DATA = [
  {
    year: 2006, winner: 'DMK', candidate: 'A. Soundara Pandian',
    results: [
      { p: 'DMK · A. Soundara Pandian', v: 62937, pct: 47.62, color: 'r' },
      { p: 'AIADMK · T. Rajaram', v: 59380, pct: 44.93, color: 'g' },
      { p: 'DMDK · S. Ramu', v: 4376, pct: 3.31, color: 'k' },
      { p: 'Others', v: 1474, pct: 0.98, color: 'k' },
    ],
    margin: 3557, turnout: 75.83, electors: 174305,
    note: 'T. Rajaram (AIADMK) was runner-up — the same T. Rajaram whose network AIADMK is reactivating for 2026. DMDK\'s 4,376 were the spoiler.',
    tag: 'DMK GAIN from AIADMK · First Soundara Pandian Win',
  },
  {
    year: 2011, winner: 'DMK', candidate: 'A. Soundara Pandian',
    results: [
      { p: 'DMK · A. Soundara Pandian', v: 65363, pct: 44.71, color: 'r' },
      { p: 'DMDK · A.D. Sendhureswaran', v: 58208, pct: 39.81, color: 'k' },
      { p: 'IJK · P. Parkkavan Pachamuthu', v: 14004, pct: 9.58, color: 'au' },
      { p: 'BJP · M.S. Lohithasan', v: 2413, pct: 1.65, color: 'k' },
    ],
    margin: 7155, turnout: 83.46, electors: 146201,
    note: 'KEY INSIGHT: AIADMK won 150 seats statewide but LOST here. IJK (Udaiyar/Pachamuthu party) got 14,004 votes allied to DMK. Without IJK, Soundara Pandian would have lost.',
    tag: 'DMK HOLD despite statewide AIADMK wave',
  },
  {
    year: 2016, winner: 'DMK', candidate: 'A. Soundara Pandian',
    results: [
      { p: 'DMK · A. Soundara Pandian', v: 77946, pct: 46.80, color: 'r' },
      { p: 'AIADMK · M. Vijayamurthy', v: 74109, pct: 44.50, color: 'g' },
      { p: 'CPI(M) · M. Jayaseelan', v: 6784, pct: 4.07, color: 'k' },
      { p: 'IJK · K. Selvakumar', v: 892, pct: 0.54, color: 'au' },
    ],
    margin: 3837, turnout: 81.68, electors: 203917,
    note: '2016 is AIADMK\'s real benchmark. CPI(M) with 6,784 was the spoiler — without them, AIADMK wins. IJK shrank to 892 (vs 14,004 in 2011) — Udaiyar consolidation weakened.',
    tag: 'DMK HOLD — closest AIADMK came in recent memory',
  },
  {
    year: 2021, winner: 'DMK', candidate: 'A. Soundara Pandian',
    results: [
      { p: 'DMK · A. Soundara Pandian', v: 84914, pct: 48.93, color: 'r' },
      { p: 'AIADMK · D.R. Dharmaraj', v: 67965, pct: 39.16, color: 'g' },
      { p: 'NTK · I. Malar Tamil Prabha', v: 16248, pct: 9.36, color: 'au' },
      { p: 'AMMK · M. Vijayamurthy', v: 2941, pct: 1.69, color: 'k' },
    ],
    margin: 16949, turnout: 79.56, electors: 218131,
    note: 'NTK emerged with 16,248 protest votes. AMMK got 2,941. AIADMK dropped 5.33% from 2016 — the post-Jayalalithaa collapse quantified.',
    tag: 'DMK HOLD — margin exploded post-Jayalalithaa',
  },
]

export const TIMELINE = [
  { year: '1967', party: 'dmk', winner: 'DMK', detail: 'First win. Historic 1967 election swept Congress out of Tamil Nadu.' },
  { year: '1971', party: 'dmk', winner: 'DMK · Muthamil Selvan VN', detail: 'Won by 11,963 over INC. DMK 40,213 · INC 28,250.' },
  { year: '1977', party: 'aiadmk', winner: 'AIADMK · K.N. Shanmugam ✓', detail: 'First AIADMK win. Post-Emergency anti-DMK wave. Margin: just 1,533 votes. ADMK 33,322 · DMK 31,789.' },
  { year: '1980', party: 'dmk', winner: 'DMK · Anbil Dharmalingam', detail: 'DMK reclaimed. Dharmalingam began building DMK\'s institutional presence in Lalgudi.' },
  { year: '1984', party: 'other', winner: 'INC · K. Venkatachalam', detail: 'Indira Gandhi assassination sympathy wave. Won by 25,122 — largest margin in Lalgudi history. INC: 61,590.' },
  { year: '1989', party: 'dmk', winner: 'DMK · K.N. Nehru', detail: 'Nehru\'s debut — won by 23,188 votes. This same KN Nehru is now Minister. His conflict with Soundara Pandian (June 2024) is a key 2026 factor.' },
  { year: '1991', party: 'other', winner: 'INC · J. Logambal', detail: 'Rajiv Gandhi assassination wave. KN Nehru (DMK) lost by 13,517 — shows how decisive external events can flip entrenched seats.' },
  { year: '1996', party: 'dmk', winner: 'DMK · K.N. Nehru', detail: 'Anti-Jayalalithaa wave. Nehru reclaimed. He held it until 2001.' },
  { year: '2001', party: 'aiadmk', winner: 'AIADMK · S.M. Balan ✓', detail: 'AIADMK\'s second and last win. Pro-Jayalalithaa wave. Balan defeated KN Nehru by only 1,610 votes. AIADMK: 58,288 · DMK: 56,678.' },
  { year: '2006–21', party: 'dmk', winner: 'DMK · A. Soundara Pandian (4 terms)', detail: 'Four consecutive wins. See detailed analysis on this page.' },
]

// ─── COMMUNITY DATA ───────────────────────────────────────────────────────────
export const COMMUNITY_DATA = [
  { community: 'Women Voters', tname: 'பெண் வாக்காளர்கள்', size: '51.8% · ~1,15,455', lean: 'Split', target: '65–70%', lever: 'Mahila Morcha + Amma legacy', approach: 'Home meetings, Day 1 activation across 36 wards', conv: 68 },
  { community: 'Udaiyar', tname: 'உடையார்', size: '~18–22%', lean: 'Strong DMK', target: '25–30%', lever: 'SP ticket denial / Vellamandi outreach', approach: 'Conditional on DMK ticket decision. Private ward lieutenant outreach.', conv: 28 },
  { community: 'Muthuraja', tname: 'முத்துராஜா', size: 'Largest OBC', lean: 'Split', target: '55–65%', lever: 'Kollidam bridge + T.Rajaram network', approach: 'Farmer breakfast meets, NDA bridge commitment', conv: 60 },
  { community: 'Dalit / SC', tname: 'தலித் / SC', size: '20.95%', lean: 'Lean DMK', target: '40–50%', lever: 'Hamlet road pledge + NTK overlap', approach: 'Padayatra, written commitment, candidate identity proximity', conv: 45 },
  { community: 'Christian', tname: 'கிறிஸ்தவர்', size: '~18% (taluk)', lean: 'Floating', target: '65–75%', lever: 'Candidate IS the community', approach: 'Parish network quietly by Day 10. School trust engagement.', conv: 70 },
  { community: 'Thevar', tname: 'தேவர்', size: 'Significant', lean: 'Lean AIADMK', target: '55–65%', lever: 'Jayalalithaa trust + sugarcane MSP', approach: 'Senior AIADMK Thevar leaders, caste association meetings', conv: 60 },
  { community: 'Muslim', tname: 'முஸ்லிம்', size: '~11.4%', lean: 'Lean DMK', target: '35–40%', lever: 'AIADMK secular record', approach: 'Development messaging only. Not a priority flip target.', conv: 38 },
  { community: 'NTK 2021 voters', tname: 'NTK 2021 வாக்காளர்கள்', size: '9.36% · 16,248', lean: 'Protest Float', target: '50–60%', lever: 'Anti-DMK credibility', approach: 'Dalit infrastructure pledge, candidate as credible change face', conv: 55 },
]

// ─── CAMPAIGN PHASES ──────────────────────────────────────────────────────────
export const PHASES = [
  {
    days: 'Days 1–6', name: 'Ignition', tname: 'தொடக்கம்', active: true, progress: 40,
    items: ['War room + 300 booth captain assignments', 'Mahila Morcha launch all 36 wards', '1,800-person WhatsApp network live', 'DMK ticket announcement watch', 'Social media command centre live'],
  },
  {
    days: 'Days 7–12', name: 'Community Lock-In', tname: 'சமூக பூட்டு', active: false, progress: 0,
    items: ['Dalit hamlet walk — film the road problem', 'Muthuraja farmer breakfast meets', 'Christian parish network activation (quiet)', 'Udaiyar private Vellamandi outreach', 'Amma welfare scheme camp — 500 families'],
  },
  {
    days: 'Days 13–18', name: 'Issue Domination', tname: 'பிரச்சின ஆதிக்கம்', active: false, progress: 0,
    items: ['Kollidam bridge yatra + Central petition', '5,000-sign Vaigai Express petition', '500-farmer Cauvery march', 'Dalit hamlet road expose — press tour', 'Mid-campaign press conference'],
  },
  {
    days: 'Days 19–24', name: 'Ground Surge', tname: 'தரை எழுச்சி', active: false, progress: 0,
    items: ['D2D saturation — all 300 booths', 'Mega welfare event — 2,000 families', 'Identify 60 critical swing booths', 'Social media peak — 3L Trichy reach', 'Deploy extra volunteers per critical booth'],
  },
  {
    days: 'Days 25–30', name: 'Final Push', tname: 'இறுதி முயற்சி', active: false, progress: 0,
    items: ['EPS star campaigner rally — 20,000 target', 'Grand women\'s event — 5,000 attendance', '600+ vehicles confirmed for polling day', 'All booth agents briefed — 5 AM Apr 23', 'Every unvoted AIADMK voter called'],
  },
]

// ─── MAP DATA ────────────────────────────────────────────────────────────────
export const VILLAGES = [
  { id: 'lalgudi', name: 'Lalgudi Town', tname: 'லால்குடி', lat: 10.879, lng: 78.812, type: 'town', aiadmk: 38, dmk: 50, ntk: 9, target: 45, booths: 42, issue: 'Municipal roads, Vaigai Express halt', desc: 'Headquarters town. High Udaiyar concentration. IJK-DMK alliance historically strong here.' },
  { id: 'kumulur', name: 'Kumulur', tname: 'குமுளூர்', lat: 10.870, lng: 78.865, type: 'village', aiadmk: 52, dmk: 38, ntk: 8, target: 62, booths: 5, issue: 'Kollidam bridge, AEC&RI college area', desc: 'Agricultural Engineering College area. Muthuraja dominant. AIADMK-leaning.' },
  { id: 'koovur', name: 'Koovur', tname: 'கூவூர்', lat: 10.910, lng: 78.820, type: 'village', aiadmk: 55, dmk: 36, ntk: 7, target: 65, booths: 9, issue: 'Koovur–Kilikoodu Kollidam bridge — 30km detour daily', desc: 'Heart of the Kollidam bridge demand. Strongest AIADMK-leaning village in constituency.' },
  { id: 'kilikoodu', name: 'Kilikoodu', tname: 'கிலிகோடு', lat: 10.922, lng: 78.833, type: 'village', aiadmk: 54, dmk: 37, ntk: 7, target: 63, booths: 5, issue: 'Kollidam bridge northern end', desc: 'North bank of Kollidam. Along with Koovur, most affected by absent bridge.' },
  { id: 'pullambadi', name: 'Pullambadi', tname: 'புள்ளம்படி', lat: 10.944, lng: 78.864, type: 'village', aiadmk: 42, dmk: 44, ntk: 10, target: 52, booths: 7, issue: 'Pullambadi irrigation channel, agriculture', desc: 'Block HQ. Mixed community. Swing zone — NTK at 10%.' },
  { id: 'pettavaithalai', name: 'Pettavaithalai', tname: 'பேட்டவைத்தாளை', lat: 10.860, lng: 78.785, type: 'village', aiadmk: 48, dmk: 38, ntk: 10, target: 68, booths: 10, issue: 'Hamlet roads, cremation ground, church schools', desc: 'Significant Christian and Dalit population. Dr. Leema\'s identity is a direct mobilisation advantage.' },
  { id: 'manachanallur', name: 'Manachanallur', tname: 'மணச்சனல்லூர்', lat: 10.853, lng: 78.843, type: 'town', aiadmk: 50, dmk: 40, ntk: 8, target: 60, booths: 14, issue: 'Cauvery water, sugarcane MSP, banana export', desc: 'Agricultural town. Muthuraja and Thevar farming community.' },
  { id: 'kattur', name: 'Kattur', tname: 'கட்டூர்', lat: 10.870, lng: 78.780, type: 'village', aiadmk: 42, dmk: 42, ntk: 13, target: 55, booths: 6, issue: 'SC hamlet roads, SHG credit, cremation ground', desc: 'High SC/Dalit. NTK at 13% — key swing target.' },
  { id: 'dalmiapuram', name: 'Dalmiapuram', tname: 'டால்மியாபுரம்', lat: 10.900, lng: 78.775, type: 'town', aiadmk: 40, dmk: 46, ntk: 10, target: 50, booths: 12, issue: 'Industrial worker welfare, cement factory', desc: 'Industrial town. DMK-leaning due to union influence.' },
  { id: 'paramasivapuram', name: 'Paramasivapuram', tname: 'பரமசிவபுரம்', lat: 10.885, lng: 78.828, type: 'village', aiadmk: 56, dmk: 34, ntk: 7, target: 65, booths: 7, issue: 'Sugarcane arrears, land records, Cauvery', desc: 'Thevar-dominant. Bharathidasan University College campus.' },
]

export const INFRA_MARKERS = [
  { lat: 10.916, lng: 78.826, icon: '🌉', title: 'Koovur–Kilikoodu Kollidam Bridge', status: 'MISSING', color: '#bf3c3c', desc: 'Unbuilt for 20+ years. Residents travel 30km+ extra daily. AIADMK+BJP NDA: submit Central road file within 15 days of government formation.' },
  { lat: 10.874, lng: 78.856, icon: '🚆', title: 'Lalgudi Station — Vaigai Express Halt', status: 'UNFULFILLED', color: '#e07a20', desc: 'Town of 36,000+ with no express train halt. Only NDA alliance can petition Railway Ministry — DMK as a state party cannot.' },
  { lat: 10.850, lng: 78.795, icon: '🛣️', title: 'Pettavaithalai Dalit Hamlet Roads', status: 'MISSING', color: '#bf3c3c', desc: 'Multiple hamlets lack paved roads to cremation grounds. AIADMK: tar road to every hamlet within 12 months of formation.' },
  { lat: 10.853, lng: 78.840, icon: '💧', title: 'Cauvery Water — Manachanallur', status: 'CRISIS', color: '#1a6fa8', desc: 'Cauvery shortfall critically affecting paddy, banana, and sugarcane farming. Pending crop insurance uncleared. AIADMK: Day 1 action.' },
  { lat: 10.880, lng: 78.770, icon: '🛣️', title: 'Kattur SC Colony Access Road', status: 'MISSING', color: '#bf3c3c', desc: 'SC colony lacks proper access road. Part of AIADMK\'s signed written commitment on hamlet infrastructure.' },
]

export const COMM_ZONES = [
  { name: 'Muthuraja Farming Belt', coords: [[10.895,78.795],[10.950,78.798],[10.945,78.880],[10.882,78.858],[10.882,78.830]], fill: 'rgba(46,132,79,0.15)', border: 'rgba(46,132,79,0.5)', desc: 'Dominant Muthuraja community. Kollidam bridge + Cauvery water are core issues. AIADMK competitive.' },
  { name: 'Udaiyar / DMK Core Zone', coords: [[10.868,78.798],[10.892,78.800],[10.892,78.828],[10.858,78.820]], fill: 'rgba(200,160,48,0.15)', border: 'rgba(200,160,48,0.5)', desc: 'Udaiyar-dominant zone centred on Lalgudi town. DMK–IJK alliance stronghold. Soundara Pandian\'s personal base.' },
  { name: 'Christian Community Zone', coords: [[10.848,78.770],[10.870,78.772],[10.875,78.798],[10.842,78.778]], fill: 'rgba(26,111,168,0.12)', border: 'rgba(26,111,168,0.4)', desc: '~18% Christian population in Pettavaithalai and Kattur areas. Dr. Leema\'s identity is a direct mobilisation lever.' },
  { name: 'Dalit / SC Hamlet Belt', coords: [[10.838,78.783],[10.856,78.788],[10.845,78.815],[10.830,78.792]], fill: 'rgba(191,60,60,0.10)', border: 'rgba(191,60,60,0.35)', desc: '20.95% SC population in dispersed hamlets. Key issues: cremation ground roads, SHG credit, Amma welfare restoration.' },
  { name: 'Thevar Agricultural Zone', coords: [[10.838,78.828],[10.860,78.828],[10.862,78.858],[10.842,78.852]], fill: 'rgba(108,60,168,0.10)', border: 'rgba(108,60,168,0.35)', desc: 'Thevar community farming zone. Sugarcane MSP, Cauvery allocation, banana export support. Historically AIADMK-aligned.' },
]

export const BOOTH_SAMPLES = [
  { lat:10.878, lng:78.813, name:'Booth 12 — Lalgudi Centre', priority:78, affinity:'swing', aiadmk:42, dmk:48, voters:720 },
  { lat:10.885, lng:78.808, name:'Booth 8 — Lalgudi North', priority:65, affinity:'dmk', aiadmk:36, dmk:54, voters:650 },
  { lat:10.872, lng:78.867, name:'Booth 48 — Kumulur', priority:88, affinity:'aiadmk', aiadmk:55, dmk:35, voters:580 },
  { lat:10.910, lng:78.820, name:'Booth 62 — Koovur', priority:93, affinity:'aiadmk', aiadmk:58, dmk:32, voters:620 },
  { lat:10.922, lng:78.832, name:'Booth 67 — Kilikoodu', priority:91, affinity:'aiadmk', aiadmk:56, dmk:34, voters:540 },
  { lat:10.855, lng:78.786, name:'Booth 22 — Pettavaithalai', priority:84, affinity:'aiadmk', aiadmk:50, dmk:36, voters:680 },
  { lat:10.870, lng:78.782, name:'Booth 18 — Kattur', priority:80, affinity:'swing', aiadmk:44, dmk:42, voters:660 },
  { lat:10.898, lng:78.779, name:'Booth 35 — Dalmiapuram', priority:60, affinity:'dmk', aiadmk:38, dmk:48, voters:740 },
  { lat:10.854, lng:78.842, name:'Booth 78 — Manachanallur E', priority:82, affinity:'aiadmk', aiadmk:52, dmk:38, voters:600 },
  { lat:10.884, lng:78.830, name:'Booth 55 — Paramasivapuram', priority:86, affinity:'aiadmk', aiadmk:57, dmk:33, voters:520 },
  { lat:10.943, lng:78.862, name:'Booth 95 — Pullambadi', priority:68, affinity:'swing', aiadmk:44, dmk:44, voters:630 },
  { lat:10.872, lng:78.867, name:'Booth 49 — Kumulur South', priority:85, affinity:'aiadmk', aiadmk:54, dmk:36, voters:510 },
]

export const HEAT_ZONES = [
  { bounds: [[10.900,78.795],[10.950,78.885]], color: 'rgba(46,132,79,0.26)', label: 'AIADMK Lean' },
  { bounds: [[10.840,78.768],[10.870,78.800]], color: 'rgba(46,132,79,0.20)', label: 'AIADMK Lean' },
  { bounds: [[10.845,78.825],[10.870,78.865]], color: 'rgba(46,132,79,0.18)', label: 'AIADMK Lean' },
  { bounds: [[10.870,78.795],[10.900,78.830]], color: 'rgba(255,165,0,0.20)', label: 'Swing Zone' },
  { bounds: [[10.875,78.840],[10.910,78.895]], color: 'rgba(255,165,0,0.16)', label: 'Swing Zone' },
  { bounds: [[10.858,78.798],[10.892,78.835]], color: 'rgba(191,60,60,0.20)', label: 'DMK Lean' },
  { bounds: [[10.920,78.775],[10.950,78.805]], color: 'rgba(191,60,60,0.16)', label: 'DMK Lean' },
]

// ─── VOTER DEMO DATA ──────────────────────────────────────────────────────────
const WARDS = ['Ward 1 — Lalgudi Town','Ward 2 — Kumulur','Ward 3 — Koovur','Ward 4 — Kilikoodu','Ward 5 — Manickam Nagar','Ward 6 — Pettavaithalai']
const COMMS = ['Muthuraja','Dalit/SC','Udaiyar','Christian','Thevar','Muslim','General']
const AFFS  = ['AIADMK Base','AIADMK Base','AIADMK Base','Swing Voter','Swing Voter','NTK 2021','DMK Soft']
const NM = ['Murugesan','Selvam','Rajan','Annamalai','Velmurugan','Natarajan','Suresh','Palani','Krishnan','Arumugam','Chandran','Duraisamy','Ganesan','Mani','Senthil']
const NF = ['Kowsalya','Kalpana','Suganthi','Meenakshi','Kavitha','Revathi','Priya','Sundari','Malathi','Bhuvana','Usha','Kamala','Girija','Thilaga','Padmavathi']
const SN = ['K','R','S','T','P','M','N','A','V','C','D','G','B']
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a

export function generateDemoVoters(n = 50) {
  return Array.from({ length: n }, (_, i) => {
    const g = Math.random() > 0.48 ? 'F' : 'M'
    const af = AFFS[rnd(0, AFFS.length-1)]
    const sc = af === 'AIADMK Base' ? rnd(82,96) : af === 'Swing Voter' ? rnd(60,79) : af === 'NTK 2021' ? rnd(55,74) : rnd(28,48)
    return {
      epic: 'TN143' + String(i+1).padStart(4,'0'),
      name: (g === 'F' ? NF : NM)[rnd(0,14)] + ' ' + SN[rnd(0,12)],
      age: rnd(18,72), gender: g,
      ward: WARDS[rnd(0,5)] + ' · Booth ' + rnd(1,50),
      community: COMMS[rnd(0,6)],
      affinity: af, score: sc,
      phone: '9' + rnd(100000000,999999999),
      notes: '',
    }
  })
}
