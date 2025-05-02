// components/SocialShare.tsx
import { motion } from 'framer-motion'

export default function SocialShare({ score = 0 }) {
  const shareText = encodeURIComponent(`I just scored ${score} points in Escape from Diddy! 🧠🔥 Can you beat me?`)
  const shareUrl = encodeURIComponent('https://diddysgonemath.com')
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <h2 className="text-xl font-bold text-mathGreen">📢 Share Your Score!</h2>
      <div className="flex gap-6">
        <motion.a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2 }}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-md"
        >
          Share on Twitter
        </motion.a>

        <motion.a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2 }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md"
        >
          Share on Facebook
        </motion.a>
      </div>
    </div>
  )
}
