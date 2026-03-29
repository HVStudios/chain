import { useState, useEffect, useRef } from 'react'

/** Animates a number from 0 → target when the component mounts or target changes. */
export function useCountUp(target: number, duration = 700): number {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const startVal = 0

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + eased * (target - startVal)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}
