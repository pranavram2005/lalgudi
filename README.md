# Lalgudi AC-143 · AIADMK 2026 Field Intelligence App

## Tech Stack
- React 18 + Vite
- React Router v6 (file-based page routing)
- Leaflet.js (interactive map, loaded from CDN)
- No CSS framework — all styling via inline styles with design tokens

---

## Quick Start

```bash
cd lalgudi-app
npm install
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
lalgudi-app/
├── public/
│   └── images/              ← PUT YOUR IMAGES HERE
│       ├── candidate.png    ← Dr. M. Leema Rose Martin (hero photo)
│       ├── hero2.jpg        ← Lalgudi fields / Cauvery-side (Overview page)
│       └── hero3.jpg        ← Lalgudi town / voters (Overview page)
│
├── src/
│   ├── App.jsx              ← Root app with React Router <Routes>
│   ├── main.jsx             ← ReactDOM entry point
│   │
│   ├── context/
│   │   └── LangContext.jsx  ← English / Tamil language toggle (useLang hook)
│   │
│   ├── data/
│   │   └── index.js         ← All data: election results, community, phases,
│   │                           map markers, voter demo generator
│   │
│   ├── components/
│   │   ├── Navbar.jsx       ← Fixed top bar + nav with NavLink active states
│   │   ├── MapComponent.jsx ← Leaflet map with 5 toggle layers
│   │   └── ui/
│   │       └── index.jsx    ← Shared: Label, Heading, Card, ProgBar, Chip,
│   │                           Insight, Grid, Section, Wrap, StatBar,
│   │                           Footer, ResultCard, TlItem
│   │
│   └── pages/
│       ├── Overview.jsx     ← Route: /          (hero, stats, swing math)
│       ├── History.jsx      ← Route: /history   (2006–2021 results, timeline)
│       ├── Caste.jsx        ← Route: /caste     (Udaiyar/IJK analysis, table)
│       ├── Strategy.jsx     ← Route: /strategy  (4 levers, risks, 30-day plan)
│       ├── MapPage.jsx      ← Route: /map       (full-screen Leaflet map)
│       └── Voters.jsx       ← Route: /voters    (CSV upload, filters, table)
```

---

## Adding Your Images

Place images in `/public/images/`:

| File | Used in | Description |
|------|---------|-------------|
| `candidate.png` | Overview hero | Dr. M. Leema Rose Martin |
| `hero2.jpg` | Overview section | Lalgudi fields / Cauvery villages |
| `hero3.jpg` | Overview section | Lalgudi town / voters |

Images are referenced as `/images/filename.ext` — Vite serves the `public/` folder at the root.

---

## Language Toggle

The top-right **EN / தமிழ்** toggle switches all text using the `useLang()` hook:

```jsx
import { useLang } from '../context/LangContext'
const { t } = useLang()
// Usage:
t('English text', 'தமிழ் உரை')
```

---

## Updating Campaign Progress

In `src/data/index.js`, update `PHASES` array — set `progress` (0–100) on each phase and `active: true` on the current phase.

In `src/pages/Overview.jsx` and `src/pages/Strategy.jsx`, find the "Day 3 / 30" strings and update the day counter.

---

## Voter Data

The Voters page loads 50 demo records on start. To use real data:
1. Download the CSV template from the Voters page
2. Fill in your electoral roll data
3. Upload using the "Upload CSV" button

Expected columns: `EPIC, Name, Age, Gender, Ward, Community, Affinity, Score, Phone, Notes`

---

## Map Customisation

All map data lives in `src/data/index.js`:
- `VILLAGES` — village pin markers with popup data
- `INFRA_MARKERS` — infrastructure issue markers (bridge, road, railway, water)
- `COMM_ZONES` — community zone polygons
- `BOOTH_SAMPLES` — booth priority bubbles
- `HEAT_ZONES` — vote affinity heat rectangles

---

## Build for Production

```bash
npm run build
# Output in /dist — deploy to any static host
```
