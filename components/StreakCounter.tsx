// components/StreakCounter.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/StreakAnimation.module.css'

type StreakCounterProps = {
  streak: number;
  previousStreak?: number;
}

export default function StreakCounter({ streak, previousStreak = 0 }: StreakCounterProps) {
  const [showIncrement, setShowIncrement] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  
  // Check if streak has increased
  useEffect(() => {
    if (streak > previousStreak && streak > 0) {
      setShowIncrement(true)
      setTimeout(() => setShowIncrement(false), 1000)
      
      // Check for milestone
      if (streak === 3 || streak === 5 || streak === 10) {
        setShowMilestone(true)
        setTimeout(() => setShowMilestone(false), 2500)
      }
    }
  }, [streak, previousStreak])
  
  // No need to show if no streak
  if (streak === 0) return null;
  
  // Get milestone message
  const getMilestoneMessage = () => {
    if (streak === 3) return "Math Apprentice! 🧠"
    if (streak === 5) return "Math Wizard! ✨"
    if (streak === 10) return "Math Master! 👑"
    return ""
  }

  return (
    <div className={styles.streakContainer}>
      <div className={`${styles.streakCounter} ${streak >= 3 ? styles.streakActive : ''}`}>
        <motion.span 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 0.5 }}
        >
          🔥
        </motion.span>
        
        <motion.span
          key={streak}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 10 }}
        >
          Streak: {streak}
        </motion.span>
        
        {/* Streak increment animation */}
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
      
      {/* Milestone message */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className={styles.streakMilestone}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {getMilestoneMessage()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}