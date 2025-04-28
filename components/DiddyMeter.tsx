// components/DiddyMeter.tsx
import React, { useEffect, useState } from 'react'
import styles from '@/styles/DiddyMeter.module.css'
import { motion } from 'framer-motion'

type DiddyMeterProps = {
  level: number;
  maxLevel?: number;
}

export default function DiddyMeter({ level, maxLevel = 5 }: DiddyMeterProps) {
  // Clamp level between 0 and maxLevel
  const clampedLevel = Math.min(Math.max(level, 0), maxLevel)
  const percent = (clampedLevel / maxLevel) * 100
  
  // Determine warning message based on level
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  
  useEffect(() => {
    // Set warning message based on proximity level
    if (clampedLevel < 2) {
      setWarningMessage(null)
    } else if (clampedLevel < 4) {
      setWarningMessage(clampedLevel === 3 ? "Diddy's getting closer!" : null)
    } else {
      setWarningMessage(clampedLevel >= maxLevel ? "Diddy's HERE. Time's up!" : "Diddy's almost here!")
    }
  }, [clampedLevel, maxLevel])

  // Determine meter fill class based on level
  const getFillClass = () => {
    if (clampedLevel < 2) return styles.safe;
    if (clampedLevel < 4) return styles.warning;
    return styles.danger;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <span>Diddy Proximity</span>
        <motion.span 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={styles.labelIcon}
        >
          🏃
        </motion.span>
      </div>
      
      <div className={styles.meterContainer}>
        <motion.div
          className={`${styles.meterFill} ${getFillClass()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {warningMessage && (
        <motion.div 
          className={styles.warningMessage}
          animate={{ opacity: [0.7, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
        >
          {warningMessage}
        </motion.div>
      )}
    </div>
  )
}