import { useState, useMemo, useEffect } from 'react'
import { useAgents, ROLE_SCOPES, ROLE_LABELS } from '../hooks/useAgents'
import { fetchScopeRows } from '../lib/supabase'
import { C } from '../data'
import { Footer } from '../components/ui'

const EMPTY_FORM = {
  username: '', full_name: '', phone: '', email: '',
  password: '',
  role: 'booth_agent',
  constituency: '', division: '', ward: '', booth_number: '',
  assigned_wards: [],
  yt_link: '', website_link: '', donation_amount: '',
  is_active: true,
}

const ROLE_COLORS = {
  superadmin:  { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  zonal_agent: { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  ward_agent:  { bg: C.g100,   color: C.g700,    border: C.g300   },
  booth_agent: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
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

export default function Agents() {
  const { agents, loading, error, createAgent, updateAgent, toggleActive, deleteAgent } = useAgents()

  const [scopeRows, setScopeRows] = useState([])
  useEffect(() => { fetchScopeRows().then(setScopeRows).catch(() => {}) }, [])

  const [showForm,   setShowForm]   = useState(false)
  const [editingId,  setEditingId]  = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [formError,  setFormError]  = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [search,     setSearch]     = useState('')

  // Cascading dropdown options
  const scopeOpts = useMemo(() => {
    const unique  = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)))
    const numSort = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => Number(a) - Number(b))

    const constituencies = unique(scopeRows.map(r => r.constituency))

    const divRows = form.constituency
      ? scopeRows.filter(r => r.constituency === form.constituency)
      : scopeRows
    const divisions = unique(divRows.map(r => r.division))

    const wardRows = form.division
      ? divRows.filter(r => r.division === form.division)
      : divRows
    const wards = unique(wardRows.map(r => r.ward))

    const boothRows = form.ward
      ? wardRows.filter(r => r.ward === form.ward)
      : wardRows
    const booths = numSort(boothRows.map(r => r.part))

    return { constituencies, divisions, wards, booths }
  }, [scopeRows, form.constituency, form.division, form.ward])

  const displayed = useMemo(() => agents.filter(a => {
    if (roleFilter && a.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        a.username?.toLowerCase().includes(q) ||
        a.full_name?.toLowerCase().includes(q) ||
        a.booth_number?.toLowerCase().includes(q) ||
        a.ward?.toLowerCase().includes(q)
      )
    }
    return true
  }), [agents, roleFilter, search])

  const stats = useMemo(() => ({
    total:       agents.length,
    active:      agents.filter(a => a.is_active).length,
    superadmin:  agents.filter(a => a.role === 'superadmin').length,
    zonal_agent: agents.filter(a => a.role === 'zonal_agent').length,
    ward_agent:  agents.filter(a => a.role === 'ward_agent').length,
    booth_agent: agents.filter(a => a.role === 'booth_agent').length,
  }), [agents])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (a) => {
    setForm({
      username:        a.username,
      full_name:       a.full_name,
      phone:           a.phone          || '',
      email:           a.email          || '',
      password:        '',
      role:            a.role,
      constituency:    a.constituency   || '',
      division:        a.division       || '',
      ward:            a.ward           || '',
      booth_number:    a.booth_number   || '',
      assigned_wards:  (a.agent_ward_assignments || []).map(r => r.ward),
      yt_link:         a.yt_link        || '',
      website_link:    a.website_link   || '',
      donation_amount: a.donation_amount != null ? String(a.donation_amount) : '',
      is_active:       a.is_active,
    })
    setEditingId(a.id)
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm(f => {
      if (name === 'role')         return { ...EMPTY_FORM, role: val }
      if (name === 'constituency') return { ...f, constituency: val, division: '', ward: '', booth_number: '', assigned_wards: [] }
      if (name === 'division')     return { ...f, division: val, ward: '', booth_number: '', assigned_wards: [] }
      if (name === 'ward')         return { ...f, ward: val, booth_number: '' }
      return { ...f, [name]: val }
    })
  }

  const toggleAssignedWard = (ward) => {
    setForm(f => {
      const exists = f.assigned_wards.includes(ward)
      return {
        ...f,
        assigned_wards: exists
          ? f.assigned_wards.filter(w => w !== ward)
          : [...f.assigned_wards, ward],
      }
    })
  }

  const validate = () => {
    if (!form.username.trim())  return 'Username is required'
    if (!form.full_name.trim()) return 'Full name is required'
    if (form.role === 'booth_agent' && !editingId && !form.password.trim())
      return 'Password is required for booth agents'
    const scopes = ROLE_SCOPES[form.role] || []
    if (scopes.includes('constituency') && !form.constituency.trim()) return 'Constituency is required'
    if (scopes.includes('division')     && !form.division.trim())     return 'Division is required'
    if (form.role === 'zonal_agent' && form.assigned_wards.length === 0)
      return 'Select at least one ward for zonal agent'
    if (scopes.includes('ward') && form.role !== 'zonal_agent' && !form.ward.trim())
      return 'Ward is required'
    if (scopes.includes('booth_number') && !form.booth_number.trim()) return 'Booth number is required'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) return setFormError(err)
    setSaving(true)
    const result = editingId
      ? await updateAgent(editingId, form)
      : await createAgent(form)
    setSaving(false)
    if (result.success) closeForm()
    else setFormError(result.error)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteAgent(deleteId)
    setDeleteId(null)
  }

  const scopeFields = ROLE_SCOPES[form.role] || []

  const th = {
    padding: '.6rem 1rem', background: C.g900, color: 'rgba(255,255,255,.6)',
    fontFamily: "'Outfit',sans-serif", fontSize: '.58rem', fontWeight: 700,
    letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap',
  }
  const td = {
    padding: '.7rem 1rem', borderBottom: `1px solid ${C.line}`,
    verticalAlign: 'middle', fontFamily: "'Outfit',sans-serif", fontSize: '.82rem', color: C.ink,
  }

  return (
    <div style={{ paddingTop: 96, background: C.bg, minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        padding: '1rem 1.5rem', background: C.white,
        borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
            Agent Hierarchy
          </h1>
          <p style={{ margin: '3px 0 0', color: C.ink3, fontSize: '.78rem', fontFamily: "'Outfit',sans-serif" }}>
            Super Admin → Zonal → Ward → Booth
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
        >
          + Add Agent
        </button>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',      value: stats.total,       bg: C.line2,               color: C.ink  },
            { label: 'Active',     value: stats.active,      bg: C.g100,                color: C.g700 },
            { label: 'Super Admin',value: stats.superadmin,  ...ROLE_COLORS.superadmin  },
            { label: 'Zonal',      value: stats.zonal_agent, ...ROLE_COLORS.zonal_agent },
            { label: 'Ward',       value: stats.ward_agent,  ...ROLE_COLORS.ward_agent  },
            { label: 'Booth',      value: stats.booth_agent, ...ROLE_COLORS.booth_agent },
          ].map(({ label, value, bg, color, border }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border || C.line}`,
              borderRadius: 10, padding: '10px 20px', minWidth: 80,
            }}>
              <div style={{ fontSize: '.62rem', color, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: "'Outfit',sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Search name, username, booth, ward…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, maxWidth: 320 }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ ...inputStyle, maxWidth: 200, cursor: 'pointer' }}
          >
            <option value="">All roles</option>
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ color: C.red, fontSize: '.82rem', marginBottom: '1rem', padding: '8px 12px', background: '#fee2e2', borderRadius: 6, border: `1px solid ${C.red}44`, fontFamily: "'Outfit',sans-serif" }}>
            {error}
          </div>
        )}

        {/* Multiple tables for each role */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: C.ink3, fontFamily: "'Outfit',sans-serif" }}>
            Loading agents…
          </div>
        ) : (
          Object.keys(ROLE_LABELS).map(roleKey => {
            const roleAgents = displayed.filter(a => a.role === roleKey)
            if (roleAgents.length === 0) return null
            // Table headers per role
            let headers = ['Role', 'Username', 'Full Name', 'Phone']
            if (roleKey !== 'booth_agent') headers.push('Division')
            if (roleKey !== 'booth_agent') headers.push('Assigned Area')
            if (roleKey === 'booth_agent') headers.push('Booth Number')
            headers.push('Links', 'Status', 'Actions')
            return (
              <div key={roleKey} style={{ marginBottom: '2.5rem', overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: 10, background: C.white }}>
                <div style={{ padding: '1rem 1.5rem', fontWeight: 700, fontSize: '1.1rem', color: (ROLE_COLORS[roleKey]||{}).color || C.ink, fontFamily: "'Outfit',sans-serif" }}>
                  {ROLE_LABELS[roleKey]}s
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                  <thead>
                    <tr>
                      {headers.map(h => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleAgents.length === 0 ? (
                      <tr>
                        <td colSpan={headers.length} style={{ ...td, textAlign: 'center', color: C.ink4, padding: '3rem' }}>
                          No agents found.
                        </td>
                      </tr>
                    ) : roleAgents.map((a, idx) => {
                      const rc = ROLE_COLORS[a.role] || {}
                      const wardDisplay = a.role === 'zonal_agent'
                        ? (a.agent_ward_assignments || []).map(r => r.ward).join(', ') || '—'
                        : (a.ward || '—')
                      return (
                        <tr key={a.id} style={{ background: idx % 2 ? C.bg : C.white }}>
                          <td style={td}>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                              fontSize: '.68rem', fontWeight: 700,
                              background: rc.bg, color: rc.color,
                              fontFamily: "'Outfit',sans-serif",
                            }}>{ROLE_LABELS[a.role]}</span>
                          </td>
                          <td style={{ ...td, fontWeight: 700 }}>{a.username}</td>
                          <td style={td}>{a.full_name}</td>
                          <td style={{ ...td, color: C.ink3 }}>{a.phone || '—'}</td>
                          {roleKey !== 'booth_agent' && (
                            <td style={{ ...td, fontSize: '.75rem', color: C.ink3 }}>{a.division || '—'}</td>
                          )}
                          {roleKey !== 'booth_agent' && (
                            <td style={{ ...td, fontSize: '.75rem', color: C.ink3, maxWidth: 180 }}>{wardDisplay}</td>
                          )}
                          {roleKey === 'booth_agent' && (
                            <td style={{ ...td, fontWeight: 800, color: C.g600 }}>{a.booth_number || '—'}</td>
                          )}
                          <td style={{ ...td, fontSize: '.72rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {a.yt_link       && <a href={a.yt_link}      target="_blank" rel="noreferrer" style={{ color: '#dc2626' }}>YT</a>}
                              {a.website_link  && <a href={a.website_link} target="_blank" rel="noreferrer" style={{ color: C.g600 }}>Web</a>}
                              {a.donation_amount != null && <span style={{ color: C.ink3 }}>₹{a.donation_amount}</span>}
                              {!a.yt_link && !a.website_link && a.donation_amount == null && '—'}
                            </div>
                          </td>
                          <td style={td}>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                              fontSize: '.68rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif",
                              background: a.is_active ? C.g100 : '#fee2e2',
                              color: a.is_active ? C.g700 : '#991b1b',
                            }}>
                              {a.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={td}>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <button
                                onClick={() => openEdit(a)}
                                style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', fontFamily: "'Outfit',sans-serif" }}
                              >Edit</button>
                              <button
                                onClick={() => toggleActive(a.id, a.is_active)}
                                style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif", background: a.is_active ? '#fef3c7' : C.g100, color: a.is_active ? '#92400e' : C.g700 }}
                              >{a.is_active ? 'Deactivate' : 'Activate'}</button>
                              <button
                                onClick={() => setDeleteId(a.id)}
                                style={{ padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', fontFamily: "'Outfit',sans-serif" }}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={closeForm}
        >
          <div
            style={{ background: C.white, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 .3rem', fontSize: '1.1rem', fontWeight: 800, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
              {editingId ? 'Edit Agent' : 'Add Agent'}
            </h2>
            <p style={{ margin: '0 0 1.4rem', color: C.ink3, fontSize: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
              Scope fields update based on the role selected.
            </p>

            {formError && (
              <div style={{ color: C.red, fontSize: '.82rem', marginBottom: '1rem', padding: '8px 12px', background: '#fee2e2', borderRadius: 6, border: `1px solid ${C.red}44`, fontFamily: "'Outfit',sans-serif" }}>
                {formError}
              </div>
            )}

            {/* Role selector */}
            <div style={{ marginBottom: '1.4rem' }}>
              <Label>Role *</Label>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                {Object.entries(ROLE_LABELS).map(([val, label]) => {
                  const rc = ROLE_COLORS[val]
                  const active = form.role === val
                  return (
                    <label
                      key={val}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${active ? rc.color : C.line}`,
                        background: active ? rc.bg : C.white,
                        fontSize: '.8rem', fontWeight: 700,
                        color: active ? rc.color : C.ink3,
                        fontFamily: "'Outfit',sans-serif",
                        transition: 'all .12s',
                      }}
                    >
                      <input type="radio" name="role" value={val} checked={active} onChange={handleChange} style={{ display: 'none' }} />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Base fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { name: 'username',  label: 'Username *',  placeholder: 'e.g. ravi_booth5'  },
                { name: 'full_name', label: 'Full Name *', placeholder: 'e.g. Ravi Kumar'    },
                { name: 'phone',     label: 'Phone',       placeholder: '9876543210'          },
                { name: 'email',     label: 'Email',       placeholder: 'agent@example.com'   },
              ].map(f => (
                <div key={f.name}>
                  <Label>{f.label}</Label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
            </div>

            {/* Password — booth agents only */}
            {form.role === 'booth_agent' && (
              <div style={{ marginBottom: '1rem' }}>
                <Label>{editingId ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={editingId ? 'Enter new password to change…' : 'Set login password'}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Scope fields */}
            {scopeFields.length > 0 && (
              <div style={{ background: C.g050, border: `1px solid ${C.g100}`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, color: C.g700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
                  Scope — what this agent can access
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                  {scopeFields.includes('constituency') && (
                    <div>
                      <Label>Constituency *</Label>
                      <select name="constituency" value={form.constituency} onChange={handleChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select constituency…</option>
                        {scopeOpts.constituencies.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  {scopeFields.includes('division') && (
                    <div>
                      <Label>Division *</Label>
                      <select name="division" value={form.division} onChange={handleChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        disabled={!form.constituency}>
                        <option value="">Select division…</option>
                        {scopeOpts.divisions.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Zonal agent: multi-ward checkboxes */}
                  {form.role === 'zonal_agent' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Label>Wards Allotted * (select all that apply)</Label>
                      {!form.division ? (
                        <p style={{ fontSize: '.78rem', color: C.ink3, margin: 0, fontFamily: "'Outfit',sans-serif" }}>
                          Select division first to see wards.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: 4 }}>
                          {scopeOpts.wards.map(ward => {
                            const checked = form.assigned_wards.includes(ward)
                            return (
                              <label
                                key={ward}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
                                  border: `1.5px solid ${checked ? C.g600 : C.line}`,
                                  background: checked ? C.g100 : C.white,
                                  fontSize: '.8rem', fontWeight: checked ? 700 : 400,
                                  color: checked ? C.g700 : C.ink,
                                  fontFamily: "'Outfit',sans-serif",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleAssignedWard(ward)}
                                  style={{ accentColor: C.g600 }}
                                />
                                {ward}
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ward agent: single ward dropdown */}
                  {scopeFields.includes('ward') && form.role !== 'zonal_agent' && (
                    <div>
                      <Label>Ward *</Label>
                      <select name="ward" value={form.ward} onChange={handleChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        disabled={!form.division}>
                        <option value="">Select ward…</option>
                        {scopeOpts.wards.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  {scopeFields.includes('booth_number') && (
                    <div>
                      <Label>Booth Number *</Label>
                      <select name="booth_number" value={form.booth_number} onChange={handleChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        disabled={!form.ward}>
                        <option value="">Select booth…</option>
                        {scopeOpts.booths.map(v => <option key={v} value={v}>Booth {v}</option>)}
                      </select>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Profile / public details (all roles except superadmin) */}
            {form.role !== 'superadmin' && (
              <div style={{ background: '#f8fafc', border: `1px solid ${C.line}`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, color: C.ink3, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.8rem', fontFamily: "'Outfit',sans-serif" }}>
                  Public Profile Details (optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <Label>YouTube Link</Label>
                    <input name="yt_link" value={form.yt_link} onChange={handleChange}
                      placeholder="https://youtube.com/@channel"
                      style={inputStyle} />
                  </div>
                  <div>
                    <Label>Website Link</Label>
                    <input name="website_link" value={form.website_link} onChange={handleChange}
                      placeholder="https://example.com"
                      style={inputStyle} />
                  </div>
                  <div>
                    <Label>Donation Amount (₹)</Label>
                    <input name="donation_amount" type="number" min="0" value={form.donation_amount}
                      onChange={handleChange}
                      placeholder="0"
                      style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* Active toggle (edit only) */}
            {editingId && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.4rem', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} style={{ width: 16, height: 16, accentColor: C.g600 }} />
                <span style={{ fontSize: '.85rem', fontWeight: 600, color: C.ink }}>Active</span>
              </label>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeForm}
                style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.white, color: C.ink, border: `1px solid ${C.line}` }}
              >Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: '.78rem', fontWeight: 700, background: C.g700, color: '#fff', opacity: saving ? .7 : 1 }}
              >{saving ? 'Saving…' : editingId ? 'Update Agent' : 'Create Agent'}</button>
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
            <h3 style={{ margin: '0 0 .5rem', fontFamily: "'Outfit',sans-serif", color: C.ink }}>Delete this agent?</h3>
            <p style={{ color: C.ink3, fontSize: '.88rem', marginBottom: '1.5rem', fontFamily: "'Outfit',sans-serif" }}>
              This cannot be undone. All access for this agent will be removed immediately.
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
