// components/LoadingScreen.tsx
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from '@/styles/LoadingScreen.module.css'

export default function LoadingScreen() {
  // Only show text after a delay to let image be visible
  const [showText, setShowText] = useState(false)
  
  useEffect(() => {
    // Wait 3 seconds before showing any text
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 3000)
    
    return () => clearTimeout(textTimer)
  }, [])

  return (
    <div className={styles.container}>
      {/* Image container - prominent and center stage */}
      <motion.div 
        className={styles.imageContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className={styles.image}>
          <Image
            src="/loading-diddy.jpg" // Correct path without "public" prefix
            alt="Diddy Silhouette"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            style={{ objectFit: 'cover' }} // Modern way instead of objectFit prop
          />
        </div>
      </motion.div>
      
      {/* Only show text after delay */}
      {showText && (
        <motion.div
          className={styles.textContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className={styles.loadingText}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Diddy is watching...
          </motion.p>
          
          <div className={styles.loadingDots}>
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
            />
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            />
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}