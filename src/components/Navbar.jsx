import { NavLink, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { C } from '../data'

const NAV_ITEMS = [
  { path: '/',          num: '01', en: 'Overview',         ta: 'கண்ணோட்டம்'     },
  { path: '/history',   num: '02', en: 'Election History', ta: 'வரலாறு'         },
  { path: '/caste',     num: '03', en: 'Caste & Ground',   ta: 'சாதி & களம்'    },
  { path: '/strategy',  num: '04', en: '2026 Strategy',    ta: 'வியூகம்'         },
  { path: '/map',       num: '05', en: 'Field Map',        ta: 'வரைபடம்'        },
  { path: '/voters',    num: '06', en: 'Voter List',       ta: 'வாக்காளர்கள்'   },
]

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: 38, background: C.g900,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.6rem',
      }}>
        <span style={{ fontSize: '.67rem', color: 'rgba(255,255,255,.38)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          {t('Confidential · Lalgudi AC-143 · AIADMK NDA 2026 · Field Intelligence', 'இரகசியம் · லால்குடி 143 · அதிமுக NDA 2026')}
        </span>
        <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,.14)', borderRadius: 4, overflow: 'hidden' }}>
          {[['EN','en'],['தமிழ்','ta']].map(([lbl, val]) => (
            <button key={val} onClick={() => setLang(val)} style={{
              padding: '3px 13px', fontFamily: "'Outfit',sans-serif", fontSize: '.64rem', fontWeight: 700,
              letterSpacing: '.06em', textTransform: 'uppercase', border: 'none',
              background: lang === val ? C.au : 'transparent',
              color: lang === val ? C.g900 : 'rgba(255,255,255,.38)',
              cursor: 'pointer', transition: 'all .15s',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Nav bar */}
      <nav style={{
        position: 'fixed', top: 38, left: 0, right: 0, zIndex: 299,
        height: 58, background: C.white,
        borderBottom: `2px solid ${C.g100}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.6rem',
        boxShadow: '0 2px 18px rgba(13,43,26,.06)',
      }}>
        {/* Brand */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.g500 }} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.92rem', fontWeight: 800, color: C.g800, letterSpacing: '-.01em' }}>
            {t('Lalgudi 2026 · Field Intelligence', 'லால்குடி 2026 · தகவல் அறிக்கை')}
          </span>
        </div>

        {/* Links */}
        <ul style={{ display: 'flex', listStyle: 'none', height: 58, gap: 0, overflowX: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <li key={item.path} style={{ position: 'relative', flexShrink: 0 }}>
              <NavLink to={item.path} end={item.path === '/'} style={({ isActive }) => ({
                height: 58, padding: '0 .85rem', display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: "'Outfit',sans-serif", fontSize: '.74rem', fontWeight: 600,
                color: isActive ? C.g700 : C.ink3,
                textDecoration: 'none', transition: 'color .15s', whiteSpace: 'nowrap',
                borderBottom: isActive ? `3px solid ${C.g500}` : '3px solid transparent',
              })}>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '.56rem', fontWeight: 800, color: C.au }}>{item.num}</span>
                {t(item.en, item.ta)}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Badge */}
        <div style={{
          background: C.g700, color: '#fff', fontFamily: "'Outfit',sans-serif",
          fontSize: '.67rem', fontWeight: 700, padding: '5px 13px', borderRadius: 20,
          letterSpacing: '.04em', flexShrink: 0,
        }}>
          {t('23 Apr 2026', '23 ஏப்ரல் 2026')}
        </div>
      </nav>
    </>
  )
}
