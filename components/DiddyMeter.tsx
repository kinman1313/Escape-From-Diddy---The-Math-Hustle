// components/DiddyMeter.tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type DiddyMeterProps = {
  level: number;
  maxLevel?: number;
}

export default function DiddyMeter({ level, maxLevel = 5 }: DiddyMeterProps) {
  // Clamp level between 0 and maxLevel
  const clampedLevel = Math.min(Math.max(level, 0), maxLevel)
  const percent = (clampedLevel / maxLevel) * 100
  
  // Determine color and warning message based on level
  const [color, setColor] = useState('bg-green-500')
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  
  useEffect(() => {
    // Set color and warning message based on proximity level
    if (clampedLevel < 2) {
      setColor('bg-green-500')
      setWarningMessage(null)
    } else if (clampedLevel < 4) {
      setColor('bg-yellow-400')
      setWarningMessage(clampedLevel === 3 ? "Diddy's getting closer!" : null)
    } else {
      setColor('bg-red-600')
      setWarningMessage(clampedLevel >= maxLevel ? "Diddy's HERE. Time's up!" : "Diddy's almost here!")
    }
  }, [clampedLevel, maxLevel])
  
  return (
    <div className="w-[90%] max-w-xl text-left mt-4">
      <div className="flex justify-between items-center text-sm text-white font-semibold mb-1">
        <span>Diddy Proximity</span>
        <motion.span 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg"
        >
          🏃
        </motion.span>
      </div>
      
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full ${color} transition-all duration-500 ease-out relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        >
          {/* Add stripe pattern for visual interest */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0) 25%, 
                rgba(255, 255, 255, 0.2) 25%, 
                rgba(255, 255, 255, 0.2) 50%, 
                rgba(255, 255, 255, 0) 50%, 
                rgba(255, 255, 255, 0) 75%, 
                rgba(255, 255, 255, 0.2) 75%)`,
              backgroundSize: '20px 20px',
              animation: clampedLevel >= 4 ? 'moveStripes 0.5s linear infinite' : 'moveStripes 1s linear infinite'
            }}
          />
        </motion.div>
      </div>
      
      {warningMessage && (
        <motion.p 
          className="text-red-400 font-bold text-sm mt-1"
          animate={{ opacity: [0.7, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
        >
          {warningMessage}
        </motion.p>
      )}

      {/* Add CSS keyframes for stripe animation */}
      <style jsx>{`
        @keyframes moveStripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 20px 0;
          }
        }
      `}</style>
    </div>
  )
}