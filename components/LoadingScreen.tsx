// components/LoadingScreen.tsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { playSound } from '@/lib/soundManager'

// Spooky image paths
const spookyImages = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/pffy12.jpg',
]

// Loading phrases for variety
const loadingPhrases = [
  "Escaping Diddy...",
  "Calculating solutions...",
  "Crunching numbers...",
  "Preparing for math mayhem...",
  "Compiling chaos..."
]

export default function LoadingScreen() {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0])
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(true)

  // Function to show random flash image
  const showRandomImage = useCallback(() => {
    // Don't flash if another image is still loading
    if (!imageLoaded) return
    
    const randomImage = spookyImages[Math.floor(Math.random() * spookyImages.length)]
    setImageLoaded(false) // Set to false until new image loads
    setCurrentImage(randomImage)
    
    // Hide image after a short delay
    setTimeout(() => {
      setCurrentImage(null)
    }, 300)
  }, [imageLoaded])

  // Flash random images occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        showRandomImage()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [showRandomImage])

  // Rotate loading phrases
  useEffect(() => {
    const phrasesInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingPhrases.length)
      setLoadingPhrase(loadingPhrases[randomIndex])
    }, 2500)
    
    return () => clearInterval(phrasesInterval)
  }, [])

  // Simulate loading progress
  useEffect(() => {
    // Reset progress when component mounts
    setLoadingProgress(0)
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        // Slow down progress as it approaches 100%
        if (prev >= 95) {
          return prev + 0.1
        } else if (prev >= 80) {
          return prev + 0.5
        } else {
          return prev + Math.random() * 5
        }
      })
    }, 200)
    
    return () => clearInterval(interval)
  }, [])

  // Initialize audio when component mounts
  useEffect(() => {
    if (!audioInitialized) {
      // Attempt to play audio using soundManager instead of direct Audio API
      try {
        playSound('everybyoutake')
        setAudioInitialized(true)
        
        // Set up cleanup function to stop audio after 9 seconds
        const stopTimer = setTimeout(() => {
          // Stop the sound (this depends on your soundManager implementation)
          // You might need to add a stopSound function to your soundManager
        }, 9000)
        
        return () => clearTimeout(stopTimer)
      } catch (err) {
        console.error('Audio play error:', err)
      }
    }
  }, [audioInitialized])

  return (
    <div 
      className="flex flex-col justify-center items-center min-h-screen bg-black text-mathGreen relative overflow-hidden"
      role="alert"
      aria-live="polite"
      aria-label="Loading screen"
    >
      {/* Background grid animation */}
      <div className="absolute inset-0 bg-math-pattern opacity-20 animate-pulse"></div>
      
      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-mathGreen"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
      
      {/* Loading text */}
      <motion.h1
        className="text-4xl font-bold mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {loadingPhrase}
      </motion.h1>

      <motion.p
        className="text-lg"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        Math, Memes, Mayhem.
      </motion.p>
      
      {/* Loading dots */}
      <div className="flex space-x-2 mt-4">
        <motion.div 
          className="w-3 h-3 rounded-full bg-mathGreen"
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
        />
        <motion.div 
          className="w-3 h-3 rounded-full bg-mathGreen"
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
        />
        <motion.div 
          className="w-3 h-3 rounded-full bg-mathGreen"
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
        />
      </div>

      {/* Diddy random flash */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            className="absolute inset-0 flex justify-center items-center z-10 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image 
              src={currentImage} 
              alt="Loading visual" 
              width={500} 
              height={500} 
              className="object-contain" 
              priority
              onLoad={() => setImageLoaded(true)}
              unoptimized={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}