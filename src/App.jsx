import { Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import Navbar from './components/Navbar'
import Overview  from './pages/Overview'
import Dashboard from './pages/Dashboard'
import History   from './pages/History'
import Caste     from './pages/Caste'
import Strategy  from './pages/Strategy'
import MapPage   from './pages/MapPage'
import Voters    from './pages/Voters'
import Login     from './pages/Login'
import AddBoothAgent from './pages/AddBoothAgent'
import AdminProgress from './pages/AdminProgress'
import AdminAgentDetail from './pages/AdminAgentDetail'
import Agents from './pages/Agents'
import { useAuth } from './context/AuthContext'

const ALL_ROLES = ['superadmin', 'zonal_agent', 'ward_agent', 'booth_agent']
const ADMIN_ONLY = ['superadmin']

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'superadmin' ? '/' : '/dashboard'
    return <Navigate to={fallback} replace />
  }
  return children
}

export default function App() {
  const { user, isAdmin, loading } = useAuth()
  const homePath = isAdmin ? '/' : '/dashboard'

  return (
    <LangProvider>
      {!loading && <Navbar />}
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d6654', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>
          Loading…
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute roles={ALL_ROLES}><Overview /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={ALL_ROLES}><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute roles={ALL_ROLES}><History /></ProtectedRoute>} />
          <Route path="/caste" element={<ProtectedRoute roles={ALL_ROLES}><Caste /></ProtectedRoute>} />
          <Route path="/strategy" element={<ProtectedRoute roles={ALL_ROLES}><Strategy /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute roles={ALL_ROLES}><MapPage /></ProtectedRoute>} />
          <Route path="/voters" element={<ProtectedRoute roles={ALL_ROLES}><Voters /></ProtectedRoute>} />
          <Route path="/admin/booth-agent" element={<ProtectedRoute roles={ADMIN_ONLY}><AddBoothAgent /></ProtectedRoute>} />
          <Route path="/admin/progress" element={<ProtectedRoute roles={ADMIN_ONLY}><AdminProgress /></ProtectedRoute>} />
          <Route path="/admin/agents/:agentId" element={<ProtectedRoute roles={ADMIN_ONLY}><AdminAgentDetail /></ProtectedRoute>} />
          <Route path="/admin/agents" element={<ProtectedRoute roles={ADMIN_ONLY}><Agents /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? homePath : '/login'} replace />} />
        </Routes>
      )}
    </LangProvider>
  )
}
