import { useState, useMemo, useEffect } from 'react'
import { useAgents, ROLE_SCOPES } from '../hooks/useAgents'
import { fetchScopeRows } from '../lib/supabase'
import { C } from '../data'
import { Footer } from '../components/ui'

const EMPTY_FORM = {
  username: '', full_name: '', phone: '', email: '',
  password: '',
  constituency: '', division: '', ward: '', booth_number: '',
  yt_link: '', website_link: '', donation_amount: '',
  is_active: true,
  role: 'booth_agent',
}

const inputStyle = {
  width: '100%', padding: '8px 11px', borderRadius: 7,
  border: `1px solid ${C.line}`, fontSize: '.85rem',
  fontFamily: "'Outfit',sans-serif", color: C.ink,
  background: C.white, outline: 'none', boxSizing: 'border-box',
}

const Label = ({ children }) => (
  <span style={{
    display: 'block', marginBottom: 4,
    fontSize: '.65rem', fontWeight: 700, letterSpacing: '.07em',
    textTransform: 'uppercase', color: C.ink3,
    fontFamily: "'Outfit',sans-serif",
  }}>{children}</span>
)

export default function AddBoothAgent() {
  const { agents, loading, error, createAgent, updateAgent, toggleActive, deleteAgent } = useAgents()

  const [scopeRows, setScopeRows] = useState([])
  useEffect(() => { fetchScopeRows().then(setScopeRows).catch(() => {}) }, [])

  const [showForm,  setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [formError, setFormError] = useState('')
  const [search,    setSearch]    = useState('')

  // Only booth agents
  const boothAgents = useMemo(() =>
    agents.filter(a => a.role === 'booth_agent'), [agents])

  const displayed = useMemo(() =>
    boothAgents
      .filter(a => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          a.username?.toLowerCase().includes(q) ||
          a.full_name?.toLowerCase().includes(q) ||
          a.booth_number?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => Number(a.booth_number) - Number(b.booth_number)),
  [boothAgents, search])

  // Cascading dropdowns
  const scopeOpts = useMemo(() => {
    const unique  = arr => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)))
    const numSort = arr => [...new Set(arr.filter(Boolean))].sort((a, b) => Number(a) - Number(b))

    return {
      constituencies: unique(scopeRows.map(r => r.constituency)),
      divisions:      unique(scopeRows.map(r => r.division)),
      wards:          unique(scopeRows.map(r => r.ward)),
      booths:         numSort(scopeRows.map(r => r.part)),
    }
  }, [scopeRows, form.constituency, form.division, form.ward])

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      division: 'dummy_division',
      ward: 'dummy_ward',
    });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }
  const openEdit = (a) => {
    setForm({
      username:        a.username,
      full_name:       a.full_name,
      phone:           a.phone          || '',
      email:           a.email          || '',
      password:        '',
      constituency:    '',
      division:        'dummy_division',
      ward:            'dummy_ward',
      booth_number:    a.booth_number   || '',
      yt_link:         a.yt_link        || '',
      website_link:    a.website_link   || '',
      donation_amount: a.donation_amount != null ? String(a.donation_amount) : '',
      is_active:       a.is_active,
      role:            'booth_agent',
    });
    setEditingId(a.id);
    setFormError('');
    setShowForm(true);
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setFormError('') }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm(f => {
      if (name === 'constituency') return { ...f, constituency: val, division: '', ward: '', booth_number: '' }
      if (name === 'division')     return { ...f, division: val, ward: '', booth_number: '' }
      if (name === 'ward')         return { ...f, ward: val, booth_number: '' }
      return { ...f, [name]: val }
    })
  }

  const validate = () => {
    if (!form.username.trim())   return 'Username is required'
    if (!form.full_name.trim())  return 'Full name is required'
    if (!editingId && !form.password.trim()) return 'Password is required'
    // Only require booth_number for booth agent, set dummy division/ward if missing
    if (!form.booth_number.trim()) return 'Booth number is required'
    return null
  }

  const handleSubmit = async () => {
    // Ensure dummy division/ward for booth agent
    let submitForm = { ...form };
    if (!submitForm.division) submitForm.division = 'dummy_division';
    if (!submitForm.ward) submitForm.ward = 'dummy_ward';
    const err = validate();
    if (err) return setFormError(err);
    setSaving(true);
    const result = editingId
      ? await updateAgent(editingId, submitForm)
      : await createAgent(submitForm);
    setSaving(false);
    if (result.success) closeForm();
    else setFormError(result.error);
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteAgent(deleteId)
    setDeleteId(null)
  }

  const td = { padding: '.7rem 1rem', borderBottom: `1px solid ${C.line}`, verticalAlign: 'middle', fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', color: C.ink }
  const th = { padding: '.6rem 1rem', background: C.g900, color: 'rgba(255,255,255,.6)', fontFamily: "'Outfit',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap' }

  return (
    <div style={{ paddingTop: 96, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem', background: C.white,
        borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
            Booth Agents
          </h1>
          <p style={{ margin: '3px 0 0', color: C.ink3, fontSize: '.78rem', fontFamily: "'Outfit',sans-serif" }}>
            {boothAgents.length} agents · {boothAgents.filter(a => a.is_active).length} active
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700,
            letterSpacing: '.05em', textTransform: 'uppercase',
            background: C.g700, color: '#fff',
          }}
        >+ Add Booth Agent</button>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* Search */}
        <input
          placeholder="Search name, username, booth…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320, marginBottom: '1.2rem' }}
        />

        {error && (
          <div style={{ color: C.red, fontSize: '.82rem', marginBottom: '1rem', padding: '8px 12px', background: '#fee2e2', borderRadius: 6, border: `1px solid ${C.red}44`, fontFamily: "'Outfit',sans-serif" }}>
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: 10, background: C.white }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr>
                  {['Username', 'Full Name', 'Phone', 'Booth', 'YouTube', 'Website', 'Donation', 'Status', 'Actions'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...td, textAlign: 'center', color: C.ink4, padding: '3rem' }}>
                      No booth agents found.
                    </td>
                  </tr>
                ) : displayed.map((a, idx) => (
                  <tr key={a.id} style={{ background: idx % 2 ? C.bg : C.white }}>
                    <td style={{ ...td, fontWeight: 700 }}>{a.username}</td>
                    <td style={td}>{a.full_name}</td>
                    <td style={{ ...td, color: C.ink3 }}>{a.phone || '—'}</td>
                    <td style={{ ...td, fontWeight: 800, color: C.g600 }}>{a.booth_number || '—'}</td>
                    <td style={{ ...td }}>
                      {a.yt_link
                        ? <a href={a.yt_link} target="_blank" rel="noreferrer" style={{ color: '#dc2626', fontWeight: 600, fontSize: '.8rem', wordBreak: 'break-all' }}>{a.yt_link}</a>
                        : <span style={{ color: C.ink4 }}>—</span>}
                    </td>
                    <td style={{ ...td }}>
                      {a.website_link
                        ? <a href={a.website_link} target="_blank" rel="noreferrer" style={{ color: C.g600, fontWeight: 600, fontSize: '.8rem', wordBreak: 'break-all' }}>{a.website_link}</a>
                        : <span style={{ color: C.ink4 }}>—</span>}
                    </td>
                    <td style={{ ...td }}>
                      {a.donation_amount != null
                        ? <span style={{ fontWeight: 700, color: C.ink }}>₹{Number(a.donation_amount).toLocaleString()}</span>
                        : <span style={{ color: C.ink4 }}>—</span>}
                    </td>
                    <td style={td}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        fontSize: '.68rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif",
                        background: a.is_active ? C.g100 : '#fee2e2',
                        color: a.is_active ? C.g700 : '#991b1b',
                      }}>{a.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button onClick={() => openEdit(a)} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', fontFamily: "'Outfit',sans-serif" }}>Edit</button>
                        <button onClick={() => toggleActive(a.id, a.is_active)} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif", background: a.is_active ? '#fef3c7' : C.g100, color: a.is_active ? '#92400e' : C.g700 }}>
                          {a.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => setDeleteId(a.id)} style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', fontFamily: "'Outfit',sans-serif" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={closeForm}
        >
          <div
            style={{ background: C.white, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 1.2rem', fontSize: '1.1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {editingId ? 'Edit Booth Agent' : 'Add Booth Agent'}
            </h2>

            {formError && (
              <div style={{ color: C.red, fontSize: '.82rem', marginBottom: '1rem', padding: '8px 12px', background: '#fee2e2', borderRadius: 6, border: `1px solid ${C.red}44`, fontFamily: "'Outfit',sans-serif" }}>
                {formError}
              </div>
            )}

            {/* Basic info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { name: 'username',  label: 'Username *',   placeholder: 'e.g. ravi_booth5' },
                { name: 'full_name', label: 'Full Name *',  placeholder: 'e.g. Ravi Kumar'  },
                { name: 'phone',     label: 'Phone',        placeholder: '9876543210'         },
                { name: 'email',     label: 'Email',        placeholder: 'agent@example.com'  },
              ].map(f => (
                <div key={f.name}>
                  <Label>{f.label}</Label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <Label>{editingId ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder={editingId ? 'Enter new password to change…' : 'Set login password'}
                style={inputStyle} autoComplete="new-password"
              />
            </div>

            {/* Scope */}
            <div style={{ background: C.g050, border: `1px solid ${C.g100}`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: C.g700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
                Assigned Area
              </div>
              <div>
                <Label>Booth Number *</Label>
                <select name="booth_number" value={form.booth_number} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select…</option>
                  {scopeOpts.booths.map(v => <option key={v} value={v}>Booth {v}</option>)}
                </select>
              </div>
            </div>

            {/* Public profile */}
            <div style={{ background: '#f8fafc', border: `1px solid ${C.line}`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: C.ink3, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
                Public Profile (optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>YouTube Link</Label>
                  <input name="yt_link" value={form.yt_link} onChange={handleChange} placeholder="https://youtube.com/@channel" style={inputStyle} />
                </div>
                <div>
                  <Label>Website Link</Label>
                  <input name="website_link" value={form.website_link} onChange={handleChange} placeholder="https://example.com" style={inputStyle} />
                </div>
                <div>
                  <Label>Donation Amount (₹)</Label>
                  <input name="donation_amount" type="number" min="0" value={form.donation_amount} onChange={handleChange} placeholder="0" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Active toggle (edit only) */}
            {editingId && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} style={{ width: 16, height: 16, accentColor: C.g600 }} />
                <span style={{ fontSize: '.85rem', fontWeight: 600, color: C.ink }}>Active</span>
              </label>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={closeForm} style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.white, color: C.ink, border: `1px solid ${C.line}` }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.g700, color: '#fff', opacity: saving ? .7 : 1 }}>
                {saving ? 'Saving…' : editingId ? 'Update Agent' : 'Create Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            style={{ background: C.white, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>⚠</div>
            <h3 style={{ margin: '0 0 .5rem', fontFamily: "'Outfit',sans-serif", color: C.ink }}>Delete this booth agent?</h3>
            <p style={{ color: C.ink3, fontSize: '.88rem', marginBottom: '1.5rem', fontFamily: "'Outfit',sans-serif" }}>
              This cannot be undone. The agent will lose all access immediately.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.white, color: C.ink, border: `1px solid ${C.line}` }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.red, color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
