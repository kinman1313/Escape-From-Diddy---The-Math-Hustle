// components/PowerupEffects.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { playSound } from '@/lib/soundManager'

type PowerupType = 'timeFreeze' | 'fiftyFifty' | 'repellent';

type PowerupEffectsProps = {
  activeEffect: PowerupType | null;
  duration?: number;
  onComplete?: () => void;
  position?: 'top' | 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large';
}

// Define styles for different powerup effects
const effectStyles = {
  timeFreeze: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: '#00ffff',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
    iconColor: '#80ffff'
  },
  fiftyFifty: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    borderColor: '#ffcc00',
    textShadow: '0 0 8px rgba(255, 204, 0, 0.8)',
    iconColor: '#ffcc00'
  },
  repellent: {
    backgroundColor: 'rgba(255, 0, 100, 0.15)',
    borderColor: '#ff0064',
    textShadow: '0 0 8px rgba(255, 0, 100, 0.8)',
    iconColor: '#ff6464'
  }
};

export default function PowerupEffects({ 
  activeEffect, 
  duration = 5000,
  onComplete,
  position = 'top',
  size = 'medium'
}: PowerupEffectsProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isActive, setIsActive] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Start effect and timer when activeEffect changes
  useEffect(() => {
    if (activeEffect) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Reset state
      setIsActive(true)
      setTimeRemaining(duration)
      setAnimationKey(prev => prev + 1)
      
      // Play activation sound based on effect type
      const soundMap = {
        timeFreeze: 'timeFreeze',
        fiftyFifty: 'powerup',
        repellent: 'powerup'
      };
      
      playSound(soundMap[activeEffect], 'powerup')
    } else {
      setIsActive(false)
      
      // Clear interval when no active effect
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeEffect, duration])
  
  // Handle countdown timer
  useEffect(() => {
    if (!isActive || !activeEffect) return
    
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setTimeRemaining(remaining)
      
      // Play warning sound at 25% remaining time
      if (remaining <= duration * 0.25 && remaining > duration * 0.25 - 100) {
        playSound('timeout')
      }
      
      if (remaining <= 0) {
        // Clear the interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        
        // Set inactive and call completion handler
        setIsActive(false)
        if (onComplete) onComplete()
      }
    }, 50) // Update more frequently for smoother progress bar
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, activeEffect, duration, onComplete])
  
  // Format time remaining
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }
  
  // Get position class based on position prop
  const getPositionClass = () => {
    switch(position) {
      case 'top': return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      case 'bottom': return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default: return 'top-4 left-1/2 transform -translate-x-1/2'
    }
  }
  
  // Get size class based on size prop
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'text-sm p-2 max-w-xs'
      case 'medium': return 'text-base p-3 max-w-sm'
      case 'large': return 'text-lg p-4 max-w-md'
      default: return 'text-base p-3 max-w-sm'
    }
  }
  
  // No active effect, don't render anything
  if (!activeEffect || !isActive) return null
  
  // Get effect style based on activeEffect
  const style = effectStyles[activeEffect] || effectStyles.timeFreeze
  
  // Progress bar percentage
  const progressPercent = (timeRemaining / duration) * 100
  
  // Get effect content based on activeEffect
  const getEffectContent = () => {
    switch (activeEffect) {
      case 'timeFreeze':
        return (
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-4xl mb-2"
              animate={{ 
                rotate: [0, 360],
                color: [style.iconColor, '#ffffff', style.iconColor],
                textShadow: [
                  `0 0 8px ${style.iconColor}`,
                  `0 0 15px ${style.iconColor}`,
                  `0 0 8px ${style.iconColor}`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              ⏱️
            </motion.div>
            <div className="font-bold mb-1" style={{ textShadow: style.textShadow }}>
              Time Frozen
            </div>
            <div className="countdown text-xl font-mono">
              {formatTime(timeRemaining)}
            </div>
            
            {/* Visual time particles */}
            <div className="relative w-16 h-16 mt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}-${animationKey}`}
                  className="absolute w-1 h-1 rounded-full bg-blue-400"
                  style={{ 
                    left: '50%', 
                    top: '50%',
                    backgroundColor: style.iconColor
                  }}
                  animate={{
                    x: [0, Math.cos(i * Math.PI / 4) * 30],
                    y: [0, Math.sin(i * Math.PI / 4) * 30],
                    opacity: [1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>
        )
        
      case 'fiftyFifty':
        return (
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-2xl font-bold mb-2 flex gap-1"
              animate={{ 
                scale: [1, 1.1, 1],
                color: [style.iconColor, '#ffffff', style.iconColor]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                50
              </motion.span>
              <span>/</span>
              <motion.span
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                50
              </motion.span>
            </motion.div>
            <div className="font-bold text-center" style={{ textShadow: style.textShadow }}>
              Two Wrong Answers Eliminated
            </div>
            
            {/* Checkmark animations */}
            <div className="flex gap-6 mt-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  ❌
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  ❌
                </motion.div>
              </motion.div>
            </div>
          </div>
        )
        
      case 'repellent':
        return (
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-4xl mb-2"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
              }}
            >
              🛡️
            </motion.div>
            <div className="font-bold mb-3" style={{ textShadow: style.textShadow }}>
              Diddy Repelled!
            </div>
            
            {/* Diddy running away animation */}
            <div className="relative h-10 w-full overflow-hidden">
              <motion.div
                className="absolute text-2xl"
                initial={{ x: 30 }}
                animate={{ 
                  x: [-30, -100],
                  y: [0, 2, -2, 0]
                }}
                transition={{ 
                  x: { duration: 1.5, ease: "easeOut" },
                  y: { duration: 0.3, repeat: 5, repeatType: "mirror" }
                }}
              >
                <div className="relative">
                  <div>🏃</div>
                  <motion.div
                    className="absolute -top-4 -right-2 text-sm"
                    animate={{ opacity: [0, 1, 0], y: [-5, -10, -15] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    💨
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        key={`powerup-${activeEffect}-${animationKey}`}
        className={`fixed ${getPositionClass()} ${getSizeClass()} 
          rounded-xl border-2 z-50 text-center text-white shadow-lg`}
        style={{ 
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          boxShadow: `0 0 15px ${style.borderColor}`
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        role="status"
        aria-live="polite"
        aria-label={`${activeEffect} powerup activated`}
      >
        {/* Main effect content */}
        {getEffectContent()}
        
        {/* Progress bar for timed effects */}
        {activeEffect === 'timeFreeze' && (
          <div className="w-full h-1.5 bg-black bg-opacity-30 mt-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full"
              style={{ backgroundColor: style.borderColor }}
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