// components/LoadingScreen.tsx
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'

export default function LoadingScreen() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
      <motion.img
        src="/diddler.jpg"
        alt="Diddy Loading"
        className="w-32 h-32 mb-6 opacity-60"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror' }}
      />

      <motion.h1
        className="text-3xl font-bold text-mathGreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Diddy’s Getting Ready...
      </motion.h1>

      <audio autoPlay loop ref={audioRef}>
        <source src="/sounds/everybyoutake.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
