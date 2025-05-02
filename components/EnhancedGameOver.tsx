// components/EnhancedGameOver.tsx
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useState, useEffect } from 'react'
import styles from '@/styles/EnhancedGameOver.module.css'

type EnhancedGameOverProps = {
  show: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
}

function useWindowSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  ])

  useEffect(() => {
    function handleResize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

export default function EnhancedGameOver({ show, score, highScore, onRestart }: EnhancedGameOverProps) {
  const isNewHighScore = score >= highScore
  const [width, height] = useWindowSize() // 🔥 Moved inside here!

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`${styles.gameOverBackground} fixed inset-0 flex items-center justify-center text-white z-50`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="p-8 rounded-2xl bg-black bg-opacity-80 text-center shadow-2xl relative"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h1 className="text-5xl font-bold mb-4 text-mathGreen animate-bounce">
              Game Over
            </h1>

            <p className="text-xl mb-2">
              Score: <span className="font-bold text-mathGreen">{score}</span>
            </p>

            <p className="text-xl mb-6">
              High Score: <span className="font-bold text-yellow-400">{highScore}</span>
            </p>

            {isNewHighScore && (
              <>
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                  numberOfPieces={200}
                />
                <motion.p
                  className="text-2xl text-pink-400 font-bold mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  🎉 NEW RECORD! 🎉
                </motion.p>
              </>
            )}

            <button
              onClick={onRestart}
              className="mt-4 bg-mathGreen text-black px-6 py-3 rounded-full text-lg font-bold hover:scale-110 transition"
            >
              Try Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
