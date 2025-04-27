// components/LoadingScreen.tsx
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-48 h-48 relative">
        <Image
  src="/loading-diddy.jpg"
  alt="Diddy Silhouette"
  fill
  style={{ objectFit: 'contain' }}
  priority
/>
        </div>
        <motion.p
          className="text-lg text-gray-300"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Diddy is watching... loading up the hustle.
        </motion.p>
      </motion.div>
    </div>
  )
}
