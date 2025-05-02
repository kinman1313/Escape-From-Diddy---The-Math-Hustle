// components/LoadingScreen.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const spookyImages = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/pffy12.jpg',
]

export default function LoadingScreen() {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomImage = spookyImages[Math.floor(Math.random() * spookyImages.length)]
        setCurrentImage(randomImage)
        setTimeout(() => setCurrentImage(null), 300)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!playingAudio) {
      const audio = new Audio('/sounds/everybyoutake.mp3')
      audio.loop = true
      audio.volume = 0.2
      audio.play().catch(err => console.error('Audio play error:', err))
      setPlayingAudio(true)
    }
  }, [playingAudio])

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-mathGreen relative overflow-hidden">
      <motion.h1
        className="text-4xl font-bold mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Escaping Diddy...
      </motion.h1>

      <motion.p
        className="text-lg"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        Math, Memes, Mayhem.
      </motion.p>

      {/* Diddy random flash */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            className="absolute inset-0 flex justify-center items-center z-10 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image src={currentImage} alt="Diddy Spook" width={500} height={500} className="object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}