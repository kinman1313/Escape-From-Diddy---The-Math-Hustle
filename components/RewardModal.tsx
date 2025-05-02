// components/RewardModal.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/lib/soundManager'
import Image from 'next/image'

type RewardModalProps = {
  show: boolean;
  rewardName: string;
  onClose: () => void;
  onEquip?: () => void;
}

// Map reward names to their respective icons/images
const rewardIcons: Record<string, string> = {
  "Sean Jean Pocket Protector™": "🧮",
  "Oh No You Diddy'nt Hypotenuse Bag™": "📐",
  "Burberry Legacy Puff Daddy Protractor™": "📏",
  "Diddy's Gold Chain Calculator™": "💰",
  "default": "🎁" // Default icon if reward not found
}

export default function RewardModal({ 
  show, 
  rewardName, 
  onClose, 
  onEquip 
}: RewardModalProps) {
  const [playedSound, setPlayedSound] = useState(false)
  const [rainbowBorder, setRainbowBorder] = useState(0)
  const [particleCount, setParticleCount] = useState(30)

  // Get the appropriate icon for this reward
  const rewardIcon = rewardIcons[rewardName] || rewardIcons.default

  // Play sound effect when modal appears
  useEffect(() => {
    if (show && !playedSound) {
      // Use soundManager instead of direct Howl usage
      playSound('diddy-party')
      setPlayedSound(true)
      
      // Reset flag when modal is closed
      return () => {
        setPlayedSound(false)
      }
    }
  }, [show, playedSound])

  // Animate rainbow border
  useEffect(() => {
    if (!show) return
    
    const interval = setInterval(() => {
      setRainbowBorder(prev => (prev + 1) % 360)
    }, 50)
    
    return () => clearInterval(interval)
  }, [show])

  // Handle both equip and close
  const handleEquip = () => {
    playSound('success')
    if (onEquip) onEquip()
    onClose()
  }

  // Particle effect component
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 10 + 5
          const duration = Math.random() * 5 + 2
          const initialX = Math.random() * 100
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                bottom: '-20px',
                left: `${initialX}%`,
                opacity: 0.8,
              }}
              animate={{
                y: [0, -300 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [0.8, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reward-title"
        >
          <motion.div
            className="relative p-8 rounded-2xl text-center shadow-2xl overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, #030a1c, #080015)`,
              boxShadow: `0 0 2px hsl(${rainbowBorder}, 100%, 70%), 
                          0 0 20px rgba(0, 255, 204, 0.4),
                          inset 0 0 3px hsl(${rainbowBorder}, 100%, 60%)`,
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: `hsl(${rainbowBorder}, 100%, 60%)`
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 20 
            }}
          >
            {/* Particles background effect */}
            <Particles />
            
            <motion.div
              className="relative z-10"
            >
              <motion.h2
                id="reward-title"
                className="text-3xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                🎉 New Unlock!
              </motion.h2>
              
              {/* Reward icon with animation */}
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ 
                  type: "spring", 
                  delay: 0.3,
                  times: [0, 0.6, 0.8, 1],
                  duration: 1 
                }}
              >
                {rewardIcon}
              </motion.div>

              <motion.p
                className="text-xl text-mathGreen font-semibold mb-6 max-w-xs mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {rewardName}
              </motion.p>
              
              <motion.div
                className="flex gap-3 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={handleEquip}
                  className="bg-mathGreen text-black px-6 py-3 rounded-full font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Equip Now
                </motion.button>
                
                <motion.button
                  onClick={onClose}
                  className="bg-gray-700 text-white px-6 py-3 rounded-full font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Later
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}