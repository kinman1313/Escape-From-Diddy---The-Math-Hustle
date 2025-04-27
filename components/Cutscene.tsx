// components/Cutscene.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { playSound } from '@/lib/soundManager'

export default function Cutscene({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'intro' | 'outro'>('intro')

  useEffect(() => {
    playSound('bad-boy') // Play intro sound
    const timer = setTimeout(() => {
      onComplete()
    }, 4000) // 4 seconds then start game
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center text-center bg-black text-white"
    >
      <motion.h1
        className="text-5xl font-bold mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        🧨 Escape from Diddy 🧨
      </motion.h1>
      <motion.p
        className="text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        "Stay fly. Stay alive."
      </motion.p>
    </motion.div>
  )
}
