import { useEffect, useState } from 'react'

const FALLBACK_WIDTH = 1280

const getViewportWidth = () => {
  if (typeof window === 'undefined') return FALLBACK_WIDTH
  return window.innerWidth
}

export function useBreakpoint() {
  const [width, setWidth] = useState(getViewportWidth)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    width,
    isMobile: width <= 640,
    isTablet: width <= 1024,
  }
}
