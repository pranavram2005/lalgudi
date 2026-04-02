import { useEffect, useState } from 'react'
import { fetchBoothStats } from '../lib/fetchBoothStats'

export default function BoothDropdown({ onSelect }) {
  const [booths, setBooths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoothStats({})
      .then(data => {
        // Get unique booth numbers
        const boothNumbers = Array.from(new Set(data.map(row => row.part))).sort()
        setBooths(boothNumbers)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <span>Loading booths...</span>

  return (
    <select onChange={e => onSelect(e.target.value)} style={{ minWidth: 120, padding: 6, borderRadius: 6 }}>
      <option value="">All Booths</option>
      {booths.map(num => (
        <option key={num} value={num}>{num}</option>
      ))}
    </select>
  )
}
