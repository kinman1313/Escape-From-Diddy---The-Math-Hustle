// components/ImageEvents.tsx

import { useEffect, useState, useContext, useCallback } from 'react'
import { GameContext } from './GameProvider'
import { playSound } from '@/lib/soundManager'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// Define jump scare images and sounds
const JUMP_SCARE_IMAGES = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/pffy12.jpg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg'
]

const JUMP_SCARE_SOUNDS = [
  'bad-boy',
  'come-on',
  'diddy-party',
  'do-wa-diddy',
  'every-step',
  'i-like-this',
  'talk-to-them'
]

// Time constants
const MIN_DELAY = 3 * 60 * 1000  // 3 minutes
const MAX_DELAY = 10 * 60 * 1000 // 10 minutes
const JUMPSCARE_DURATION = 4000  // 4 seconds

// Type declaration for debug feature
declare global {
  interface Window {
    debugTriggerJumpScare?: (index: number) => void
  }
}

export default function ImageEvents() {
  const { gameState } = useContext(GameContext)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Function to trigger random jump scare
  const triggerRandomJumpScare = useCallback(() => {
    const imageIndex = Math.floor(Math.random() * JUMP_SCARE_IMAGES.length)
    const image = JUMP_SCARE_IMAGES[imageIndex]
    triggerJumpScare(image)
  }, [])

  // Function to trigger specific jump scare
  const triggerJumpScare = useCallback((image: string) => {
    // Reset image loaded state
    setImageLoaded(false)
    
    // Set image and make visible
    setCurrentImage(image)
    setVisible(true)

    // Play random sound effect
    const soundIndex = Math.floor(Math.random() * JUMP_SCARE_SOUNDS.length)
    const sound = JUMP_SCARE_SOUNDS[soundIndex]
    playSound(sound)

    // Hide jump scare after duration
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setCurrentImage(null)
    }, JUMPSCARE_DURATION)

    // Schedule next jump scare
    const nextDelay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY
    const nextTimer = setTimeout(() => {
      // 60% chance to show another jump scare
      const shouldShow = Math.random() < 0.6
      if (shouldShow && gameState.status === 'playing') {
        triggerRandomJumpScare()
      }
    }, nextDelay)

    // Return cleanup function
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(nextTimer)
    }
  }, [gameState.status, triggerRandomJumpScare])

  // Initial setup for jump scares
  useEffect(() => {
    // Only trigger jump scares during active gameplay
    if (gameState.status !== 'playing') return

    // Initial delay before first possible jump scare
    const initialTimer = setTimeout(() => {
      const shouldShow = Math.random() < 0.7
      if (shouldShow) triggerRandomJumpScare()
    }, 2 * 60 * 1000) // initial 2-minute delay

    return () => clearTimeout(initialTimer)
  }, [gameState.status, triggerRandomJumpScare])

  // Setup debug trigger in development
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose dev test hook
      window.debugTriggerJumpScare = (index: number) => {
        const image = JUMP_SCARE_IMAGES[index % JUMP_SCARE_IMAGES.length]
        triggerJumpScare(image)
      }
    }

    // Clean up debug hook on unmount
    return () => {
      if (typeof window !== 'undefined') {
        delete window.debugTriggerJumpScare
      }
    }
  }, [triggerJumpScare])

  // Dismiss handler
  const handleDismiss = () => {
    setVisible(false)
    setCurrentImage(null)
  }

  return (
    <AnimatePresence>
      {visible && currentImage && (
        <motion.div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleDismiss}
          role="dialog"
          aria-label="Surprise event"
          aria-modal="true"
        >
          {/* Loading indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-mathGreen text-2xl">Loading...</div>
            </div>
          )}
          
          <motion.div
            animate={{ 
              scale: [0.9, 1.05, 1],
              opacity: imageLoaded ? [0.85, 1, 0.85] : 0 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative max-h-full max-w-full"
          >
            <Image
              src={currentImage}
              alt="Surprise appearance"
              width={800}
              height={800}
              className="object-contain"
              priority={true}
              onLoad={() => setImageLoaded(true)}
              unoptimized={false} // Use image optimization
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}