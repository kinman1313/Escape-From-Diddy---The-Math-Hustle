// pages/game.tsx
import { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/components/AuthProvider'
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import useTimer from '@/hooks/useTimer'
import NavBar from '@/components/NavBar'
import DiddyMeter from '@/components/DiddyMeter'
import FeedbackModal from '@/components/FeedbackModal'
import LoadingScreen from '@/components/LoadingScreen'
import RewardModal from '@/components/RewardModal'
import GameTutorial from '@/components/GameTutorial'
import Cutscene from '@/components/Cutscene'
import dynamic from 'next/dynamic'
import { playSound, initAudioContext, playRandomSound, playStreakSound } from '@/lib/soundManager'

// Import questions directly (we'll handle shuffling later)
import originalQuestions from '@/data/questions.json'

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

// Define PlayerData type for better type safety
type PlayerData = {
  nickname?: string;
  avatar?: string;
  streak?: number;
  proximity?: number;
  score?: number;
  highScore?: number;
  gear?: string[];
  equipped?: {
    accessory?: string;
  };
  powerups?: {
    timeFreeze?: number;
    fiftyFifty?: number;
    repellent?: number;
  };
  hasSeenTutorial?: boolean;
}

type PowerupType = 'timeFreeze' | 'fiftyFifty' | 'repellent';

// Define the Question type for better type safety
type QuestionChoice = {
  [key: string]: string | number;
}

type Question = {
  id: number;
  prompt: string;
  choices: QuestionChoice;
  answer: string;
}

const avatarMap: Record<string, { icon: string; label: string }> = {
  default: { icon: '🧍', label: 'Default' },
  'diddy-duck': { icon: '🎩', label: 'Diddy Duck' },
  'math-monkey': { icon: '🧠', label: 'Math Monkey' },
  'puff-algorithm': { icon: '🤖', label: 'Puff Algorithm' }
}

export default function Game() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [proximity, setProximity] = useState(0)
  const [locked, setLocked] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null)
  const [showReward, setShowReward] = useState<string | null>(null)
  const [eliminatedChoices, setEliminatedChoices] = useState<string[]>([])
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [powerups, setPowerups] = useState({
    timeFreeze: 0,
    fiftyFifty: 0,
    repellent: 0
  })
  const [difficultyLevel, setDifficultyLevel] = useState(1)
  const [showTutorial, setShowTutorial] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [cutsceneDone, setCutsceneDone] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  const [shouldShowConfetti, setShouldShowConfetti] = useState(false)
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate time limit based on difficulty
  const getTimeLimit = useCallback(() => {
    const baseTime = 12
    const reduction = Math.min(4, Math.floor(difficultyLevel / 2))
    return baseTime - reduction
  }, [difficultyLevel])
  
  const timeLimit = getTimeLimit()
  const timeLeft = useTimer(
    timeLimit,
    () => {
      if (!isTimerPaused) {
        playSound('timeout', 'do-wa-diddy')
        handleAnswer(null)
      }
    },
    !locked && !isTimerPaused && cutsceneDone
  )

  // Handle first user interaction to initialize audio
  const handleFirstInteraction = useCallback(() => {
    if (!audioInitialized) {
      initAudioContext()
      setAudioInitialized(true)
    }
  }, [audioInitialized])

  // Add event listener for first interaction
  useEffect(() => {
    const initAudio = () => {
      handleFirstInteraction()
      // Remove listener after first click
      document.removeEventListener('click', initAudio)
    }
    
    document.addEventListener('click', initAudio)
    return () => {
      document.removeEventListener('click', initAudio)
    }
  }, [handleFirstInteraction])

  // Update window size for confetti
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

  // Cleanup confetti timeout
  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current)
      }
    }
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  // Shuffle questions when component mounts or difficulty changes
  useEffect(() => {
    // Create a copy of the original questions to shuffle
    const shuffled = [...originalQuestions].sort(() => 0.5 - Math.random())
    setQuestions(shuffled)
  }, [difficultyLevel])

  // Update difficulty based on streak
  useEffect(() => {
    if (streak >= 10) {
      setDifficultyLevel(3) // Hard
    } else if (streak >= 5) {
      setDifficultyLevel(2) // Medium
    } else {
      setDifficultyLevel(1) // Easy
    }
  }, [streak])

  // Fetch player data from Firestore
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user) return
      const ref = doc(db, 'players', user.uid)
      const snap = await getDoc(ref)
      
      if (snap.exists()) {
        const data = snap.data() as PlayerData
        setPlayerData(data)
        setStreak(data.streak || 0)
        setProximity(data.proximity || 0)
        setScore(data.score || 0)
        setHighScore(data.highScore || 0)
        setPowerups({
          timeFreeze: data.powerups?.timeFreeze || 2,
          fiftyFifty: data.powerups?.fiftyFifty || 1,
          repellent: data.powerups?.repellent || 1
        })
      }

      // Display loading screen for a few seconds to build anticipation
      setTimeout(() => {
        setLoading(false)
        if (snap.exists() && !snap.data().hasSeenTutorial) {
          setShowTutorial(true)
          updateDoc(ref, {
            hasSeenTutorial: true
          }).catch(error => {
            console.error("Error updating hasSeenTutorial:", error)
          })
        }
      }, 3000)
    }
    
    fetchPlayerData()
  }, [user])

  // Clear feedback after timeout
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      setFeedback(null)
      setShowResult(null)
    }, 1000)
    return () => clearTimeout(timer)
  }, [feedback, loading])

  // Handle answer selection
  const handleAnswer = async (option: string | null) => {
    if (locked) return
    setLocked(true)

    if (!user) {
      router.push('/login')
      return
    }

    // For type safety, check if current question exists
    const currentQuestion = questions[current]
    if (!currentQuestion) {
      setLocked(false)
      return
    }

    const ref = doc(db, 'players', user.uid)
    const correct = option !== null && currentQuestion.answer === option

    playSound(correct ? 'correct' : 'wrong')
    setFeedback(correct ? 'correct' : 'wrong')
    setShowResult(correct ? 'correct' : 'wrong')
    setTotalQuestions(prev => prev + 1)

    if (correct) {
      const newStreak = streak + 1
      const newScore = score + calculatePoints(timeLeft, difficultyLevel)
      setScore(newScore)
      setStreak(newStreak)
      setProximity(Math.max(0, proximity - 1))
      setCorrectAnswers(prev => prev + 1)

      // Check for streak milestones to show confetti
      if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
        setShouldShowConfetti(true)
        // Hide confetti after 3 seconds
        confettiTimeoutRef.current = setTimeout(() => {
          setShouldShowConfetti(false)
        }, 3000)
      }

      // Check if this is a new high score
      if (newScore > highScore) {
        setHighScore(newScore)
      }

      const snap = await getDoc(ref)
      const gear = snap.exists() ? snap.data().gear || [] : []

      // Award new gear based on streak milestones
      if (newStreak === 3 && !gear.includes("Sean Jean Pocket Protector™")) {
        await updateDoc(ref, {
          gear: arrayUnion("Sean Jean Pocket Protector™"),
          score: newScore,
          streak: newStreak,
          highScore: Math.max(newScore, highScore),
          "powerups.timeFreeze": increment(1) // Award a time freeze powerup
        })
        playStreakSound(3)
        setShowReward("Sean Jean Pocket Protector™")
        
        // Update local powerups state
        setPowerups(prev => ({
          ...prev,
          timeFreeze: prev.timeFreeze + 1
        }))
      } else if (newStreak === 5 && !gear.includes("Oh No You Diddy'nt Hypotenuse Bag™")) {
        await updateDoc(ref, {
          gear: arrayUnion("Oh No You Diddy'nt Hypotenuse Bag™"),
          score: newScore,
          streak: newStreak,
          highScore: Math.max(newScore, highScore),
          "powerups.fiftyFifty": increment(1) // Award a fifty-fifty powerup
        })
        playStreakSound(5)
        setShowReward("Oh No You Diddy'nt Hypotenuse Bag™")
        
        // Update local powerups state
        setPowerups(prev => ({
          ...prev,
          fiftyFifty: prev.fiftyFifty + 1
        }))
      } else if (newStreak === 10 && !gear.includes("Burberry Legacy Puff Daddy Protractor™")) {
        await updateDoc(ref, {
          gear: arrayUnion("Burberry Legacy Puff Daddy Protractor™"),
          score: newScore,
          streak: newStreak,
          highScore: Math.max(newScore, highScore),
          "powerups.repellent": increment(1) // Award a Diddy repellent powerup
        })
        playStreakSound(10)
        setShowReward("Burberry Legacy Puff Daddy Protractor™")
        
        // Update local powerups state
        setPowerups(prev => ({
          ...prev,
          repellent: prev.repellent + 1
        }))
      } else {
        // Just update score and streak if no new gear
        await updateDoc(ref, {
          score: newScore,
          streak: newStreak,
          highScore: Math.max(newScore, highScore)
        })
      }
    } else {
      // Wrong answer - reset streak and increase proximity
      setStreak(0)
      const newProximity = proximity + 1
      setProximity(newProximity)
      
      // Reset streak in database
      await updateDoc(ref, {
        streak: 0,
        proximity: newProximity
      })
      
      // Check if game is over due to proximity
      if (newProximity >= 5) {
        setIsGameOver(true)
        // Save final score
        await updateDoc(ref, {
          score: score,
          highScore: Math.max(score, highScore),
          proximity: 0 // Reset proximity for next game
        })
      }
    }

    // Reset eliminated choices when moving to next question
    setEliminatedChoices([])
    
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % questions.length)
      setLocked(false)
    }, 1000)
  }
  
  // Calculate points based on time left and difficulty
  const calculatePoints = (timeLeft: number, difficultyLevel: number) => {
    const basePoints = 10
    const timeBonus = Math.floor(timeLeft * 2)
    const difficultyMultiplier = difficultyLevel
    return basePoints + timeBonus * difficultyMultiplier
  }
  
  // Powerup handling functions
  const usePowerup = (type: PowerupType) => {
    if (powerups[type] <= 0) return
    
    playSound('powerup', 'correct')
    
    switch (type) {
      case 'timeFreeze':
        // Pause the timer for 5 seconds
        setIsTimerPaused(true)
        setTimeout(() => {
          setIsTimerPaused(false)
        }, 5000)
        break
        
      case 'fiftyFifty':
        // Eliminate two wrong answers
        if (questions[current]) {
          const correctAnswer = questions[current].answer
          const choices = Object.keys(questions[current].choices).filter(key => key !== correctAnswer)
          // Randomly select two wrong answers to eliminate
          const shuffledChoices = choices.sort(() => 0.5 - Math.random())
          const toEliminate = shuffledChoices.slice(0, Math.min(2, shuffledChoices.length))
          setEliminatedChoices(toEliminate)
        }
        break
        
      case 'repellent':
        // Reduce proximity by 2
        setProximity(Math.max(0, proximity - 2))
        break
    }
    
    // Update powerups count locally
    setPowerups(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }))
    
    // Update powerups in database
    if (user) {
      const ref = doc(db, 'players', user.uid)
      updateDoc(ref, {
        [`powerups.${type}`]: increment(-1)
      })
    }
  }

  // Reset the game
  const resetGame = () => {
    setIsGameOver(false)
    setScore(0)
    setStreak(0)
    setProximity(0)
    setCurrent(0)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    
    // Shuffle questions again
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    setQuestions(shuffled)
  }

  // Early returns for special states
  if (!user || loading || !playerData) return <LoadingScreen />
  
  // Show tutorial for new players
  if (showTutorial) {
    return <GameTutorial onComplete={() => setShowTutorial(false)} />
  }
  
  // Show cutscene before game starts
  if (!cutsceneDone) {
    return (
      <div onClick={handleFirstInteraction}>
        <Cutscene 
          onComplete={() => {
            setCutsceneDone(true)
            // Play a sound when cutscene ends
            playSound('i-like-this', 'correct')
          }} 
        />
      </div>
    )
  }
  
  // Game over screen
  if (isGameOver) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-4 bg-midnight">
          <h1 className="text-4xl font-bold text-red-500 mb-4">💥 Busted by Diddy!</h1>
          <p className="text-xl text-white mb-6">You couldn't outrun the hustle.</p>
          
          <div className="bg-white text-black p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-mathGreen">Your Stats</h2>
            <div className="grid grid-cols-2 gap-y-3 text-left">
              <div className="font-semibold">Final Score:</div>
              <div className="text-right font-bold">{score}</div>
              
              <div className="font-semibold">High Score:</div>
              <div className="text-right font-bold">{highScore}</div>
              
              <div className="font-semibold">Questions Answered:</div>
              <div className="text-right font-bold">{totalQuestions}</div>
              
              <div className="font-semibold">Correct Answers:</div>
              <div className="text-right font-bold">{correctAnswers}</div>
              
              <div className="font-semibold">Accuracy:</div>
              <div className="text-right font-bold">
                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-mathGreen text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
              >
                View Leaderboard
              </button>
              
              <button
                onClick={resetGame}
                className="bg-diddyDanger text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const percentLeft = (timeLeft / timeLimit) * 100
  
  // Get the appropriate color class for the timer bar
  const getBarColorClass = () => {
    if (timeLeft > (timeLimit * 0.6)) return "bg-green-500";
    if (timeLeft > (timeLimit * 0.3)) return "bg-yellow-400";
    return "bg-red-600";
  };

  const avatar = avatarMap[playerData.avatar || 'default']
  const equippedAccessory = playerData.equipped?.accessory

  return (
    <>
      <NavBar />
      <div 
        className="min-h-screen flex flex-col items-center justify-center gap-4 py-4 bg-midnight"
        onClick={handleFirstInteraction}
      >
        {/* Show confetti for milestones */}
        {shouldShowConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.15}
            colors={['#00ffcc', '#ff003c', '#030a1c', '#ffffff']}
          />
        )}
        
        {/* Score and Streak Display */}
        <div className="absolute top-4 right-4 bg-mathGreen text-black px-4 py-2 rounded-full font-bold flex items-center gap-2">
          <span className="text-xl">🧮</span>
          <span className="text-lg">{score}</span>
        </div>
        
        {streak > 0 && (
          <div className={`absolute top-16 right-4 bg-midnight text-mathGreen px-3 py-1 rounded-full text-sm font-bold
            ${streak >= 3 ? 'animate-pulse' : ''}`}>
            🔥 Streak: {streak}
          </div>
        )}
        
        {/* Avatar Display */}
        <div className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-3 mb-2">
          <div className="text-3xl">{avatar.icon}</div>
          <div className="text-sm font-bold">{avatar.label}</div>
          {equippedAccessory && (
            <div className="ml-2 px-2 py-1 bg-mathGreen text-black text-xs font-semibold rounded">
              {equippedAccessory}
            </div>
          )}
        </div>

        <AnimatePresence>
          {feedback && <FeedbackModal isCorrect={feedback === 'correct'} />}
        </AnimatePresence>
        
        {showReward && (
          <RewardModal 
            reward={showReward} 
            onClose={() => setShowReward(null)} 
          />
        )}

        <DiddyMeter level={proximity} />
        
        {/* Powerups */}
        <div className="flex gap-3 mb-2">
          <button 
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center relative
              ${powerups.timeFreeze > 0 ? 'bg-black border-2 border-mathGreen text-mathGreen' : 'bg-gray-800 text-gray-500'}`}
            onClick={() => usePowerup('timeFreeze')}
            disabled={powerups.timeFreeze <= 0 || isTimerPaused}
          >
            <span className="text-xl">⏱️</span>
            {powerups.timeFreeze > 0 && (
              <span className="absolute -top-1 -right-1 bg-midnight text-white w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full border border-mathGreen">
                {powerups.timeFreeze}
              </span>
            )}
            <span className="absolute -bottom-6 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
              Freeze Time
            </span>
          </button>
          
          <button 
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center relative
              ${powerups.fiftyFifty > 0 ? 'bg-black border-2 border-mathGreen text-mathGreen' : 'bg-gray-800 text-gray-500'}`}
            onClick={() => usePowerup('fiftyFifty')}
            disabled={powerups.fiftyFifty <= 0 || eliminatedChoices.length > 0}
          >
            <span className="text-xl">½</span>
            {powerups.fiftyFifty > 0 && (
              <span className="absolute -top-1 -right-1 bg-midnight text-white w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full border border-mathGreen">
                {powerups.fiftyFifty}
              </span>
            )}
          </button>
          
          <button 
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center relative
              ${powerups.repellent > 0 ? 'bg-black border-2 border-mathGreen text-mathGreen' : 'bg-gray-800 text-gray-500'}`}
            onClick={() => usePowerup('repellent')}
            disabled={powerups.repellent <= 0 || proximity === 0}
          >
            <span className="text-xl">🛡️</span>
            {powerups.repellent > 0 && (
              <span className="absolute -top-1 -right-1 bg-midnight text-white w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full border border-mathGreen">
                {powerups.repellent}
              </span>
            )}
          </button>
        </div>

        {/* Timer Bar */}
        <div className="w-full max-w-xl h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColorClass()} transition-all duration-300 ease-out
              ${isTimerPaused ? 'animate-pulse' : ''}`}
            style={{ width: `${percentLeft}%` }}
          ></div>
        </div>

        {/* Difficulty indicator */}
        <div className="text-xs text-mathGreen">
          Difficulty: {difficultyLevel === 1 ? 'Easy' : difficultyLevel === 2 ? 'Medium' : 'Hard'}
        </div>

        {/* Question Card */}
        <div className="bg-white text-black p-6 rounded-xl w-full max-w-xl shadow-lg relative">
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10 
                ${showResult === 'correct' ? 'bg-green-500' : 'bg-red-500'} bg-opacity-90`}
            >
              <div className="text-5xl mb-2">
                {showResult === 'correct' ? '✅' : '❌'}
              </div>
              <div className="text-2xl font-bold text-white">
                {showResult === 'correct' ? 'Correct!' : 'Wrong!'}
              </div>
            </motion.div>
          )}

          {questions.length > 0 && current < questions.length ? (
            <>
              <h2 className="text-xl font-bold mb-6">{questions[current]?.prompt}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[current] && Object.entries(questions[current].choices).map(([key, value]) => (
                  <button
                    key={key}
                    className={`px-4 py-3 bg-mathGreen text-black font-semibold rounded-lg hover:scale-105 transition-transform
                      ${eliminatedChoices.includes(key) ? 'opacity-30 line-through' : ''}`}
                    onClick={() => handleAnswer(key)}
                    disabled={locked || eliminatedChoices.includes(key)}
                  >
                    <span className="font-bold mr-1">{key}:</span>
                    <span>{typeof value === 'string' || typeof value === 'number' ? value : ''}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p>Loading questions...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}