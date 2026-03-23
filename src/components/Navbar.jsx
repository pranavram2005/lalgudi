import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { C } from '../data'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useAuth } from '../context/AuthContext'

const ADMIN_PROGRESS = { path: '/admin/progress', en: 'Command Room', ta: 'கட்டுப்பாட்டு அறை' }
const ADMIN_ITEM = { path: '/admin/booth-agent', en: 'Booth Agents', ta: 'பூத் ஏஜெண்ட்கள்' }

const OVERVIEW_CHILDREN = [
  { path: '/history',  en: 'Election History', ta: 'வரலாறு' },
  { path: '/caste',    en: 'Caste & Ground',   ta: 'சாதி & களம்' },
  { path: '/strategy', en: '2026 Strategy',    ta: 'வியூகம்' },
]

const ADMIN_NAV_ITEMS = [
  {
    path: '/',
    en: 'Overview',
    ta: 'கண்ணோட்டம்',
    children: OVERVIEW_CHILDREN,
  },
  { path: '/dashboard',  en: 'Dashboard',        ta: 'டாஷ்போர்டு'     },
  { path: '/map',        en: 'Field Map',        ta: 'வரைபடம்'        },
  { path: '/voters',     en: 'Voter List',       ta: 'வாக்காளர்கள்'   },
]

