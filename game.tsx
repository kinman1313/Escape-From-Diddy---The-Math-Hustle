// pages/game.tsx
import '@/styles/globals.css'
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Howl } from 'howler'
import { AuthContext } from '@/components/AuthProvider'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import useTimer from '@/hooks/useTimer'
import NavBar from '@/components/NavBar'
import DiddyMeter from '@/components/DiddyMeter'
import FeedbackModal from '@/components/FeedbackModal'
import LoadingScreen from '@/components/LoadingScreen'
import originalQuestions from '@/data/questions.json'

const avatarMap: Record<string, { icon: string; label: string }> = {
  default: { icon: '🧍', label: 'Default' },
  'diddy-duck': { icon: '🎩', label: 'Diddy Duck' },
  'math-monkey': { icon: '🧠', label: 'Math Monkey' },
  'puff-algorithm': { icon: '🤖', label: 'Puff Algorithm' }
}

export default function Game() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [questions, setQuestions] = useState<typeof originalQuestions>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [proximity, setProximity] = useState(0)
  const [locked, setLocked] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [playerData, setPlayerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null)

  const timeLimit = 10
  const timeLeft = useTimer(
    timeLimit,
    () => {
      playSound('timeout')
      handleAnswer(null)
    },
    !locked
  )

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  useEffect(() => {
    const shuffled = [...originalQuestions].sort(() => 0.5 - Math.random())
    setQuestions(shuffled)
  }, [])

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user) return
      const ref = doc(db, 'players', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setPlayerData(data)
        setStreak(data.streak || 0)
        setProximity(data.proximity || 0)
      }
      setLoading(false)
    }
    fetchPlayerData()
  }, [user])

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      setFeedback(null)
      setShowResult(null)
    }, 1000)
    return () => clearTimeout(timer)
  }, [feedback, loading])

  const playSound = (key: string) => {
    let file = '/sounds/correct.mp3'
    if (key === 'wrong') file = '/sounds/wrong.mp3'
    if (key === 'timeout') file = '/sounds/do-wa-diddy.mp3'
    if (key === 'streak') file = '/sounds/i-like-this.mp3'
    const sound = new Howl({ src: [file] })
    sound.play()
  }

  const handleAnswer = async (option: string | null) => {
    if (locked) return
    setLocked(true)

    const ref = doc(db, 'players', user!.uid)
    const correct = option !== null && questions[current].answer === option

    playSound(correct ? 'correct' : 'wrong')
    setFeedback(correct ? 'correct' : 'wrong')
    setShowResult(correct ? 'correct' : 'wrong')

    if (correct) {
      const newStreak = streak + 1
      setScore(score + 1)
      setStreak(newStreak)
      setProximity(Math.max(0, proximity - 1))

      const snap = await getDoc(ref)
      const gear = snap.exists() ? snap.data().gear || [] : []

      if (newStreak === 3 && !gear.includes("Sean Jean Pocket Protector™")) {
        await updateDoc(ref, {
          gear: arrayUnion("Sean Jean Pocket Protector™")
        })
        playSound('streak')
      }
    } else {
      setStreak(0)
      setProximity(proximity + 1)
    }

    await updateDoc(ref, {
      streak: correct ? streak + 1 : 0
    })

    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % questions.length)
      setLocked(false)
    }, 1000)
  }

  if (!user || loading || !playerData) return <LoadingScreen />

  const percentLeft = (timeLeft / timeLimit) * 100
  const barColor = timeLeft > 6 ? 'bg-green-400' : timeLeft > 3 ? 'bg-yellow-400' : 'bg-red-600'
  const avatar = avatarMap[playerData.avatar || 'default']
  const equippedAccessory = playerData.equipped?.accessory

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4">
        <div className="flex items-center justify-center gap-4 text-lg bg-white text-black p-3 rounded-lg shadow">
          <div className="text-4xl">{avatar.icon}</div>
          <div className="text-sm font-bold uppercase tracking-wider">{avatar.label}</div>
          {equippedAccessory && (
            <div className="ml-4 px-3 py-1 rounded bg-mathGreen text-black text-xs font-semibold shadow">
              {equippedAccessory}
            </div>
          )}
        </div>

        <AnimatePresence>
          {feedback && <FeedbackModal isCorrect={feedback === 'correct'} />}
        </AnimatePresence>

        <DiddyMeter level={proximity} />

        <div className="w-[90%] max-w-xl h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentLeft}%` }}
          ></div>
        </div>

        <div className="bg-white text-black p-6 rounded-xl shadow-xl w-[90%] max-w-xl relative">
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex items-center justify-center text-3xl font-bold text-white rounded-xl z-20
                ${showResult === 'correct' ? 'bg-green-500' : 'bg-red-600'} bg-opacity-90`}
            >
              {showResult === 'correct' ? '✅ Correct!' : '❌ Wrong!'}
            </motion.div>
          )}

          <h2 className="text-xl font-bold mb-4">{questions[current].prompt}</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(questions[current].choices).map(([key, value]) => (
              <button
                key={key}
                className="bg-mathGreen text-black p-3 rounded hover:scale-105 transition"
                onClick={() => handleAnswer(key)}
                disabled={locked}
              >
                {key}: {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
