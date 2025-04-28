// components/RewardModal.tsx
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RewardModalProps = {
  reward: string
  onClose: () => void
}

export default function RewardModal({ reward, onClose }: RewardModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="bg-white text-black p-10 rounded-3xl shadow-2xl text-center max-w-md w-[90%]"
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🎁
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">Legendary Gear Unlocked!</h2>
            <p className="text-lg font-semibold text-mathGreen">{reward}</p>

            <button
              onClick={onClose}
              className="mt-8 bg-mathGreen text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
            >
              Keep Hustling
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
