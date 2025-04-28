// components/LoadingScreen.tsx
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

type LoadingScreenProps = {
  minimumDisplayTime?: number;
  imageUrl?: string;
}

export default function LoadingScreen({ 
  minimumDisplayTime = 3000,
  imageUrl = '/images/loading-diddy.jpg'
}: LoadingScreenProps) {
  // State to control text and animation phases
  const [showText, setShowText] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'initial' | 'mid' | 'final'>('initial')
  const [loadingMessages, setLoadingMessages] = useState<string[]>([
    "Diddy is watching...",
    "Calculating equations...",
    "Preparing math challenges...",
    "Setting up powerups...",
    "Almost ready..."
  ])
  
  // Randomize loading messages
  useEffect(() => {
    // Shuffle the array for variety
    const shuffled = [...loadingMessages].sort(() => 0.5 - Math.random())
    setLoadingMessages(shuffled)
  }, [])
  
  useEffect(() => {
    // Start showing text after a short delay
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 1000)
    
    // Show mid phase after 2 seconds
    const midPhaseTimer = setTimeout(() => {
      setLoadingPhase('mid')
    }, 2000)
    
    // Show final phase to indicate near completion
    const finalPhaseTimer = setTimeout(() => {
      setLoadingPhase('final')
    }, minimumDisplayTime - 1000)
    
    return () => {
      clearTimeout(textTimer)
      clearTimeout(midPhaseTimer)
      clearTimeout(finalPhaseTimer)
    }
  }, [minimumDisplayTime])

  // Animation variants for the image container
  const containerVariants = {
    initial: { opacity: 0.8 },
    mid: { opacity: 1 },
    final: { 
      opacity: 1,
      scale: 1.02,
      transition: { duration: 0.8 }
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50 overflow-hidden">
      {/* Image container - with motion controls */}
      <motion.div 
        className="relative w-full h-full max-h-screen"
        initial="initial"
        animate={loadingPhase}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80 z-10" />
        
        <Image
          src={imageUrl}
          alt="Loading Screen"
          layout="fill"
          objectFit="cover"
          priority
          className="opacity-70"
        />
        
        {/* Vignette effect overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-[5]" />
      </motion.div>
      
      {/* Text overlay */}
      {showText && (
        <motion.div
          className="absolute bottom-[15%] left-0 right-0 z-20 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-2xl font-bold text-mathGreen mb-6"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              textShadow: [
                '0 0 8px rgba(0, 255, 204, 0.5)',
                '0 0 16px rgba(0, 255, 204, 0.8)',
                '0 0 8px rgba(0, 255, 204, 0.5)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {loadingPhase === 'final' ? loadingMessages[loadingMessages.length - 1] : loadingMessages[0]}
          </motion.div>
          
          {/* Loading bar */}
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-gradient-to-r from-mathGreen to-diddyDanger"
              initial={{ width: '10%' }}
              animate={{ 
                width: loadingPhase === 'initial' ? '30%' : 
                       loadingPhase === 'mid' ? '70%' : '95%' 
              }}
              transition={{ duration: 0.8 }}
            />
          </div>
          
          {/* Animated dots */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-mathGreen rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Game title */}
      <motion.h1
        className="absolute top-10 left-0 right-0 text-center text-3xl font-bold text-mathGreen z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ textShadow: '0 0 15px rgba(0, 255, 204, 0.7)' }}
      >
        Escape from Diddy
      </motion.h1>
      
      {/* Custom styles for gradients */}
      <style jsx>{`
        .bg-radial-gradient {
          background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.5) 70%,
            rgba(0, 0, 0, 0.8) 100%
          );
        }
      `}</style>
    </div>
  )
}