const AGENT_NAV_ITEMS = [
  { path: '/',          en: 'Overview',         ta: 'கண்ணோட்டம்', children: OVERVIEW_CHILDREN },
  { path: '/dashboard', en: 'My Dashboard',     ta: 'என் டாஷ்போர்டு' },
  { path: '/map',       en: 'Field Map',        ta: 'வரைபடம்' },
  { path: '/voters',    en: 'My Booth Voters',  ta: 'என் பூத் வாக்காளர்கள்' },
]

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const { isTablet, isMobile } = useBreakpoint()
  const { user, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const topBarHeight = isTablet ? 56 : 38
  const navBaseHeight = 58
  const overlayTop = topBarHeight + (isTablet ? 64 : navBaseHeight)

  const navItems = useMemo(() => {
    if (!user) return []
    const base = isAdmin ? [...ADMIN_NAV_ITEMS] : [...AGENT_NAV_ITEMS]
    if (isAdmin) base.push(ADMIN_PROGRESS, ADMIN_ITEM)
    return base.map((item, idx) => ({ ...item, num: String(idx + 1).padStart(2, '0') }))
  }, [user, isAdmin])

  useEffect(() => { setMenuOpen(false) }, [location.pathname, isTablet])

  useEffect(() => {
    if (!menuOpen) setOpenDropdown(null)
  }, [menuOpen])

  useEffect(() => {
    setOpenDropdown(null)
  }, [user?.role])

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
      overflow: 'visible',
      margin: 0,
      padding: variant === 'mobile' ? '0 1.5rem 1.5rem' : 0,
      justifyContent: variant === 'mobile' ? 'flex-start' : 'flex-end',
    }}>
      {navItems.map(item => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0
        const dropdownKey = item.path
        const dropdownOpen = hasChildren && (variant === 'mobile' ? openDropdown === dropdownKey : openDropdown === dropdownKey)

        return (
          <li
            key={item.path}
            style={{ position: 'relative', flexShrink: variant === 'mobile' ? 1 : 0, width: variant === 'mobile' ? '100%' : 'auto' }}
            onMouseEnter={hasChildren && variant !== 'mobile' ? () => setOpenDropdown(dropdownKey) : undefined}
            onMouseLeave={hasChildren && variant !== 'mobile' ? () => setOpenDropdown(null) : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: hasChildren && variant === 'mobile' ? 8 : 0 }}>
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
                {hasChildren && variant !== 'mobile' && (
                  <span style={{ fontSize: '.6rem', color: C.ink3, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s' }}>▾</span>
                )}
              </NavLink>
              {hasChildren && variant === 'mobile' && (
                <button
                  onClick={(e) => { e.preventDefault(); setOpenDropdown(prev => prev === dropdownKey ? null : dropdownKey) }}
                  style={{
                    border: `1px solid ${C.line}`,
                    background: 'rgba(255,255,255,.05)',
                    color: '#fff',
                    fontSize: '.7rem',
                    padding: '6px 10px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}
                >
                  {dropdownOpen ? t('Hide', 'மறை') : t('More', 'மேலும்')}
                </button>
              )}
            </div>
            {hasChildren && (
              <div style={{
                position: variant === 'mobile' ? 'static' : 'absolute',
                top: variant === 'mobile' ? 'auto' : navBaseHeight,
                left: variant === 'mobile' ? 0 : 0,
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                boxShadow: variant === 'mobile' ? 'none' : '0 18px 38px rgba(9,30,17,.15)',
                display: dropdownOpen ? 'flex' : 'none',
                flexDirection: 'column',
                minWidth: variant === 'mobile' ? '100%' : 210,
                marginTop: variant === 'mobile' ? '.6rem' : 0,
                padding: variant === 'mobile' ? 0 : '.35rem 0',
                zIndex: variant === 'mobile' ? 25 : 400,
              }}>
                {item.children.map((child, idx) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    style={({ isActive }) => ({
                      padding: '.65rem 1rem',
                      fontFamily: "'Outfit',sans-serif",
                      fontSize: '.8rem',
                      fontWeight: 600,
                      color: isActive ? C.g700 : C.ink,
                      textDecoration: 'none',
                      borderBottom: idx === item.children.length - 1 ? 'none' : `1px solid ${C.line}`,
                      background: isActive ? C.g50 : C.white,
                    })}
                  >
                    {t(child.en, child.ta)}
                  </NavLink>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )

  const handleBrandClick = () => {
    if (isAdmin) navigate('/')
    else navigate('/dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const userDescriptor = isAdmin
    ? t('Admin Command Desk', 'நிர்வாக மேடை')
    : t('Booth {{num}} Agent', 'பூத் {{num}} ஏஜெண்ட்').replace('{{num}}', user?.boothNumber || '')

  return (
    user ? (
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
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: isTablet ? 'flex-start' : 'flex-end' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
            <div style={{
              color: '#fff',
              fontSize: '.7rem',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,.08)',
              padding: '.35rem .75rem',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,.14)',
            }}>
              {t('Signed in as', 'உள்நுழைந்தவர்')}: <strong style={{ color: '#fff' }}>{user?.username}</strong> · {userDescriptor}
            </div>
            <button onClick={handleLogout} style={{
              border: '1px solid rgba(255,255,255,.4)',
              borderRadius: 999,
              padding: '.35rem .9rem',
              background: 'transparent',
              color: '#fff',
              fontSize: '.68rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              {t('Logout', 'வெளியேறு')}
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <nav style={{
        position: 'fixed', top: topBarHeight, left: 0, right: 0, zIndex: 299,
        height: isTablet ? 'auto' : navBaseHeight,
        background: C.white,
        borderBottom: `2px solid ${C.g100}`,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        padding: isTablet ? '.5rem 1rem' : '0 1.6rem',
        boxShadow: '0 2px 18px rgba(13,43,26,.06)',
        gap: isTablet ? '.8rem' : 0,
        flexWrap: isTablet ? 'wrap' : 'nowrap',
      }}>
        {/* Brand */}
        <div onClick={handleBrandClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.g500 }} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: isTablet ? '.85rem' : '.92rem', fontWeight: 800, color: C.g800, letterSpacing: '-.01em' }}>
            {t('Lalgudi 2026 · Field Intelligence', 'லால்குடி 2026 · தகவல் அறிக்கை')}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isTablet ? '.5rem' : '1rem',
          marginLeft: 'auto',
          flexWrap: isTablet ? 'wrap' : 'nowrap',
          justifyContent: 'flex-end',
          width: isTablet ? '100%' : 'auto',
        }}>
          {!isTablet && (
            <div style={{ flexShrink: 1, minWidth: 0 }}>
              {renderNavList('desktop')}
            </div>
          )}
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
          <div style={{
            background: C.g700, color: '#fff', fontFamily: "'Outfit',sans-serif",
            fontSize: '.67rem', fontWeight: 700, padding: '5px 13px', borderRadius: 20,
            letterSpacing: '.04em', flexShrink: 0,
          }}>
            {t('23 Apr 2026', '23 ஏப்ரல் 2026')}
          </div>
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
    ) : null
  )
}
