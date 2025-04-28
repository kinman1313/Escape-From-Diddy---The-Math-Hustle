// components/RewardModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RewardModalProps = {
  reward: string;
  onClose: () => void;
  autoCloseTime?: number;
}

export default function RewardModal({ 
  reward, 
  onClose, 
  autoCloseTime = 5000 
}: RewardModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [progress, setProgress] = useState(100)
  
  // Auto-close timer
  useEffect(() => {
    const closeTimer = setTimeout(() => {
      handleClose()
    }, autoCloseTime)
    
    // Progress bar animation
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoCloseTime) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 16) // ~60fps update
    
    return () => {
      clearTimeout(closeTimer)
      clearInterval(interval)
    }
  }, [autoCloseTime])
  
  // Handle the closing animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300) // Wait for animation to complete
  }
  
  // Generate random particles for celebration effect
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360
    }))
  }
  
  const particles = generateParticles(20)
  
  // Emoji based on reward type
  const getRewardEmoji = () => {
    if (reward.includes('Protector')) return '🛡️'
    if (reward.includes('Bag')) return '💼'
    if (reward.includes('Protractor')) return '📐'
    return '🎁'
  }
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
      >
        {/* Celebration particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute text-xl pointer-events-none"
            initial={{ 
              x: '50%', 
              y: '50%', 
              opacity: 0,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              opacity: [0, 1, 0],
              scale: [0, particle.scale, 0],
              rotate: [0, particle.rotation]
            }}
            transition={{ 
              duration: 2 + Math.random(), 
              repeat: Infinity, 
              repeatType: 'loop',
              delay: Math.random() * 2
            }}
          >
            {['🎉', '✨', '🎊', '💫', '⭐'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
        
        {/* Reward card */}
        <motion.div
          className="bg-white text-black p-8 rounded-2xl shadow-2xl text-center w-[90%] max-w-md relative overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: isClosing ? 0.9 : 1, y: isClosing ? 20 : 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 15 
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent click from closing
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div 
              className="h-full bg-mathGreen"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          {/* Emoji with animation */}
          <motion.div
            className="text-7xl mb-6 relative"
            animate={{ 
              rotate: [0, -5, 5, -5, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            {getRewardEmoji()}
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop'
              }}
              style={{ zIndex: -1 }}
            />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Legendary Gear Unlocked!</h2>
          
          <motion.div
            className="text-xl font-bold text-mathGreen mb-6 px-4 py-2 border-2 border-mathGreen rounded-lg inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {reward}
          </motion.div>
          
          <p className="text-gray-600 mb-6">
            This rare item will help you in your mathematical journey. Equip it in your closet!
          </p>

          <motion.button
            className="bg-mathGreen text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
            onClick={handleClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Keep Hustling
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}