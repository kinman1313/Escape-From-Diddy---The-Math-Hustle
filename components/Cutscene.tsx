// components/Cutscene.tsx
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Howl } from 'howler'

type CutsceneProps = {
  onComplete: () => void;
  skipEnabled?: boolean;
  duration?: number;
}

export default function Cutscene({ 
  onComplete, 
  skipEnabled = true,
  duration = 4000
}: CutsceneProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [soundLoaded, setSoundLoaded] = useState(false)
  const audioRef = useRef<Howl | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  
  // Create and play audio when component mounts
  useEffect(() => {
    // Create audio element manually to ensure it works in all browsers
    try {
      const audio = new Howl({
        src: ['/sounds/bad-boy.m4a'],
        volume: 0.7,
        onload: () => setSoundLoaded(true),
        onloaderror: (id, error) => console.error("Audio load failed:", error)
      })
      
      audioRef.current = audio
      
      // Try to play when loaded
      audio.once('load', () => {
        audio.play()
      })
    } catch (err) {
      console.error("Audio creation error:", err)
      // Continue without audio if it fails
      setSoundLoaded(true)
    }
    
    // Setup timeout for cutscene duration
    animationRef.current = setTimeout(() => {
      handleExit()
    }, duration)
    
    // Setup progress animation
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / duration) * 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        clearInterval(progressInterval)
      }
    }, 16) // ~60fps updates
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
      clearInterval(progressInterval)
      if (audioRef.current) {
        audioRef.current.stop()
        audioRef.current.unload()
      }
    }
  }, [duration])

  // Handle manual skip
  const handleSkip = () => {
    if (!skipEnabled) return
    handleExit()
  }
  
  // Handle exit animation
  const handleExit = () => {
    setIsVisible(false)
    // Give time for exit animation before completing
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-midnight z-50"
      onClick={handleSkip}
    >
      {/* Background with gradient patterns */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-radial from-mathGreen/10 to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-diddyDanger/10 to-transparent opacity-50" />
      </div>
      
      {/* Content container with motion */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-7xl mb-6"
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -3, 3, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          🧨
        </motion.div>
        
        <motion.h1
          className="text-5xl font-bold mb-4 text-mathGreen"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ textShadow: '0 0 15px rgba(0, 255, 204, 0.5)' }}
        >
          Escape from Diddy
        </motion.h1>
        
        <motion.p
          className="text-xl font-medium italic text-white/90 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          "Stay fly. Stay alive."
        </motion.p>
        
        {/* Loading bar */}
        <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-mathGreen to-diddyDanger"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        {/* Skip text */}
        {skipEnabled && (
          <motion.p
            className="mt-8 text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Tap anywhere to skip
          </motion.p>
        )}
        
        {/* Loading indicator if sound is not ready */}
        {!soundLoaded && (
          <motion.div
            className="absolute bottom-10 flex items-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}