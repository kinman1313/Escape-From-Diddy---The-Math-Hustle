import { AuthContext } from "@/components/AuthProvider"
import { useContext, useState, useEffect } from "react"
import { useRouter } from "next/router"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase" // Assuming this is where your db is initialized
import { motion, AnimatePresence } from "framer-motion" // Based on other motion usage in code
import useTimer from "@/hooks/useTimer"
import { playSound, playRandomHypeClip } from '@/lib/soundManager'
import LoadingScreen from "@/components/LoadingScreen"
import Cutscene from "@/components/Cutscene"
import DiddyMeter from "@/components/DiddyMeter"
import NavBar from "@/components/NavBar"
import FeedbackModal from "@/components/FeedbackModal"
import RewardModal from "@/components/RewardModal"

// Define the question structure
type Question = {
  prompt: string;
  choices: Record<string, string | number>;
  answer: string;
};

// Create the original questions array
const originalQuestions: Question[] = [
  {
    prompt: "What is 9 + 10?",
    choices: { "A": 19, "B": 21, "C": 91, "D": 910 },
    answer: "A"
  },
  {
    prompt: "Solve for x: 2x + 5 = 15",
    choices: { "A": 5, "B": 7.5, "C": 10, "D": 5.5 },
    answer: "A"
  },
  {
    prompt: "What is the square root of 64?",
    choices: { "A": 6, "B": 8, "C": 32, "D": 4 },
    answer: "B"
  },
  // Add more questions as needed
];

const avatarMap: Record<string, { icon: string; label: string }> = {
  default: { icon: '🧍', label: 'Default' },
  'diddy-duck': { icon: '🎩', label: 'Diddy Duck' },
  'math-monkey': { icon: '🧠', label: 'Math Monkey' },
  'puff-algorithm': { icon: '🤖', label: 'Puff Algorithm' }
}

export default function Game() {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [cutsceneDone, setCutsceneDone] = useState(false)

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
  const [showReward, setShowReward] = useState<string | null>(null)

  const timeLimit = streak >= 5 ? 8 : 10
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
    }, 1500)
    return () => clearTimeout(timer)
  }, [feedback, loading])

const handleAnswer = async (option: keyof Question['choices'] | null) => {
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
      await updateDoc(ref, { gear: arrayUnion("Sean Jean Pocket Protector™") })
      playRandomHypeClip()
      setShowReward("Sean Jean Pocket Protector™")
    }
    if (newStreak === 5 && !gear.includes("Oh No You Diddy'nt Hypotenuse Bag™")) {
      await updateDoc(ref, { gear: arrayUnion("Oh No You Diddy'nt Hypotenuse Bag™") })
      playRandomHypeClip()
      setShowReward("Oh No You Diddy'nt Hypotenuse Bag™")
    }
    if (newStreak === 10 && !gear.includes("Burberry Legacy Puff Daddy Protractor™")) {
      await updateDoc(ref, { gear: arrayUnion("Burberry Legacy Puff Daddy Protractor™") })
      playRandomHypeClip()
      setShowReward("Burberry Legacy Puff Daddy Protractor™")
    }
  } else {
    setStreak(0)
    setProximity(proximity + 1)
  }

  await updateDoc(ref, {
    streak: correct ? streak + 1 : 0
  })

  setTimeout(() => {
    if (current === questions.length - 1) {
      const reshuffled = [...originalQuestions].sort(() => 0.5 - Math.random())
      setQuestions(reshuffled)
      setCurrent(0)
    } else {
      setCurrent((prev) => prev + 1)
    }
    setLocked(false)
  }, 1000)
}

  // 🚨 FINAL ORDER OF RENDER 🚨

  if (!user || loading || !playerData) return <LoadingScreen />

  if (!cutsceneDone) return <Cutscene onComplete={() => setCutsceneDone(true)} />

if (proximity >= 5) {
  useEffect(() => {
    const saveScore = async () => {
      if (!user) return
      const ref = doc(db, 'players', user.uid)
      await updateDoc(ref, {
        score: score,
        lastPlayed: new Date().toISOString()
      })
    }
    saveScore()
  }, [user, score])

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center text-center bg-black text-white">
      <motion.h1
        className="text-5xl font-bold mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        🚨 Busted by Diddy! 🚨
      </motion.h1>
      <motion.p
        className="text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        "Can't nobody hold me down... except Diddy."
      </motion.p>
      <button
        onClick={() => router.push('/leaderboard')}
        className="mt-6 bg-mathGreen text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
      >
        View Leaderboard
      </button>
    </motion.div>
  )
}


  // ✅ If you reach here, GAMEPAGE

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
          {showReward && <RewardModal reward={showReward} onClose={() => setShowReward(null)} />}
          <div className="text-sm font-bold">{user.displayName}</div>
          <div className="text-sm font-bold">{`Score: ${score}`}</div>
          <div className="text-sm font-bold">{`Streak: ${streak}`}</div>
          <div className="text-sm font-bold">{`Time Left: ${timeLeft.toFixed(0)}`}</div> 
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
          className={`h-full transition-all duration-500 ${barColor} ${timeLeft <= 3 ? 'animate-pulse' : ''}`}
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
                {key}: {String(value)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 
