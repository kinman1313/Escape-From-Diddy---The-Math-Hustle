// components/FinalScoreScreen.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Confetti from 'react-confetti'

type ScoreData = {
  score: number;
  highScore: number;
  totalQuestions: number;
  correctAnswers: number;
  newHighScore?: boolean;
}

type FinalScoreScreenProps = {
  data: ScoreData;
  onRestart: () => void;
}

export default function FinalScoreScreen({ data, onRestart }: FinalScoreScreenProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(data.newHighScore || false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  
  // Get window dimensions for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Stop confetti after a while
  useEffect(() => {
    if (data.newHighScore) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 7000)
      
      return () => clearTimeout(timer)
    }
  }, [data.newHighScore])
  
  // Calculate accuracy percentage
  const accuracy = data.totalQuestions > 0 
    ? Math.round((data.correctAnswers / data.totalQuestions) * 100) 
    : 0
  
  // Determine ranking based on score
  const getRanking = () => {
    if (accuracy >= 90) return { title: "Math Wizard", emoji: "🧙‍♂️" }
    if (accuracy >= 75) return { title: "Number Ninja", emoji: "🥷" }
    if (accuracy >= 60) return { title: "Calculation Cadet", emoji: "🚀" }
    if (accuracy >= 40) return { title: "Formula Novice", emoji: "📝" }
    return { title: "Math Rookie", emoji: "🎒" }
  }
  
  const ranking = getRanking()
  
  // Staggered animation for stats
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-midnight p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti effect for new high score */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#00ffcc', '#ff003c', '#ffffff', '#ffcc00']}
        />
      )}
      
      {/* Game over title */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">💥 Busted by Diddy!</h1>
        <p className="text-white text-lg">You couldn't escape the math hustle.</p>
      </motion.div>
      
      {/* New high score notification */}
      {data.newHighScore && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 15,
            delay: 0.5
          }}
          className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-full mb-6 text-lg"
        >
          🏆 New High Score!
        </motion.div>
      )}
      
      {/* Stats card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white text-black p-6 rounded-xl shadow-2xl w-full max-w-md"
      >
        {/* Player ranking */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-6"
        >
          <div className="text-3xl mb-2">{ranking.emoji}</div>
          <h2 className="text-xl font-bold text-mathGreen">{ranking.title}</h2>
        </motion.div>
        
        {/* Stats grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-y-4 text-left"
        >
          <div className="font-semibold">Final Score:</div>
          <div className="text-right font-bold text-mathGreen">{data.score}</div>
          
          <div className="font-semibold">High Score:</div>
          <div className="text-right font-bold">{data.highScore}</div>
          
          <div className="font-semibold">Questions Answered:</div>
          <div className="text-right font-bold">{data.totalQuestions}</div>
          
          <div className="font-semibold">Correct Answers:</div>
          <div className="text-right font-bold">{data.correctAnswers}</div>
          
          <div className="font-semibold">Accuracy:</div>
          <div className="text-right font-bold">{accuracy}%</div>
        </motion.div>
        
        {/* Fun fact or tip based on performance */}
        <motion.div
          variants={itemVariants}
          className="mt-6 p-3 bg-gray-100 rounded-lg text-sm"
        >
          <p className="font-medium">
            {accuracy >= 70 
              ? "Impressive! Keep up the good work and you'll be a math master in no time."
              : "Pro tip: Use the powerups strategically to increase your chances of escape!"}
          </p>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <button
            onClick={onRestart}
            className="flex-1 bg-mathGreen text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/leaderboard')}
            className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            Leaderboard
          </button>
        </motion.div>
      </motion.div>
      
      {/* Share score button */}
      <motion.button
        variants={itemVariants}
        className="mt-6 text-mathGreen underline text-sm"
        onClick={() => {
          // This would implement sharing functionality in a real app
          alert('Share functionality would go here!')
        }}
      >
        Share your score
      </motion.button>
    </motion.div>
  )
}