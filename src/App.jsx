import { Routes, Route } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import Navbar from './components/Navbar'
import Overview  from './pages/Overview'
import History   from './pages/History'
import Caste     from './pages/Caste'
import Strategy  from './pages/Strategy'
import MapPage   from './pages/MapPage'
import Voters    from './pages/Voters'

export default function App() {
  return (
    <LangProvider>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Overview />} />
        <Route path="/history"   element={<History />} />
        <Route path="/caste"     element={<Caste />} />
        <Route path="/strategy"  element={<Strategy />} />
        <Route path="/map"       element={<MapPage />} />
        <Route path="/voters"    element={<Voters />} />
        <Route path="*"          element={<Overview />} />
      </Routes>
    </LangProvider>
  )
}
