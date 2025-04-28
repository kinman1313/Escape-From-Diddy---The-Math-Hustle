// components/EnhancedGameOver.tsx
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import styles from '@/styles/EnhancedGameOver.module.css'

type GameOverProps = {
  score: number;
  highScore: number;
  totalQuestions: number;
  correctAnswers: number;
  onRestart: () => void;
  isNewHighScore?: boolean;
}

export default function EnhancedGameOver({
  score,
  highScore,
  totalQuestions,
  correctAnswers,
  onRestart,
  isNewHighScore = false
}: GameOverProps) {
  const router = useRouter()
  const [showStats, setShowStats] = useState(false)
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  
  // Delayed animation for stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStats(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Calculate player rank based on score and accuracy
  const getPlayerRank = () => {
    if (score > 300 || accuracy >= 90) return { title: "Math Genius", emoji: "🧠", message: "Your math skills are legendary!" }
    if (score > 200 || accuracy >= 75) return { title: "Math Wizard", emoji: "✨", message: "Impressive mathematical prowess!" }
    if (score > 100 || accuracy >= 60) return { title: "Math Apprentice", emoji: "📚", message: "Your math skills are growing stronger!" }
    return { title: "Math Cadet", emoji: "🔢", message: "Keep practicing, you'll escape Diddy next time!" }
  }
  
  const playerRank = getPlayerRank()
  
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  }

  return (
    <div className={styles.container}>
      {/* Main content */}
      <motion.div 
        className={styles.content}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Title area with Diddy caught message */}
        <motion.div 
          className={styles.titleSection}
          variants={itemVariants}
        >
          <motion.div
            className={styles.gameOverEmoji}
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            💥
          </motion.div>
          
          <h1 className={styles.title}>Busted by Diddy!</h1>
          <p className={styles.subtitle}>You couldn't outrun the hustle this time...</p>
        </motion.div>
        
        {/* New high score notification */}
        {isNewHighScore && (
          <motion.div
            className={styles.newHighScore}
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 5 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 10,
              delay: 0.5
            }}
          >
            <span className={styles.trophy}>🏆</span> New High Score!
          </motion.div>
        )}
        
        {/* Player rank */}
        <motion.div 
          className={styles.rankSection}
          variants={itemVariants}
        >
          <div className={styles.rankEmoji}>{playerRank.emoji}</div>
          <h2 className={styles.rankTitle}>{playerRank.title}</h2>
          <p className={styles.rankMessage}>{playerRank.message}</p>
        </motion.div>
        
        {/* Stats section */}
        {showStats && (
          <motion.div 
            className={styles.statsSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={styles.statsTitle}>Your Stats</h3>
            
            <div className={styles.statsGrid}>
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className={styles.statLabel}>Final Score</span>
                <span className={styles.statValue}>{score}</span>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className={styles.statLabel}>High Score</span>
                <span className={styles.statValue}>{highScore}</span>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className={styles.statLabel}>Questions</span>
                <span className={styles.statValue}>{totalQuestions}</span>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className={styles.statLabel}>Correct</span>
                <span className={styles.statValue}>{correctAnswers}</span>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className={styles.statLabel}>Accuracy</span>
                <span className={styles.statValue}>{accuracy}%</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Action buttons */}
        <motion.div 
          className={styles.actionsSection}
          variants={itemVariants}
        >
          <motion.button
            className={styles.restartButton}
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again 🔄
          </motion.button>
          
          <motion.button
            className={styles.leaderboardButton}
            onClick={() => router.push('/leaderboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Leaderboard 📊
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}