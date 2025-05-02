// components/RewardModal.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Howl } from 'howler'

type RewardModalProps = {
  show: boolean;
  rewardName: string;
  onClose: () => void;
}

export default function RewardModal({ show, rewardName, onClose }: RewardModalProps) {
  const [playedSound, setPlayedSound] = useState(false)

  useEffect(() => {
    if (show && !playedSound) {
      const sound = new Howl({
        src: ['/sounds/diddy-party.m4a'], // 🎉 Celebratory sound you already uploaded
        volume: 0.6,
      })
      sound.play()
      setPlayedSound(true)
    }
  }, [show, playedSound])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-mathGreen to-black p-8 rounded-2xl text-center shadow-2xl border-4 border-mathGreen"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🎉 New Unlock!
            </motion.h2>

            <motion.p
              className="text-xl text-mathGreen font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {rewardName}
            </motion.p>

            <motion.button
              onClick={onClose}
              className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-110 transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Equip Now
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
