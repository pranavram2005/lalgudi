import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { C } from '../data'
import data1 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-1-WI_with_roof'
import data2 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-2-WI_with_roof'
import data3 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-3-WI_with_roof'
import data4 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-4-WI_with_roof'
import data5 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-5-WI_with_roof'
import data6 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-6-WI_with_roof'
import data7 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-7-WI_with_roof'
import data8 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-8-WI_with_roof'
import data9 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-9-WI_with_roof'
import data10 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-10-WI_with_roof'

const allVotersData = [
  ...data1,
  ...data2,
  ...data3,
  ...data4,
  ...data5,
  ...data6,
  ...data7,
  ...data8,
  ...data9,
  ...data10,
]

const initialState = () => ({
  username: '',
  boothNumber: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  youtubeLink: '',
  websiteLink: '',
  donationAmount: '',
})

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const persistAgents = (agents) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('boothAgents', JSON.stringify(agents))
  }
}

const loadAgents = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem('boothAgents') || '[]')
  } catch (err) {
    return []
  }
}

export default function AddBoothAgent() {
    // Get number of confirmed checklists from localStorage
    const [confirmedCount, setConfirmedCount] = useState(0);
    useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('voterChecklists');
          if (raw) {
            const parsed = JSON.parse(raw);
            const count = Object.values(parsed || {}).filter(entry => entry && entry.confirmed).length;
            setConfirmedCount(count);
          } else {
            setConfirmedCount(0);
          }
        } catch {
          setConfirmedCount(0);
        }
      }
    }, []);
  const { t } = useLang()
  const { isTablet } = useBreakpoint()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialState)
  const [boothAgents, setBoothAgents] = useState(() => loadAgents())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBoothAgents(loadAgents())
  }, [])

  const boothUniverse = useMemo(() => {
    return Array.from(
      new Set(
        (allVotersData || [])
          .map(v => v?.Part)
          .filter(part => part !== undefined && part !== null && part !== '')
          .map(part => part.toString())
      )
    ).sort((a, b) => Number(a) - Number(b))
  }, [])

  const availableBooths = useMemo(() => {
    const taken = new Set(
      boothAgents
        .filter(agent => agent.id !== editingId)
        .map(agent => agent.boothNumber)
    )
    return boothUniverse.filter(booth => !taken.has(booth))
  }, [boothAgents, editingId, boothUniverse])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const resetForm = () => {
    setFormData(initialState())
    setEditingId(null)
    setLoading(false)
  }

  const handleEdit = (agent) => {
    setFormData({
      username: agent.username || '',
      boothNumber: agent.boothNumber || '',
      phoneNumber: agent.phoneNumber || '',
      password: agent.password || '',
      confirmPassword: agent.password || '',
      youtubeLink: agent.youtubeLink || '',
      websiteLink: agent.websiteLink || '',
      donationAmount: agent.donationAmount ? String(agent.donationAmount) : '',
    })
    setEditingId(agent.id)
    setError('')
    setSuccess('')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = (agentId) => {
    const proceed = typeof window === 'undefined' ? true : window.confirm(t('Delete this booth agent?', 'இந்த பூத் ஏஜெண்டை நீக்கவா?'))
    if (!proceed) return
    const updated = boothAgents.filter(agent => agent.id !== agentId)
    setBoothAgents(updated)
    persistAgents(updated)
    if (editingId === agentId) {
      resetForm()
    }
    setSuccess(t('Booth agent removed.', 'பூத் ஏஜெண்ட் நீக்கப்பட்டது.'))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError(t('Username is required.', 'பயனர்பெயர் அவசியம்.'))
      return false
    }
    if (!formData.boothNumber.trim()) {
      setError(t('Select or enter a booth number.', 'பூத் எண் அவசியம்.'))
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError(t('Phone number is required.', 'தொலைபேசி எண் அவசியம்.'))
      return false
    }
    if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      setError(t('Phone number must be 10 digits.', 'தொலைபேசி எண் 10 இலக்கமாக இருக்க வேண்டும்.'))
      return false
    }
    if (!formData.password) {
      setError(t('Password is required.', 'கடவுச்சொல் அவசியம்.'))
      return false
    }
    if (formData.password.length < 6) {
      setError(t('Password must be at least 6 characters.', 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.'))
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('Passwords do not match.', 'கடவுச்சொற்கள் பொருந்தவில்லை.'))
      return false
    }

    const trimmedUsername = formData.username.trim()
    const trimmedBooth = formData.boothNumber.trim()

    const usernameConflict = boothAgents.some(agent => agent.username === trimmedUsername && agent.id !== editingId)
    if (usernameConflict || trimmedUsername === 'admin') {
      setError(t('Username already exists.', 'பயனர்பெயர் ஏற்கனவே உள்ளது.'))
      return false
    }

    const boothConflict = boothAgents.some(agent => agent.boothNumber === trimmedBooth && agent.id !== editingId)
    if (boothConflict) {
      setError(t('Booth already has an agent.', 'இந்த பூத்திற்கு ஏஜெண்ட் ஏற்கனவே உள்ளார்.'))
      return false
    }

    if (formData.youtubeLink.trim() && !isValidHttpUrl(formData.youtubeLink.trim())) {
      setError(t('Invalid YouTube link.', 'தவறான YouTube இணைப்பு.'))
      return false
    }

    if (formData.websiteLink.trim() && !isValidHttpUrl(formData.websiteLink.trim())) {
      setError(t('Invalid website link.', 'தவறான இணைய இணைப்பு.'))
      return false
    }

    if (formData.donationAmount.trim()) {
      const amount = Number(formData.donationAmount)
      if (Number.isNaN(amount) || amount < 0) {
        setError(t('Donation amount must be a positive number.', 'நன்கொடை தொகை நேர்ம மதிப்பாக இருக்க வேண்டும்.'))
        return false
      }
    }

    return true
  }

  const isValidHttpUrl = (value) => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (err) {
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const payload = {
      id: editingId || generateId(),
      username: formData.username.trim(),
      boothNumber: formData.boothNumber.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      password: formData.password,
      youtubeLink: formData.youtubeLink.trim(),
      websiteLink: formData.websiteLink.trim(),
      donationAmount: formData.donationAmount ? Number(formData.donationAmount) : null,
      createdAt: editingId ? boothAgents.find(a => a.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      isActive: true,
    }

    let updated
    if (editingId) {
      updated = boothAgents.map(agent => agent.id === editingId ? payload : agent)
      setSuccess(t('Booth agent updated.', 'பூத் ஏஜெண்ட் புதுப்பிக்கப்பட்டது.'))
    } else {
      updated = [payload, ...boothAgents]
      setSuccess(t('Booth agent created successfully.', 'பூத் ஏஜெண்ட் உருவாக்கப்பட்டது.'))
    }

    setBoothAgents(updated)
    persistAgents(updated)
    setLoading(false)
    resetForm()
  }

  const labels = {
    title: t('Add Booth Agent', 'பூத் ஏஜெண்ட் சேர்க்கவும்'),
    subtitle: t('Assign a trusted agent to each booth and track their links or pledges.', 'ஒவ்வொரு பூத்திற்கும் நம்பகமான ஏஜெண்டை நியமித்து விவரங்களை பதிவு செய்யவும்.'),
    username: t('Username', 'பயனர்பெயர்'),
    booth: t('Booth Number', 'பூத் எண்'),
    phone: t('Phone Number', 'தொலைபேசி எண்'),
    password: t('Password', 'கடவுச்சொல்'),
    confirm: t('Confirm Password', 'கடவுச்சொல் உறுதி'),
    youtube: t('YouTube Link', 'YouTube இணைப்பு'),
    website: t('Website Link', 'இணைய இணைப்பு'),
    donation: t('Donation Amount', 'நன்கொடை தொகை'),
    optional: t('Optional', 'விருப்பம்'),
    save: editingId ? t('Update Agent', 'ஏஜெண்டை புதுப்பிக்கவும்') : t('Create Agent', 'ஏஜெண்டை உருவாக்கவும்'),
    cancelEdit: t('Cancel Editing', 'திருத்தலை ரத்து செய்'),
    existing: t('Existing Booth Agents', 'ஏற்கனவே உள்ள பூத் ஏஜெண்ட்கள்'),
    none: t('No booth agents yet.', 'இன்னும் பூத் ஏஜெண்ட்கள் இல்லை.'),
    back: t('Back to Dashboard', 'டாஷ்போர்டுக்கு திரும்பு'),
  }

  const formFieldStyle = {
    width: '100%',
    padding: '.85rem 1rem',
    borderRadius: 10,
    border: `1px solid ${C.line}`,
    fontSize: '.95rem',
    fontFamily: "'Outfit',sans-serif",
    background: C.white,
  }

  return (
    <div style={{ paddingTop: isTablet ? 86 : 104, background: C.g50, minHeight: '100vh' }}>
      <div style={{ fontWeight: 700, color: C.g700, fontSize: '1.1rem', marginBottom: '.7rem' }}>
        Division ({confirmedCount})
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isTablet ? '1.2rem' : '2.4rem 2.6rem 3rem' }}>
        <div style={{ background: C.white, borderRadius: 20, padding: isTablet ? '1.6rem' : '2rem 2.4rem', border: `1px solid ${C.line}`, boxShadow: '0 24px 70px rgba(15,42,26,.08)', marginBottom: '1.8rem' }}>
          <p style={{ fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', color: C.ink3, marginBottom: '.3rem' }}>{t('Admin Tool', 'நிர்வாக கருவி')}</p>
          <h1 style={{ margin: 0, fontSize: isTablet ? '1.9rem' : '2.2rem', fontWeight: 900, color: C.ink }}>{labels.title}</h1>
          <p style={{ marginTop: '.6rem', color: C.ink3, fontSize: '.95rem', maxWidth: 640 }}>{labels.subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'minmax(0,1fr) 360px', gap: '1.6rem' }}>
          <div style={{ background: C.white, borderRadius: 18, padding: isTablet ? '1.2rem' : '1.8rem', border: `1px solid ${C.line}`, boxShadow: '0 14px 40px rgba(15,42,26,.07)' }}>
            {editingId && (
              <div style={{ marginBottom: '1rem', padding: '.85rem 1rem', borderRadius: 12, background: 'rgba(250,173,20,.12)', border: '1px solid rgba(250,173,20,.4)', color: C.ink }}>
                {t('Editing existing agent — save or cancel changes.', 'ஏற்கனவே உள்ள ஏஜெண்டை திருத்துகிறீர்கள் — சேமிக்கவும் அல்லது ரத்துசெய்யவும்.')}
              </div>
            )}
            {error && (
              <div style={{ marginBottom: '1rem', padding: '.8rem 1rem', borderRadius: 12, border: '1px solid rgba(215,64,64,.3)', background: 'rgba(215,64,64,.08)', color: C.red }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: '1rem', padding: '.8rem 1rem', borderRadius: 12, border: '1px solid rgba(62,179,112,.3)', background: 'rgba(62,179,112,.08)', color: C.g700 }}>
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                {labels.username}
                <input name="username" value={formData.username} onChange={handleChange} placeholder={t('Enter booth agent username', 'பூத் ஏஜெண்ட் பயனர்பெயர்')} style={formFieldStyle} required />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                {labels.booth}
                {availableBooths.length > 0 ? (
                  <select name="boothNumber" value={formData.boothNumber} onChange={handleChange} style={{ ...formFieldStyle, cursor: 'pointer' }} required>
                    <option value="">{t('Select booth', 'பூத் தேர்வுசெய்')}</option>
                    {availableBooths.map(booth => (
                      <option key={booth} value={booth}>{t('Booth', 'பூத்')} {booth}</option>
                    ))}
                  </select>
                ) : (
                  <input name="boothNumber" value={formData.boothNumber} onChange={handleChange} placeholder={t('Enter booth number', 'பூத் எண் உள்ளிடவும்')} style={formFieldStyle} required />
                )}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                {labels.phone}
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder={t('10-digit mobile number', '10 இலக்க மொபைல் எண்')} style={formFieldStyle} required />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                  {labels.password}
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t('Secure password', 'பாதுகாப்பான கடவுச்சொல்')} style={formFieldStyle} required />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                  {labels.confirm}
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t('Re-enter password', 'கடவுச்சொல் மீண்டும் உள்ளிடவும்')} style={formFieldStyle} required />
                </label>
              </div>

              {[{
                name: 'youtubeLink', label: labels.youtube, placeholder: t('Paste YouTube link (optional)', 'YouTube இணைப்பு (விருப்பம்)')
              }, {
                name: 'websiteLink', label: labels.website, placeholder: t('Website URL (optional)', 'இணைய முகவரி (விருப்பம்)')
              }].map(field => (
                <label key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {field.label}
                    <span style={{ fontSize: '.7rem', fontWeight: 600, color: C.ink3 }}>{labels.optional}</span>
                  </span>
                  <input name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} style={formFieldStyle} />
                </label>
              ))}

              <label style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 700 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {labels.donation}
                  <span style={{ fontSize: '.7rem', fontWeight: 600, color: C.ink3 }}>{labels.optional}</span>
                </span>
                <input type="number" min="0" step="0.01" name="donationAmount" value={formData.donationAmount} onChange={handleChange} placeholder={t('Pledged amount (if any)', 'நன்கொடை தொகை (இருந்தால்)')} style={formFieldStyle} />
              </label>

              <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: '.8rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, border: 'none', borderRadius: 999, padding: '.9rem 1.2rem', fontSize: '.92rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: loading ? C.g300 : `linear-gradient(120deg, ${C.g500}, ${C.g700})`, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? t('Saving…', 'சேமிக்கிறது…') : labels.save}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ flex: 1, borderRadius: 999, padding: '.9rem 1.2rem', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', border: `1px dashed ${C.ink2}`, color: C.ink2, background: 'transparent' }}>
                    {labels.cancelEdit}
                  </button>
                )}
                <button type="button" onClick={() => navigate('/dashboard')} style={{ flex: 1, borderRadius: 999, padding: '.9rem 1.2rem', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', border: `1px solid ${C.au2}`, color: C.au2, background: 'transparent' }}>
                  {labels.back}
                </button>
              </div>
            </form>
          </div>

          <div style={{ background: C.white, borderRadius: 18, padding: isTablet ? '1.2rem' : '1.6rem', border: `1px solid ${C.line}`, boxShadow: '0 12px 38px rgba(15,42,26,.07)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800, color: C.ink }}>{labels.existing}</h3>
            {boothAgents.length === 0 ? (
              <p style={{ color: C.ink3, textAlign: 'center', padding: '2rem 0' }}>{labels.none}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem', maxHeight: 520, overflowY: 'auto' }}>
                {boothAgents.map(agent => (
                  <div key={agent.id} style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: '1rem 1.1rem', background: C.white }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: C.ink }}>{agent.username}</div>
                        <div style={{ fontSize: '.8rem', color: C.ink3 }}>{t('Booth', 'பூத்')} {agent.boothNumber}</div>
                      </div>
                      <span style={{ padding: '.2rem .75rem', borderRadius: 999, background: 'rgba(62,179,112,.15)', color: C.g700, fontSize: '.72rem', fontWeight: 700 }}>{t('Active', 'செயலில்')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '.6rem', marginTop: '.8rem', fontSize: '.85rem' }}>
                      <div><strong>{t('Phone', 'தொலைபேசி')}:</strong> {agent.phoneNumber}</div>
                      {agent.donationAmount !== null && agent.donationAmount !== undefined && agent.donationAmount !== '' && (
                        <div><strong>{t('Donation', 'நன்கொடை')}:</strong> ₹{Number(agent.donationAmount).toLocaleString()}</div>
                      )}
                      <div><strong>{t('Created', 'உருவாக்கப்பட்டது')}:</strong> {new Date(agent.createdAt).toLocaleDateString()}</div>
                    </div>
                    {(agent.youtubeLink || agent.websiteLink) && (
                      <div style={{ marginTop: '.7rem', display: 'flex', flexDirection: 'column', gap: '.35rem', fontSize: '.82rem' }}>
                        {agent.youtubeLink && (
                          <a href={agent.youtubeLink} target="_blank" rel="noreferrer noopener" style={{ color: C.g600 }}>{t('YouTube', 'YouTube')}: {agent.youtubeLink}</a>
                        )}
                        {agent.websiteLink && (
                          <a href={agent.websiteLink} target="_blank" rel="noreferrer noopener" style={{ color: C.g600 }}>{t('Website', 'இணையதளம்')}: {agent.websiteLink}</a>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '.9rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleEdit(agent)} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '.45rem .9rem', fontSize: '.78rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'transparent', color: C.ink }}>{t('Edit', 'திருத்து')}</button>
                      <button type="button" onClick={() => handleDelete(agent.id)} style={{ border: '1px solid rgba(215,64,64,.4)', borderRadius: 8, padding: '.45rem .9rem', fontSize: '.78rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'rgba(215,64,64,.08)', color: C.red }}>{t('Delete', 'நீக்கு')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
