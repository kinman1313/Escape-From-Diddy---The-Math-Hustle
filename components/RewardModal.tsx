// components/RewardModal.tsx
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from '@react-hook/window-size'

type RewardModalProps = {
  show: boolean;
  rewardName: string;
  onClose: () => void;
}

export default function RewardModal({ show, rewardName, onClose }: RewardModalProps) {
  const [width, height] = useWindowSize()

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
            className="relative bg-white text-black rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center gap-6"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* 🎉 Confetti */}
            <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />

            {/* 🏆 Reward emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-6xl"
            >
              🏆
            </motion.div>

            {/* 🎯 Reward title */}
            <h2 className="text-3xl font-bold text-mathGreen">New Reward Unlocked!</h2>

            {/* 🧠 Reward name */}
            <p className="text-xl font-semibold">{rewardName}</p>

            {/* ✨ Close button */}
            <button
              onClick={onClose}
              className="mt-4 bg-mathGreen text-black px-6 py-3 rounded-full font-bold hover:scale-110 transition"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
