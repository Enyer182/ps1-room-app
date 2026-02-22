import { useEffect, useState } from 'react'

export function useStartupProgress(durationMs = 1700) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let raf = 0
    const startTime = performance.now()

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const value = Math.min(100, Math.floor((elapsed / durationMs) * 100))
      setProgress(value)
      if (value >= 100) {
        setReady(true)
        return
      }
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(raf)
    }
  }, [durationMs])

  return { progress, ready }
}
