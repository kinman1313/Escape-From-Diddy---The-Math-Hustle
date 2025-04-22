// pages/game.tsx
import NavBar from '@/components/NavBar'
import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '@/components/AuthProvider'
import { useRouter } from 'next/router'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import questions from '@/data/questions.json'
import { Howl } from 'howler'
import DiddyMeter from '@/components/DiddyMeter'

export default function Game() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [proximity, setProximity] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!user) router.push('/')
  }, [user])

const handleAnswer = async (option: string) => {
  if (locked) return
  setLocked(true)

  const playerRef = doc(db, 'players', user!.uid)
  const correct = questions[current].answer === option

  const sound = new Howl({
    src: [correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3']
  })
  sound.play()

  if (correct) {
    const newStreak = streak + 1
    setScore(score + 1)
    setStreak(newStreak)
    setProximity(Math.max(0, proximity - 1))

    if (newStreak === 3) {
      await updateDoc(playerRef, {
        gear: arrayUnion("Sean Jean Pocket Protector™")
      })
    }
  } else {
    setStreak(0)
    setProximity(proximity + 1)
  }

  await updateDoc(playerRef, {
    streak: correct ? streak + 1 : 0
  })

  setTimeout(() => {
    setCurrent((prev) => (prev + 1) % questions.length)
    setLocked(false)
  }, 1000)
}

  if (!user) return null

return (
  <>
    <NavBar />
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6">
      <DiddyMeter level={proximity} />
      <div className="bg-white text-black p-6 rounded-xl shadow-xl w-[90%] max-w-xl">
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