// components/FeedbackModal.tsx
import { motion } from 'framer-motion'

export default function FeedbackModal({ isCorrect }: { isCorrect: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 text-2xl font-bold rounded-xl shadow-lg z-50
        ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}
    >
      {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
    </motion.div>
  )
}
