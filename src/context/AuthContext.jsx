import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'lalgudi:session'

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  isAgent: false,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY)
      if (stored) setUser(JSON.parse(stored))
    } finally {
      setLoading(false)
    }
  }, [])

  const persistSession = (nextUser) => {
    if (nextUser) window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    else window.localStorage.removeItem(SESSION_KEY)
  }

  const login = async (username = '', password = '') => {
    const trimmed = username.trim()
    if (!trimmed || !password) return { success: false, message: 'Enter username and password' }

    const { data, error } = await supabase.rpc('verify_agent_login', {
      p_username: trimmed,
      p_password: password,
    })

    if (error || !data) return { success: false, message: 'Invalid username or password' }

    // For zonal agents, also fetch their assigned wards
    let wards = []
    if (data.role === 'zonal_agent') {
      const { data: wardRows } = await supabase
        .from('agent_ward_assignments')
        .select('ward')
        .eq('agent_id', data.id)
      wards = (wardRows || []).map(r => r.ward)
    }

    const session = { ...data, wards }
    setUser(session)
    persistSession(session)
    return { success: true, role: data.role }
  }

  const logout = () => {
    persistSession(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    isAdmin: user?.role === 'superadmin',
    isAgent: user !== null && user?.role !== 'superadmin',
    loading,
    login,
    logout,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
