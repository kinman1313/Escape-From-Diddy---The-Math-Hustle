// components/FeedbackModal.tsx
import { motion, AnimatePresence } from 'framer-motion'

type FeedbackModalProps = {
  show: boolean;
  correct: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ show, correct, onClose }: FeedbackModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`p-6 rounded-xl ${correct ? 'bg-green-600' : 'bg-red-600'} text-white text-center shadow-lg cursor-pointer`}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              ...(correct
                ? {} // ✅ no shake
                : { x: [0, -10, 10, -10, 10, 0] }) // ❌ shake if wrong
            }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              {correct ? '✅ Correct!' : '❌ Incorrect!'}
            </h1>
            <p className="text-lg">
              {correct ? 'Nice work!' : 'Keep grinding, champ!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
