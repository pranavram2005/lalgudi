import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SESSION_KEY = 'lalgudi:session'
const LEGACY_ADMIN_KEY = 'lalgudi:isAdmin'
const AGENT_STORE_KEY = 'boothAgents'

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  isAgent: false,
  loading: true,
  login: () => ({ success: false }),
  logout: () => {},
})

const readStoredAgents = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(AGENT_STORE_KEY) || '[]')
  } catch (err) {
    return []
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const stored = window.localStorage.getItem(SESSION_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
        return
      }
      const legacyAdmin = window.localStorage.getItem(LEGACY_ADMIN_KEY)
      if (legacyAdmin === 'true') {
        const adminSession = { role: 'admin', username: 'admin' }
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(adminSession))
        window.localStorage.removeItem(LEGACY_ADMIN_KEY)
        setUser(adminSession)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const persistSession = (nextUser) => {
    if (typeof window !== 'undefined') {
      if (nextUser) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
      } else {
        window.localStorage.removeItem(SESSION_KEY)
      }
    }
  }

  const login = (username = '', password = '') => {
    const trimmedUsername = username.trim()
    if (!trimmedUsername || !password) {
      return { success: false, message: 'Invalid credentials' }
    }

    if (trimmedUsername === 'admin' && password === 'admin123') {
      const adminSession = { role: 'admin', username: 'admin' }
      setUser(adminSession)
      persistSession(adminSession)
      return { success: true, role: 'admin' }
    }

    const agents = readStoredAgents()
    const match = agents.find(agent => (
      agent?.username === trimmedUsername &&
      agent?.password === password &&
      agent?.isActive !== false
    ))

    if (match) {
      const agentSession = {
        role: 'agent',
        username: match.username,
        boothNumber: match.boothNumber,
      }
      setUser(agentSession)
      persistSession(agentSession)
      return { success: true, role: 'agent' }
    }

    return { success: false, message: 'Invalid credentials' }
  }

  const logout = () => {
    persistSession(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LEGACY_ADMIN_KEY)
    }
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    loading,
    login,
    logout,
  }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
