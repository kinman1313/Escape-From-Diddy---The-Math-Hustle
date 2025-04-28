// pages/game.tsx
import '@/styles/globals.css'
import styles from '@/styles/Game.module.css'
import originalQuestions from '@/data/questions.json'
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
import { playSound, initAudioContext, playRandomSound, playStreakSound } from '@/lib/soundManager'

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
}

type PowerupType = 'timeFreeze' | 'fiftyFifty' | 'repellent';

const avatarMap: Record<string, { icon: string; label: string }> = {
  default: { icon: '🧍', label: 'Default' },
  'diddy-duck': { icon: '🎩', label: 'Diddy Duck' },
  'math-monkey': { icon: '🧠', label: 'Math Monkey' },
  'puff-algorithm': { icon: '🤖', label: 'Puff Algorithm' }
}

export default function Game() {
  const { user } = useContext(AuthContext)
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
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
  const [showCelebration, setShowCelebration] = useState(false)

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

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  // Hide celebration after timeout
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showCelebration])

useEffect(() => {
  // Shuffle questions based on difficulty level
  const shuffled = [...originalQuestions].sort(() => 0.5 - Math.random())
  setQuestions(shuffled)
}, [difficultyLevel])

  useEffect(() => {
    // Increase difficulty based on streak
    if (streak >= 10) {
      setDifficultyLevel(3) // Hard
    } else if (streak >= 5) {
      setDifficultyLevel(2) // Medium
    } else {
      setDifficultyLevel(1) // Easy
    }
  }, [streak])

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

      // Display loading screen for 5 seconds
