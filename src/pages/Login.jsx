import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { C } from '../data'

export default function Login() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const result = login(form.username.trim(), form.password)
    if (result.success) {
      const redirectTo = result.role === 'agent' ? '/dashboard' : '/'
      navigate(redirectTo, { replace: true })
    } else {
      setError(t('Invalid username or password.', 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல்.'))
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(circle at top, ${C.g100}, ${C.white})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: C.white, borderRadius: 16, padding: '2rem', boxShadow: '0 20px 60px rgba(15,42,26,.12)', border: `1px solid ${C.line}` }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.ink3 }}>{t('Admin Access', 'நிர்வாகர் அணுகல்')}</div>
          <h1 style={{ margin: '.4rem 0 0', fontSize: '1.85rem', fontWeight: 900, color: C.ink }}>{t('Sign in to Command Desk', 'கமாண்டு டெஸ்க்கில் உள்நுழைக')}</h1>
          <p style={{ color: C.ink3, fontSize: '.9rem', marginTop: '.4rem' }}>{t('Use your secure admin credentials to manage field intelligence.', 'களத் தகவல்களை நிர்வகிக்க பாதுகாப்பான நிர்வாக கணக்கை பயன்படுத்துங்கள்.')}</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3 }}>
            {t('Username', 'பயனர்பெயர்')}
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t('Enter admin username', 'நிர்வாக பயனர்பெயர் உள்ளிடவும்')}
              style={{ padding: '0.85rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, fontSize: '.95rem', fontFamily: "'Outfit',sans-serif" }}
              autoComplete="username"
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3 }}>
            {t('Password', 'கடவுச்சொல்')}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('Enter admin password', 'நிர்வாக கடவுச்சொல் உள்ளிடவும்')}
              style={{ padding: '0.85rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, fontSize: '.95rem', fontFamily: "'Outfit',sans-serif" }}
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <div style={{ background: 'rgba(215,64,64,.08)', border: '1px solid rgba(215,64,64,.4)', color: C.red, padding: '.8rem 1rem', borderRadius: 10, fontSize: '.85rem' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '.95rem 1.2rem',
              fontSize: '.95rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#fff',
              background: loading ? C.g300 : `linear-gradient(120deg, ${C.g500}, ${C.g700})`,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity .2s',
            }}
          >
            {loading ? t('Verifying…', 'சரிபார்க்கிறது…') : t('Login', 'உள்நுழை')}
          </button>
        </form>
        <div style={{ textAlign: 'center', fontSize: '.8rem', color: C.ink3, marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
          <span>{t('Booth agents: use the username & password assigned in the Add Booth Agent panel.', 'பூத் ஏஜெண்ட்கள்: “பூத் ஏஜெண்ட் சேர்க்கவும்” பகுதியில் வழங்கப்பட்ட பயனர்பெயர் மற்றும் கடவுச்சொல்லைப் பயன்படுத்தவும்.')}</span>
        </div>
      </div>
    </div>
  )
}
