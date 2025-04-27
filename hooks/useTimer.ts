// hooks/useTimer.ts
import { useEffect, useState } from 'react'

export default function useTimer(duration: number, onExpire: () => void, isActive: boolean) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (!isActive) return
    setTimeLeft(duration)
  }, [duration, isActive])

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isActive, onExpire])

  return timeLeft
}