setTimeout(() => {
  setLoading(false);
  if (snap.exists() && !snap.data().hasSeenTutorial) {
    setShowTutorial(true);
    updateDoc(ref, {
      hasSeenTutorial: true
    }).then(() => {
      // Any code that needs to run after update completes
    }).catch(error => {
      console.error("Error updating hasSeenTutorial:", error);
    });
  }
}, 5000);

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

      // Check for streak milestones to show celebration
      if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
        setShowCelebration(true)
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
      setProximity(proximity + 1)
      
      // Reset streak in database
      await updateDoc(ref, {
        streak: 0
      })
      
      // Check if game is over due to proximity
      if (proximity + 1 >= 5) {
        setIsGameOver(true)
        // Save final score
        await updateDoc(ref, {
          score: score,
          highScore: Math.max(score, highScore)
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

  // Early returns
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
        <div className={styles.gameOverContainer}>
          <h1 className={styles.gameOverTitle}>💥 Busted by Diddy!</h1>
          <p className={styles.gameOverMessage}>You couldn't outrun the hustle.</p>
          
          <div className={styles.gameOverStats}>
            <h2 className={styles.statsTitle}>Your Stats</h2>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Final Score:</span>
              <span className={styles.statValue}>{score}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>High Score:</span>
              <span className={styles.statValue}>{highScore}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Questions Answered:</span>
              <span className={styles.statValue}>{totalQuestions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Correct Answers:</span>
              <span className={styles.statValue}>{correctAnswers}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Accuracy:</span>
              <span className={styles.statValue}>
                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/leaderboard')}
            className={styles.gameOverButton}
          >
            View Leaderboard
          </button>
          
          <button
            onClick={() => {
              setIsGameOver(false)
              setScore(0)
              setStreak(0)
              setProximity(0)
              setCurrent(0)
              setTotalQuestions(0)
              setCorrectAnswers(0)
              const shuffled = [...questions].sort(() => 0.5 - Math.random())
              setQuestions(shuffled)
            }}
            className={styles.gameOverButton}
          >
            Try Again
          </button>
        </div>
      </>
    )
  }

  const percentLeft = (timeLeft / timeLimit) * 100
  
  // Get the appropriate color class for the timer bar
  const getBarColorClass = () => {
    if (timeLeft > (timeLimit * 0.6)) return styles.barGreen;
    if (timeLeft > (timeLimit * 0.3)) return styles.barYellow;
    return styles.barRed;
  };

  const avatar = avatarMap[playerData.avatar || 'default']
  const equippedAccessory = playerData.equipped?.accessory

  return (
    <>
      <NavBar />
      <div 
        className={styles.gameContainer} 
        onClick={handleFirstInteraction}
      >
        {/* Custom celebration effects for milestones */}
        {showCelebration && (
          <div className={styles.celebrationOverlay}>
            <div className={styles.celebrationEmoji}>
              {Array.from({ length: 20 }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * window.innerWidth - window.innerWidth/2, 
                    y: Math.random() * window.innerHeight - window.innerHeight/2,
                    rotate: Math.random() * 360
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [0, -100 - Math.random() * 200]
                  }}
                  transition={{ 
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5
                  }}
                  className={styles.celebrationItem}
                >
                  {['🎉', '🎊', '✨', '⭐', '🔥', '🧮', '🧠'][Math.floor(Math.random() * 7)]}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        
        {/* Score and Streak Display */}
        <div className={styles.scoreContainer}>
          <span className={styles.scoreIcon}>🧮</span>
          <span className={styles.scoreValue}>{score}</span>
        </div>
        
        {streak > 0 && (
          <div className={`${styles.streakBadge} ${streak >= 3 ? styles.streakActive : ''}`}>
            🔥 Streak: {streak}
          </div>
        )}
        
        {/* Avatar Display */}
        <div className={styles.avatarContainer}>
          <div className={styles.avatarIcon}>{avatar.icon}</div>
          <div className={styles.avatarLabel}>{avatar.label}</div>
          {equippedAccessory && (
            <div className={styles.accessory}>
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
        <div className={styles.powerupsContainer}>
          <button 
            className={styles.powerupButton}
            onClick={() => usePowerup('timeFreeze')}
            disabled={powerups.timeFreeze <= 0 || isTimerPaused}
          >
            <span className={styles.powerupIcon}>⏱️</span>
            {powerups.timeFreeze > 0 && (
              <span className={styles.powerupCount}>{powerups.timeFreeze}</span>
            )}
            <span className={styles.tooltip}>Freeze Time (5s)</span>
          </button>
          
          <button 
            className={styles.powerupButton}
            onClick={() => usePowerup('fiftyFifty')}
            disabled={powerups.fiftyFifty <= 0 || eliminatedChoices.length > 0}
          >
            <span className={styles.powerupIcon}>½</span>
            {powerups.fiftyFifty > 0 && (
              <span className={styles.powerupCount}>{powerups.fiftyFifty}</span>
            )}
            <span className={styles.tooltip}>50/50</span>
          </button>
          
          <button 
            className={styles.powerupButton}
            onClick={() => usePowerup('repellent')}
            disabled={powerups.repellent <= 0 || proximity === 0}
          >
            <span className={styles.powerupIcon}>🛡️</span>
            {powerups.repellent > 0 && (
              <span className={styles.powerupCount}>{powerups.repellent}</span>
            )}
            <span className={styles.tooltip}>Diddy Repellent</span>
          </button>
        </div>

        {/* Timer Bar */}
        <div className={styles.timerContainer}>
          <div
            className={`${styles.barProgress} ${getBarColorClass()} ${isTimerPaused ? styles.paused : ''}`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>

        {/* Difficulty indicator */}
        <div className="text-xs text-mathGreen mb-1">
          Difficulty: {difficultyLevel === 1 ? 'Easy' : difficultyLevel === 2 ? 'Medium' : 'Hard'}
        </div>

        {/* Question Card */}
        <div className={styles.questionCard}>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.resultOverlay} ${
                showResult === 'correct' ? styles.resultCorrect : styles.resultWrong
              }`}
            >
              <div className={styles.resultIcon}>
                {showResult === 'correct' ? '✅' : '❌'}
              </div>
              <div className={styles.resultText}>
                {showResult === 'correct' ? 'Correct!' : 'Wrong!'}
              </div>
            </motion.div>
          )}

          {questions.length > 0 && current < questions.length ? (
            <>
              <h2 className={styles.questionPrompt}>{questions[current]?.prompt}</h2>
              <div className={styles.choicesGrid}>
                {questions[current] && Object.entries(questions[current].choices).map(([key, value]) => (
                  <button
                    key={key}
                    className={styles.choiceButton}
                    onClick={() => handleAnswer(key)}
                    disabled={locked || eliminatedChoices.includes(key)}
                    style={eliminatedChoices.includes(key) ? { opacity: 0.3, textDecoration: 'line-through' } : {}}
                  >
                    <span className={styles.choiceKey}>{key}:</span>
                    <span className={styles.choiceValue}>{String(value)}</span>
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