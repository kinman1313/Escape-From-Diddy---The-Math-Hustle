// components/StreakCounter.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { playSound } from '@/lib/soundManager'

// Custom hook for window size
function useWindowSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    function handleResize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

type StreakCounterProps = {
  streak: number;
  previousStreak?: number;
  showMilestones?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
}

export default function StreakCounter({ 
  streak, 
  previousStreak = 0,
  showMilestones = true,
  position = 'top-right',
  size = 'medium'
}: StreakCounterProps) {
  const [showIncrement, setShowIncrement] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [fireConfetti, setFireConfetti] = useState(false)
  const [flyDirection, setFlyDirection] = useState<'top' | 'left' | 'right'>('top')
  const [streakLevel, setStreakLevel] = useState(0) // 0 = normal, 1 = good, 2 = great, 3 = amazing
  const [width, height] = useWindowSize()

  // Calculate streak level for different visual effects
  useEffect(() => {
    if (streak >= 10) setStreakLevel(3)
    else if (streak >= 5) setStreakLevel(2)
    else if (streak >= 3) setStreakLevel(1)
    else setStreakLevel(0)
  }, [streak])

  // Handle streak changes
  useEffect(() => {
    if (streak > previousStreak && streak > 0) {
      // Randomly select animation direction
      const directions = ['top', 'left', 'right'] as const
      const random = directions[Math.floor(Math.random() * directions.length)]
      setFlyDirection(random)

      // Play streak sound effect
      if (streak % 5 === 0) {
        playSound('streak', 'diddy-party')
      } else if (streak % 3 === 0) {
        playSound('streak', 'correct')
      } else {
        playSound('correct')
      }

      // Show increment animation
      setShowIncrement(true)
      setTimeout(() => setShowIncrement(false), 1000)

      // Show milestone celebration for important streaks
      if (showMilestones && (streak === 3 || streak === 5 || streak === 10)) {
        setShowMilestone(true)
        setFireConfetti(true)
        
        // Hide milestone celebration after delay
        setTimeout(() => {
          setShowMilestone(false)
          setFireConfetti(false)
        }, 2500)
      }
    }
  }, [streak, previousStreak, showMilestones])

  // Animation variants based on fly direction
  const getFlyInitial = () => {
    switch (flyDirection) {
      case 'top': return { y: -50, opacity: 0 }
      case 'left': return { x: -50, opacity: 0 }
      case 'right': return { x: 50, opacity: 0 }
      default: return { y: -50, opacity: 0 }
    }
  }

  // Get milestone message based on streak
  const getMilestoneMessage = () => {
    if (streak === 3) return "Math Apprentice! 🧠"
    if (streak === 5) return "Math Wizard! ✨"
    if (streak === 10) return "Math Master! 👑"
    return ""
  }
  
  // Helper to get position classes
  const getPositionClass = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4'
      case 'top-right': return 'top-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      default: return 'top-4 right-4'
    }
  }
  
  // Helper to get size classes
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'text-sm'
      case 'medium': return 'text-base'
      case 'large': return 'text-lg'
      default: return 'text-base'
    }
  }
  
  // Don't render anything if streak is 0
  if (streak === 0) return null;
  
  // Get colors for different streak levels
  const getStreakColor = () => {
    switch (streakLevel) {
      case 1: return 'text-green-400'
      case 2: return 'text-yellow-400'
      case 3: return 'text-fuchsia-400'
      default: return 'text-white'
    }
  }
  
  // Get glow effects for different streak levels
  const getStreakGlow = () => {
    switch (streakLevel) {
      case 1: return 'shadow-[0_0_10px_rgba(74,222,128,0.5)]'
      case 2: return 'shadow-[0_0_15px_rgba(250,204,21,0.6)]'
      case 3: return 'shadow-[0_0_20px_rgba(232,121,249,0.7)]'
      default: return ''
    }
  }
  
  // Colored flame emoji for higher streaks
  const getStreakEmoji = () => {
    if (streakLevel === 3) return '💜'; // Purple flame
    if (streakLevel === 2) return '💛'; // Yellow flame
    if (streakLevel === 1) return '💚'; // Green flame
    return '🔥'; // Default red flame
  }

  return (
    <div className={`fixed ${getPositionClass()} z-40`} aria-live="polite">
      {/* Confetti effect for milestones */}
      {fireConfetti && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={150}
          gravity={0.15}
          colors={['#00ffcc', '#ffcc00', '#ff00ff', '#ffffff']}
        />
      )}

      {/* Main streak counter */}
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-full bg-black bg-opacity-70 backdrop-blur-sm
        ${getSizeClass()} ${getStreakColor()} ${getStreakGlow()}`}
      >
        <motion.span 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5, 0],
            color: streakLevel >= 2 ? 
              ['#ffcc00', '#ff00cc', '#00ffcc', '#ffcc00'] : 
              undefined
          }} 
          transition={{ 
            scale: { duration: 0.8, repeat: Infinity, repeatType: "reverse" },
            rotate: { duration: 0.3, repeat: Infinity, repeatType: "reverse" },
            color: { duration: 2, repeat: Infinity }
          }}
          className="text-xl"
        >
          {getStreakEmoji()}
        </motion.span>

        <div className="flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={streak}
              className="font-bold"
              initial={getFlyInitial()}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Streak: {streak}
            </motion.span>
          </AnimatePresence>
          
          {/* Streak increment animation */}
          <AnimatePresence>
            {showIncrement && (
              <motion.div
                className={`ml-1 ${streakLevel >= 2 ? 'text-yellow-300' : 'text-green-400'} font-bold`}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.5 }}
                transition={{ duration: 0.8 }}
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Milestone celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className={`absolute ${
              position.includes('right') ? 'right-0 -left-36' : 'left-0 -right-36'
            } ${
              position.includes('top') ? 'top-14' : 'bottom-14'  
            } py-2 px-4 bg-gradient-to-r from-mathGreen to-purple-500 
            text-white font-bold rounded-lg text-center`}
            initial={{ opacity: 0, scale: 0.5, y: position.includes('top') ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position.includes('top') ? -10 : 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {getMilestoneMessage()}
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '100%',
                    backgroundColor: 
                      ['#00ffcc', '#ffcc00', '#ff00ff'][Math.floor(Math.random() * 3)]
                  }}
                  animate={{ 
                    y: [0, -40 - Math.random() * 40],
                    x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 60],
                    scale: [1, 0],
                    opacity: [1, 0]
                  }}
                  transition={{ 
                    duration: 1 + Math.random(), 
                    repeat: 2,
                    repeatType: 'loop'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level-up effect for new streak levels */}
      <AnimatePresence>
        {streak > 0 && previousStreak < streak && (streak === 3 || streak === 5 || streak === 10) && (
          <motion.div
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-5xl sm:text-7xl md:text-9xl font-bold text-mathGreen"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
              style={{
                textShadow: '0 0 20px rgba(0, 255, 204, 0.8), 0 0 40px rgba(0, 255, 204, 0.5)'
              }}
            >
              LEVEL UP!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ring of particles for high streaks (level 3) */}
      {streakLevel === 3 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            
            return (
              <motion.div
                key={`orbit-particle-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: 'calc(50% - 1px)',
                  top: 'calc(50% - 1px)',
                  backgroundColor: i % 3 === 0 ? '#00ffcc' : i % 3 === 1 ? '#ffcc00' : '#ff00ff'
                }}
                animate={{
                  x: [
                    Math.cos(angle) * 36,
                    Math.cos(angle + Math.PI / 6) * 36,
                    Math.cos(angle + Math.PI / 3) * 36,
                    Math.cos(angle + Math.PI / 2) * 36,
                    Math.cos(angle + (2 * Math.PI) / 3) * 36,
                    Math.cos(angle + (5 * Math.PI) / 6) * 36,
                    Math.cos(angle + Math.PI) * 36
                  ],
                  y: [
                    Math.sin(angle) * 36,
                    Math.sin(angle + Math.PI / 6) * 36,
                    Math.sin(angle + Math.PI / 3) * 36,
                    Math.sin(angle + Math.PI / 2) * 36,
                    Math.sin(angle + (2 * Math.PI) / 3) * 36,
                    Math.sin(angle + (5 * Math.PI) / 6) * 36,
                    Math.sin(angle + Math.PI) * 36
                  ],
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  )
}