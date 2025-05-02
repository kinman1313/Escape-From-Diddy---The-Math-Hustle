// components/EnhancedGameOver.tsx
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from '@react-hook/window-size'
import { useState, useEffect } from 'react'
import { playSound } from '@/lib/soundManager'
import Link from 'next/link'

// Import styles or define them inline
// import styles from '@/styles/EnhancedGameOver.module.css'

type GameStats = {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

type EnhancedGameOverProps = {
  show: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
  onViewLeaderboard?: () => void;
  stats?: GameStats;
  userName?: string;
}

export default function EnhancedGameOver({ 
  show, 
  score, 
  highScore, 
  onRestart,
  onViewLeaderboard,
  stats,
  userName = ''
}: EnhancedGameOverProps) {
  const isNewHighScore = score > highScore
  const [width, height] = useWindowSize()
  const [showDetails, setShowDetails] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  
  // Sound effects
  useEffect(() => {
    if (show) {
      // Play appropriate sound when the game over screen is shown
      if (isNewHighScore) {
        playSound('reward', 'diddy-party')
      } else {
        playSound('timeout', 'wrong')
      }
    }
  }, [show, isNewHighScore])
  
  // Toggle details view
  const handleToggleDetails = () => {
    playSound('click')
    setShowDetails(!showDetails)
  }
  
  // Handle restart with sound
  const handleRestart = () => {
    playSound('click')
    onRestart()
  }
  
  // Handle view leaderboard with sound
  const handleViewLeaderboard = () => {
    playSound('click')
    if (onViewLeaderboard) {
      onViewLeaderboard()
    }
  }
  
  // Prepare share text
  const shareText = encodeURIComponent(`I just scored ${score} points in Escape From Diddy! 🧠🔥 Can you beat me?`)
  const shareUrl = encodeURIComponent('https://diddysgonemath.com')
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareUrl}`
  
  // Handle share actions with sound
  const handleShare = (platform: string) => {
    playSound('click')
    try {
      window.open(
        platform === 'twitter' 
          ? twitterUrl 
          : platform === 'facebook'
            ? facebookUrl
            : whatsappUrl, 
        '_blank', 
        'noopener,noreferrer'
      )
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
      // Show a fallback option or error message
    }
  }
  
  // Handle copy to clipboard with sound
  const handleCopyToClipboard = () => {
    playSound('click')
    const textToCopy = `I just scored ${score} points in Escape From Diddy! 🧠🔥 Can you beat me? https://diddysgonemath.com`
    
    try {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopiedToClipboard(true)
          setTimeout(() => setCopiedToClipboard(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy text:', err)
        })
    } catch (error) {
      console.error('Clipboard API not available:', error)
    }
  }
  
  // Define animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  }
  
  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  }
  
  // Get rank based on score and accuracy
  const getRank = () => {
    if (!stats) return { title: "Player", emoji: "🎮" }
    
    const { accuracy } = stats
    
    if (accuracy >= 90) return { title: "Math Master", emoji: "🧠" }
    if (accuracy >= 75) return { title: "Number Ninja", emoji: "⚔️" }
    if (accuracy >= 60) return { title: "Calculation Cadet", emoji: "🚀" }
    if (accuracy >= 45) return { title: "Formula Friend", emoji: "🔢" }
    return { title: "Math Rookie", emoji: "📝" }
  }
  
  const playerRank = getRank()
  
  // Background style with animated gradient
  const backgroundStyle = {
    background: "linear-gradient(-45deg, #000000, #030a1c, #0a0020, #000000)",
    backgroundSize: "400% 400%",
    animation: "gradientBG 15s ease infinite"
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center text-white z-50 p-4"
          style={backgroundStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-over-title"
        >
          {/* Confetti effect for new high score */}
          {isNewHighScore && (
            <Confetti 
              width={width} 
              height={height} 
              recycle={false} 
              numberOfPieces={200}
              colors={['#00ffcc', '#ff003c', '#ffffff', '#ffcc00']}
              onConfettiComplete={() => setAnimationComplete(true)}
            />
          )}
          
          <motion.div
            className="p-6 md:p-8 rounded-2xl bg-black bg-opacity-80 max-w-md w-full text-center shadow-2xl relative border-2"
            style={{ 
              borderColor: isNewHighScore ? '#ffcc00' : 'rgba(0, 255, 204, 0.3)',
              boxShadow: isNewHighScore 
                ? '0 0 30px rgba(255, 204, 0, 0.3)' 
                : '0 0 30px rgba(0, 255, 204, 0.2)'
            }}
            initial={{ scale: 0.7, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 50 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25 
            }}
            variants={containerAnimation}
          >
            {/* Game over title */}
            <motion.h1
              id="game-over-title"
              className="text-4xl md:text-5xl font-bold mb-4 text-mathGreen"
              variants={itemAnimation}
            >
              Game Over
            </motion.h1>

            {/* Player name if provided */}
            {userName && (
              <motion.p
                className="text-xl mb-4"
                variants={itemAnimation}
              >
                {userName}
              </motion.p>
            )}
            
            {/* New high score notification */}
            {isNewHighScore && (
              <motion.div
                className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-full text-lg inline-block mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500,
                  damping: 10,
                  delay: 0.5
                }}
              >
                🏆 NEW RECORD! 🏆
              </motion.div>
            )}

            {/* Score information */}
            <motion.div className="mb-6" variants={itemAnimation}>
              <div className="flex justify-between items-center px-4 py-2 bg-midnight bg-opacity-50 rounded-lg mb-2">
                <span className="text-lg">Score:</span>
                <span className="font-bold text-xl text-mathGreen">{score}</span>
              </div>
              
              <div className="flex justify-between items-center px-4 py-2 bg-midnight bg-opacity-50 rounded-lg">
                <span className="text-lg">High Score:</span>
                <span className="font-bold text-xl text-yellow-400">{highScore}</span>
              </div>
            </motion.div>

            {/* Rank display */}
            {stats && (
              <motion.div 
                className="mb-6 bg-mathGreen/10 p-3 rounded-lg"
                variants={itemAnimation}
              >
                <div className="text-2xl mb-1">{playerRank.emoji}</div>
                <div className="font-bold text-mathGreen">{playerRank.title}</div>
              </motion.div>
            )}

            {/* Stats toggle button */}
            {stats && (
              <motion.button
                onClick={handleToggleDetails}
                className="mb-4 text-mathGreen underline text-sm flex items-center justify-center mx-auto gap-1"
                variants={itemAnimation}
                aria-expanded={showDetails}
                aria-controls="stats-details"
              >
                {showDetails ? (
                  <>Hide Details <span>↑</span></>
                ) : (
                  <>Show Details <span>↓</span></>
                )}
              </motion.button>
            )}
            
            {/* Detailed statistics */}
            <AnimatePresence>
              {showDetails && stats && (
                <motion.div
                  id="stats-details"
                  className="bg-midnight bg-opacity-50 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-y-3 text-left">
                    <div className="text-gray-300">Questions:</div>
                    <div className="text-right font-medium">{stats.totalQuestions}</div>
                    
                    <div className="text-gray-300">Correct:</div>
                    <div className="text-right font-medium">{stats.correctAnswers}</div>
                    
                    <div className="text-gray-300">Accuracy:</div>
                    <div className="text-right font-medium">{stats.accuracy}%</div>
                  </div>
                  
                  {/* Motivational message based on performance */}
                  <div className="mt-3 text-sm">
                    {stats.accuracy >= 75 ? (
                      <p className="text-mathGreen">Impressive math skills! Keep it up!</p>
                    ) : stats.accuracy >= 50 ? (
                      <p className="text-yellow-400">Good job! You're getting better!</p>
                    ) : (
                      <p className="text-pink-400">Practice makes perfect! You'll improve!</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 items-center mt-4"
              variants={itemAnimation}
            >
              <motion.button
                onClick={handleRestart}
                className="bg-mathGreen text-black px-6 py-3 rounded-full text-lg font-bold w-full sm:w-auto hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>

              <motion.button
                onClick={handleViewLeaderboard}
                className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold w-full sm:w-auto hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Leaderboard
              </motion.button>
            </motion.div>

            {/* Social sharing */}
            <motion.div 
              className="mt-6"
              variants={itemAnimation}
            >
              <p className="text-sm text-gray-300 mb-2">Share your score:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <motion.button
                  onClick={() => handleShare('twitter')}
                  className="bg-blue-400 text-white p-2 rounded-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span>Twitter</span>
                </motion.button>

                <motion.button
                  onClick={() => handleShare('facebook')}
                  className="bg-blue-600 text-white p-2 rounded-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  <span>Facebook</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleShare('whatsapp')}
                  className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </motion.button>
                
                {/* Copy to clipboard button */}
                <motion.button
                  onClick={handleCopyToClipboard}
                  className="bg-gray-600 text-white p-2 rounded-lg flex items-center gap-2 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Copy score to clipboard"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                  <span>Copy</span>
                  
                  {/* Copied notification */}
                  <AnimatePresence>
                    {copiedToClipboard && (
                      <motion.div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs py-1 px-2 rounded"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Copied!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Custom footer message */}
            <motion.p 
              className="text-xs text-gray-400 mt-6"
              variants={itemAnimation}
            >
              Thanks for playing! Stay tuned for new challenges.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}