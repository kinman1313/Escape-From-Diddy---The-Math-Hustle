// components/StreakCounter.tsx
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import styles from '@/styles/StreakAnimation.module.css'

// Custom hook to get window size
function useWindowSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  ])

  useEffect(() => {
    function handleResize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

type StreakCounterProps = {
  streak: number
  previousStreak?: number
}

export default function StreakCounter({ streak, previousStreak = 0 }: StreakCounterProps) {
  const [showIncrement, setShowIncrement] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [fireConfetti, setFireConfetti] = useState(false)
  const [flyDirection, setFlyDirection] = useState<'top' | 'left' | 'right'>('top')
  const [width, height] = useWindowSize()

  const audioRef = useRef<HTMLAudioElement>(null) // 🎵 Audio Ref

  useEffect(() => {
    if (streak > previousStreak && streak > 0) {
      const directions = ['top', 'left', 'right'] as const
      const random = directions[Math.floor(Math.random() * directions.length)]
      setFlyDirection(random)

      // 🎵 Play ditty-party.m4a
      if (audioRef.current) {
        audioRef.current.volume = 0.5
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((e) => console.warn('Audio play prevented', e))
      }

      setShowIncrement(true)
      setTimeout(() => setShowIncrement(false), 1000)

      if (streak === 3 || streak === 5 || streak === 10) {
        setShowMilestone(true)
        setFireConfetti(true)
        setTimeout(() => {
          setShowMilestone(false)
          setFireConfetti(false)
        }, 2500)
      }
    }
  }, [streak, previousStreak])

  const getFlyInitial = () => {
    switch (flyDirection) {
      case 'top':
        return { y: -50, opacity: 0 }
      case 'left':
        return { x: -50, opacity: 0 }
      case 'right':
        return { x: 50, opacity: 0 }
      default:
        return { y: -50, opacity: 0 }
    }
  }

  const getMilestoneMessage = () => {
    if (streak === 3) return 'Math Apprentice! 🧠'
    if (streak === 5) return 'Math Wizard! ✨'
    if (streak === 10) return 'Math Master! 👑'
    return ''
  }

  if (streak === 0) return null

  return (
    <div className={styles.streakContainer}>
      {fireConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}

      {/* 🔥 Hidden Audio */}
      <audio ref={audioRef} src="/sounds/ditty-party.m4a" preload="auto" />

      <div className={`${styles.streakCounter} ${streak >= 3 ? styles.streakActive : ''}`}>
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
          🔥
        </motion.span>

        <AnimatePresence>
          <motion.span
            key={streak}
            initial={getFlyInitial()}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            Streak: {streak}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence>
          {showIncrement && (
            <motion.div
              className={styles.streakIncrement}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1 }}
            >
              +1
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className={styles.streakMilestone}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            {getMilestoneMessage()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
