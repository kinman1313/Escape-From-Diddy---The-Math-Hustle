// components/PowerupEffects.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from '@/styles/PowerupEffects.module.css'

type PowerupType = 'timeFreeze' | 'fiftyFifty' | 'repellent';

type PowerupEffectsProps = {
  activeEffect: PowerupType | null;
  duration?: number;
  onComplete?: () => void;
}

export default function PowerupEffects({ 
  activeEffect, 
  duration = 5000,
  onComplete
}: PowerupEffectsProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isActive, setIsActive] = useState(false)
  
  // Start effect and timer when activeEffect changes
  useEffect(() => {
    if (activeEffect) {
      setIsActive(true)
      setTimeRemaining(duration)
    } else {
      setIsActive(false)
    }
  }, [activeEffect, duration])
  
  // Handle countdown timer
  useEffect(() => {
    if (!isActive || !activeEffect) return
    
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        setIsActive(false)
        if (onComplete) onComplete()
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isActive, activeEffect, duration, onComplete])
  
  // Format time remaining
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }
  
  // No active effect, don't render anything
  if (!activeEffect || !isActive) return null
  
  // Get effect content based on activeEffect
  const getEffectContent = () => {
    switch (activeEffect) {
      case 'timeFreeze':
        return (
          <div className={styles.timeFreezeEffect}>
            <motion.div 
              className={styles.clockIcon}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              ⏱️
            </motion.div>
            <div className={styles.effectLabel}>
              Time Frozen
            </div>
            <div className={styles.countdown}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        )
        
      case 'fiftyFifty':
        return (
          <div className={styles.fiftyFiftyEffect}>
            <motion.div className={styles.effectIcon}>
              <span className={styles.fiftyIcon}>50</span>
              <span className={styles.fiftyDivider}>/</span>
              <span className={styles.fiftyIcon}>50</span>
            </motion.div>
            <div className={styles.effectLabel}>
              Two Wrong Answers Eliminated
            </div>
          </div>
        )
        
      case 'repellent':
        return (
          <div className={styles.repellentEffect}>
            <motion.div 
              className={styles.shieldIcon}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: 2 }}
            >
              🛡️
            </motion.div>
            <div className={styles.effectLabel}>
              Diddy Repelled!
            </div>
            <motion.div
              className={styles.diddyRunning}
              initial={{ x: 0 }}
              animate={{ x: -200 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              🏃
            </motion.div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  // Progress bar percentage
  const progressPercent = (timeRemaining / duration) * 100
  
  return (
    <AnimatePresence>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Main effect content */}
        {getEffectContent()}
        
        {/* Progress bar for timed effects */}
        {activeEffect === 'timeFreeze' && (
          <div className={styles.progressContainer}>
            <motion.div 
              className={styles.progressBar}
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}