// pages/game.tsx
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '@/components/AuthProvider'
import { db } from '@/lib/firebase'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import StreakCounter from '@/components/StreakCounter'
import DiddyMeter from '@/components/DiddyMeter'
import RewardModal from '@/components/RewardModal'
import { Howl } from 'howler'
import styles from '@/styles/Game.module.css'

export default function GamePage() {
  const { user } = useContext(AuthContext)
  
  const [questions, setQuestions] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [locked, setLocked] = useState(false)
  const [showResult, setShowResult] = useState<null | 'correct' | 'wrong'>(null)
  const [eliminatedChoices, setEliminatedChoices] = useState<string[]>([])
  const [proximity, setProximity] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [powerups, setPowerups] = useState({ timeFreeze: 1, fiftyFifty: 1, repellent: 1 })
  const [showReward, setShowReward] = useState<string | null>(null)
  const [difficultyLevel, setDifficultyLevel] = useState(1)

  useEffect(() => {
    if (!user) return
    generateQuestions()
  }, [user])

  useEffect(() => {
    if (isTimerPaused) return
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerPaused])

  useEffect(() => {
    if (timeLeft === 0 && !locked) {
      handleAnswer(null)
    }
  }, [timeLeft])

  const generateQuestions = () => {
    const newQuestions = []
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * 10 * difficultyLevel) + 1
      const b = Math.floor(Math.random() * 10 * difficultyLevel) + 1
      const answer = a + b
      const choices = {
        A: answer,
        B: answer + Math.floor(Math.random() * 5) + 1,
        C: answer - Math.floor(Math.random() * 5) - 1,
        D: answer + Math.floor(Math.random() * 10) - 5,
      }
      newQuestions.push({ prompt: `${a} + ${b} = ?`, choices })
    }
    setQuestions(newQuestions)
  }

  const handleAnswer = async (choice: string | null) => {
    if (!questions[current]) return
    setLocked(true)

    const correct = choice && questions[current]?.choices[choice] === eval(questions[current]?.prompt.replace('= ?', ''))
    if (correct) {
      setScore(prev => prev + 10)
      setStreak(prev => prev + 1)
      setShowResult('correct')
      playCorrectSound()
      if ((score + 10) % 100 === 0) unlockReward()
    } else {
      setShowResult('wrong')
      setStreak(0)
      setProximity(prev => Math.min(prev + 20, 100))
      playWrongSound()
    }

    setTimeout(() => {
      setCurrent(prev => prev + 1)
      setShowResult(null)
      setLocked(false)
      setEliminatedChoices([])
      setTimeLeft(20)
      setDifficultyLevel(1 + Math.floor((score + 10) / 100))
    }, 1000)
  }

  const unlockReward = () => {
    const rewards = [
      'Sean John Croc Fedora 🧢',
      'P. Diddly Winks Run Fasters 👟',
      'Raptor Skin Math Cape 🧙‍♂️',
      'Monopoly Man Monocle, dipped in forbidden Cologne 🔥🕶️',
    ]
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)]
    setShowReward(randomReward)
  }

  const percentLeft = (timeLeft / 20) * 100

  const usePowerup = (type: 'timeFreeze' | 'fiftyFifty' | 'repellent') => {
    if (powerups[type] <= 0) return

    setPowerups(prev => ({ ...prev, [type]: prev[type] - 1 }))

    if (type === 'timeFreeze') {
      setIsTimerPaused(true)
      setTimeout(() => setIsTimerPaused(false), 5000)
    }
    if (type === 'fiftyFifty') {
      if (!questions[current]) return
      const choices = Object.keys(questions[current]?.choices)
      const correctAnswer = Object.entries(questions[current]?.choices).find(([_, value]) => value === eval(questions[current]?.prompt.replace('= ?', '')))
      const filtered = choices.filter(c => c !== correctAnswer?.[0]).sort(() => Math.random() - 0.5).slice(0, 2)
      setEliminatedChoices(filtered)
    }
    if (type === 'repellent') {
      setProximity(prev => Math.max(prev - 30, 0))
    }
  }

  const playCorrectSound = () => {
    const sound = new Howl({ src: ['/sounds/i-like-this.m4a'], volume: 0.5 })
    sound.play()
  }

  const playWrongSound = () => {
    const sound = new Howl({ src: ['/sounds/bad-boy.m4a'], volume: 0.5 })
    sound.play()
  }
  
if (!user) {
  return (
    <main className="flex items-center justify-center min-h-screen text-mathGreen text-xl animate-pulse pt-24">
      Loading Game...
    </main>
  )
}

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Timer Bar */}
      <div className="w-full h-4 mb-4 bg-gray-800 rounded overflow-hidden">
        <motion.div
          animate={{
            width: `${percentLeft}%`,
            backgroundColor: percentLeft < 30 ? '#ff003c' : '#00ffcc',
            scale: percentLeft < 20 ? [1, 1.05, 1] : 1,
          }}
          transition={{ repeat: percentLeft < 20 ? Infinity : 0, duration: 0.6 }}
          className="h-4 rounded"
        />
      </div>

      {/* Score and Streak */}
      <div className="text-2xl font-bold mb-4 flex gap-4 items-center">
        🧠 {score} pts
        <StreakCounter streak={streak} previousStreak={streak - 1} />
      </div>

      {/* Proximity Heat */}
      <div className="w-full h-2 bg-black mb-6">
        <motion.div
          animate={{ width: `${proximity}%`, backgroundColor: proximity > 70 ? '#ff0000' : '#00ffcc' }}
          transition={{ duration: 0.5 }}
          className="h-2"
        />
      </div>

      {/* Question Card */}
      <div className="relative w-full max-w-xl">
        <AnimatePresence>
          {showResult && (
            <motion.div
              className={`absolute inset-0 ${showResult === 'correct' ? 'bg-green-500' : 'bg-red-600'} rounded`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {questions.length > 0 && current < questions.length ? (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-800 rounded-2xl shadow-lg flex flex-col gap-4"
          >
            <h2 className="text-2xl font-bold mb-4">{questions[current]?.prompt}</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(questions[current]?.choices).map(([key, value], index) => (
                <motion.button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={locked || eliminatedChoices.includes(key)}
                  className={`p-4 rounded-lg text-lg font-bold transition ${
                    eliminatedChoices.includes(key) ? 'opacity-40 line-through' : 'bg-mathGreen text-black hover:bg-white'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {key}: {value}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <p className="text-center text-mathGreen mt-20 text-xl">Loading questions...</p>
        )}
      </div>

      {/* Reward Modal */}
      {showReward && (
        <RewardModal show={!!showReward} rewardName={showReward} onClose={() => setShowReward(null)} />
      )}
    </main>
  )
}
