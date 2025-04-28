
// components/Cutscene.tsx
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import styles from '@/styles/Cutscene.module.css'

type CutsceneProps = {
  onComplete: () => void;
}

export default function Cutscene({ onComplete }: CutsceneProps) {
  const [isVisible, setIsVisible] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Create and play audio when component mounts
  useEffect(() => {
    // Create audio element manually to ensure it works in all browsers
    const audio = new Audio('/sounds/bad-boy.mp3')
    audioRef.current = audio
    
    // Try multiple methods to ensure audio plays
    const playAudio = () => {
      try {
        // Set volume
        audio.volume = 0.7
        
        // Try to play
        const playPromise = audio.play()
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play failed:", error)
            // We'll proceed even if audio fails - visual is more important
          })
        }
      } catch (err) {
        console.error("Audio error:", err)
      }
    }
    
    playAudio()
    
    // Setup timeout for cutscene duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete()
      }, 500) // Short delay after fade out starts
    }, 4000)
    
    // Cleanup
    return () => {
      clearTimeout(timer)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      {/* Background with pattern overlay */}
      <div className={styles.backgroundPattern}></div>
      
      {/* Content container with motion */}
      <motion.div 
        className={styles.content}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className={styles.iconContainer}
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          🧨
        </motion.div>
        
        <motion.h1
          className={styles.title}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Escape from Diddy
        </motion.h1>
        
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          "Stay fly. Stay alive."
        </motion.p>
        
        <motion.div 
          className={styles.loadingBar}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.5, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  )
}