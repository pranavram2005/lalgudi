import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const ROLE_SCOPES = {
  superadmin:  [],
  zonal_agent: ['constituency', 'division'],
  ward_agent:  ['constituency', 'division', 'ward'],
  booth_agent: ['constituency', 'division', 'ward', 'booth_number'],
}

export const ROLE_LABELS = {
  superadmin:  'Super Admin',
  zonal_agent: 'Zonal Agent',
  ward_agent:  'Ward Agent',
  booth_agent: 'Booth Agent',
}

export function useAgents() {
  const [agents,  setAgents]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetchAgents = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('agents')
      .select(`
        id, username, full_name, phone, email,
        role, constituency, division, ward, booth_number,
        yt_link, website_link, donation_amount,
        is_active, created_at,
        created_by (id, full_name, role),
        agent_ward_assignments (ward, division, constituency)
      `)
      .order('role')
      .order('constituency')
      .order('booth_number')

    if (filters.role)         query = query.eq('role', filters.role)
    if (filters.constituency) query = query.eq('constituency', filters.constituency)
    if (filters.division)     query = query.eq('division', filters.division)
    if (filters.ward)         query = query.eq('ward', filters.ward)
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
    if (filters.search) {
      query = query.or(
        `username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else       setAgents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  const createAgent = useCallback(async (formData) => {
    setError(null)
    const scopes = ROLE_SCOPES[formData.role] || []

    const payload = {
      username:        formData.username.trim(),
      full_name:       formData.full_name.trim(),
      phone:           formData.phone         || null,
      email:           formData.email         || null,
      role:            formData.role,
      is_active:       true,
      constituency:    scopes.includes('constituency') ? formData.constituency : null,
      division:        scopes.includes('division')     ? formData.division     : null,
      ward:            scopes.includes('ward')         ? formData.ward         : null,
      booth_number:    scopes.includes('booth_number') ? formData.booth_number : null,
      yt_link:         formData.yt_link         || null,
      website_link:    formData.website_link    || null,
      donation_amount: formData.donation_amount ? Number(formData.donation_amount) : null,
      // password_hash set to plaintext; trigger hashes it automatically
      ...(formData.role === 'booth_agent' && formData.password
        ? { password_hash: formData.password }
        : {}),
    }

    const { data, error } = await supabase
      .from('agents')
      .insert(payload)
      .select('id, username, full_name, phone, email, role, constituency, division, ward, booth_number, yt_link, website_link, donation_amount, is_active, created_at')
      .single()

    if (error) { setError(error.message); return { success: false, error: error.message } }

    // For zonal agents, save ward assignments
    if (formData.role === 'zonal_agent' && formData.assigned_wards?.length > 0) {
      const wardRows = formData.assigned_wards.map(ward => ({
        agent_id:     data.id,
        ward,
        division:     formData.division,
        constituency: formData.constituency,
      }))
      const { error: wardError } = await supabase.from('agent_ward_assignments').insert(wardRows)
      if (wardError) { setError(wardError.message); return { success: false, error: wardError.message } }
    }

    const assignedWards = formData.assigned_wards?.map(w => ({ ward: w })) || []
    setAgents(prev => [...prev, { ...data, agent_ward_assignments: assignedWards }])
    return { success: true, data }
  }, [])

  const updateAgent = useCallback(async (id, formData) => {
    setError(null)
    const scopes = ROLE_SCOPES[formData.role] || []

    const payload = {
      username:        formData.username.trim(),
      full_name:       formData.full_name.trim(),
      phone:           formData.phone         || null,
      email:           formData.email         || null,
      role:            formData.role,
      is_active:       formData.is_active,
      constituency:    scopes.includes('constituency') ? formData.constituency : null,
      division:        scopes.includes('division')     ? formData.division     : null,
      ward:            scopes.includes('ward')         ? formData.ward         : null,
      booth_number:    scopes.includes('booth_number') ? formData.booth_number : null,
      yt_link:         formData.yt_link         || null,
      website_link:    formData.website_link    || null,
      donation_amount: formData.donation_amount ? Number(formData.donation_amount) : null,
      // Only update password if a new one was entered
      ...(formData.role === 'booth_agent' && formData.password
        ? { password_hash: formData.password }
        : {}),
    }

    const { data, error } = await supabase
      .from('agents')
      .update(payload)
      .eq('id', id)
      .select('id, username, full_name, phone, email, role, constituency, division, ward, booth_number, yt_link, website_link, donation_amount, is_active, created_at')
      .single()

    if (error) { setError(error.message); return { success: false, error: error.message } }

    // For zonal agents, replace ward assignments
    if (formData.role === 'zonal_agent') {
      await supabase.from('agent_ward_assignments').delete().eq('agent_id', id)
      if (formData.assigned_wards?.length > 0) {
        const wardRows = formData.assigned_wards.map(ward => ({
          agent_id:     id,
          ward,
          division:     formData.division,
          constituency: formData.constituency,
        }))
        const { error: wardError } = await supabase.from('agent_ward_assignments').insert(wardRows)
        if (wardError) { setError(wardError.message); return { success: false, error: wardError.message } }
      }
    }

    const assignedWards = formData.assigned_wards?.map(w => ({ ward: w })) || []
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...data, agent_ward_assignments: assignedWards } : a
    ))
    return { success: true, data }
  }, [])

  const toggleActive = useCallback(async (id, current) => {
    const { error } = await supabase
      .from('agents').update({ is_active: !current }).eq('id', id)
    if (!error)
      setAgents(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }, [])

  const deleteAgent = useCallback(async (id) => {
    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) { setError(error.message); return { success: false } }
    setAgents(prev => prev.filter(a => a.id !== id))
    return { success: true }
  }, [])

  return { agents, loading, error, fetchAgents, createAgent, updateAgent, toggleActive, deleteAgent }
}
