import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { C } from '../data'
import { useBreakpoint } from '../hooks/useBreakpoint'

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
  const location = useLocation()
  const { isTablet, isMobile } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)
  const topBarHeight = isTablet ? 56 : 38
  const navBaseHeight = 58
  const overlayTop = topBarHeight + (isTablet ? 64 : navBaseHeight)

  useEffect(() => { setMenuOpen(false) }, [location.pathname, isTablet])

  useEffect(() => {
    if (!isTablet || typeof document === 'undefined') return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : original
    return () => { document.body.style.overflow = original }
  }, [menuOpen, isTablet])

  const getNavLinkStyle = (isActive, variant) => {
    if (variant === 'mobile') {
      return {
        height: 'auto',
        padding: '.75rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        fontFamily: "'Outfit',sans-serif",
        fontSize: '.9rem',
        fontWeight: 600,
        color: isActive ? C.au2 : '#fff',
        borderBottom: `1px solid ${isActive ? C.au2 : 'rgba(255,255,255,.12)'}`,
        textDecoration: 'none',
      }
    }
    return {
      height: navBaseHeight,
      padding: '0 .85rem',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: "'Outfit',sans-serif",
      fontSize: '.74rem',
      fontWeight: 600,
      color: isActive ? C.g700 : C.ink3,
      textDecoration: 'none',
      transition: 'color .15s',
      whiteSpace: 'nowrap',
      borderBottom: isActive ? `3px solid ${C.g500}` : '3px solid transparent',
    }
  }

  const renderNavList = (variant) => (
    <ul style={{
      display: 'flex',
      flexDirection: variant === 'mobile' ? 'column' : 'row',
      listStyle: 'none',
      height: variant === 'mobile' ? 'auto' : navBaseHeight,
      gap: variant === 'mobile' ? 0 : 0,
      overflowX: variant === 'mobile' ? 'visible' : 'auto',
      margin: 0,
      padding: variant === 'mobile' ? '0 1.5rem 1.5rem' : 0,
    }}>
      {NAV_ITEMS.map(item => (
        <li key={item.path} style={{ position: 'relative', flexShrink: variant === 'mobile' ? 1 : 0 }}>
          <NavLink
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => getNavLinkStyle(isActive, variant)}
          >
            <span style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: '.65rem',
              fontWeight: 800,
              color: variant === 'mobile' ? 'rgba(255,255,255,.6)' : C.au,
              letterSpacing: '.08em',
            }}>{item.num}</span>
            <span style={{ flex: 1 }}>{t(item.en, item.ta)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: C.g900,
        display: 'flex', alignItems: isTablet ? 'flex-start' : 'center', justifyContent: 'space-between',
        padding: isTablet ? '.4rem 1rem' : '0 1.6rem',
        flexDirection: isTablet ? 'column' : 'row',
        gap: isTablet ? '.35rem' : 0,
        minHeight: topBarHeight,
      }}>
        <span style={{ fontSize: '.67rem', color: 'rgba(255,255,255,.48)', letterSpacing: '.08em', textTransform: 'uppercase', lineHeight: 1.4 }}>
          {isMobile
            ? t('Confidential · Lalgudi AC-143', 'இரகசியம் · லால்குடி 143')
            : t('Confidential · Lalgudi AC-143 · AIADMK NDA 2026 · Field Intelligence', 'இரகசியம் · லால்குடி 143 · அதிமுக NDA 2026')}
        </span>
        <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,.14)', borderRadius: 4, overflow: 'hidden', flexWrap: 'wrap' }}>
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
        position: 'fixed', top: topBarHeight, left: 0, right: 0, zIndex: 299,
        height: isTablet ? 'auto' : navBaseHeight,
        background: C.white,
        borderBottom: `2px solid ${C.g100}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isTablet ? '.5rem 1rem' : '0 1.6rem',
        boxShadow: '0 2px 18px rgba(13,43,26,.06)',
        gap: isTablet ? '.8rem' : 0,
        flexWrap: isTablet ? 'wrap' : 'nowrap',
      }}>
        {/* Brand */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.g500 }} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: isTablet ? '.85rem' : '.92rem', fontWeight: 800, color: C.g800, letterSpacing: '-.01em' }}>
            {t('Lalgudi 2026 · Field Intelligence', 'லால்குடி 2026 · தகவல் அறிக்கை')}
          </span>
        </div>

        {!isTablet && renderNavList('desktop')}

        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto' }}>
          <div style={{
            background: C.g700, color: '#fff', fontFamily: "'Outfit',sans-serif",
            fontSize: '.67rem', fontWeight: 700, padding: '5px 13px', borderRadius: 20,
            letterSpacing: '.04em', flexShrink: 0,
          }}>
            {t('23 Apr 2026', '23 ஏப்ரல் 2026')}
          </div>
          {isTablet && (
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                border: `1px solid ${C.g200}`,
                background: C.white,
                color: C.ink,
                fontFamily: "'Outfit',sans-serif",
                fontSize: '.72rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 6,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {menuOpen ? t('Close', 'மூடு') : t('Menu', 'மெனு')}
            </button>
          )}
        </div>
      </nav>

      {isTablet && menuOpen && (
        <div style={{
          position: 'fixed', top: overlayTop, left: 0, right: 0, bottom: 0,
          background: 'rgba(9,18,13,.96)',
          zIndex: 290,
          overflowY: 'auto',
          paddingTop: '.5rem',
        }}>
          {renderNavList('mobile')}
        </div>
      )}
    </>
  )
}
