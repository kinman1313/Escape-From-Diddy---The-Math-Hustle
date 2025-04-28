// components/GameTutorial.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/Tutorial.module.css'

type TutorialProps = {
  onComplete: () => void
}

type TutorialStep = {
  title: string
  content: string
  image?: string
}

export default function GameTutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Escape from Diddy!",
      content: "In this game, you'll need to answer math questions correctly to avoid being caught by Diddy. Let's learn how to play!",
      image: "/tutorial/intro.png" // You would need to create these tutorial images
    },
    {
      title: "Answer Questions",
      content: "Each question has multiple choices. Select the correct answer before the timer runs out!",
      image: "/tutorial/questions.png"
    },
    {
      title: "Watch the Timer",
      content: "The green bar shows your remaining time. It turns yellow, then red as time runs out!",
      image: "/tutorial/timer.png"
    },
    {
      title: "Diddy Proximity",
      content: "Wrong answers increase the Diddy Proximity meter. If it fills up completely, you're caught!",
      image: "/tutorial/proximity.png"
    },
    {
      title: "Build Your Streak",
      content: "Consecutive correct answers build your streak, earning you bonus points and special gear!",
      image: "/tutorial/streak.png"
    },
    {
      title: "Use Powerups",
      content: "You'll unlock powerups as you play. Use them strategically to help in difficult situations!",
      image: "/tutorial/powerups.png"
    }
  ]
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }
  
  const handleSkip = () => {
    onComplete()
  }
  
  return (
    <motion.div 
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.tutorialCard}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.stepContent}
          >
            <h2 className={styles.stepTitle}>{tutorialSteps[currentStep].title}</h2>
            
            {tutorialSteps[currentStep].image && (
              <div className={styles.imageContainer}>
                <img 
                  src={tutorialSteps[currentStep].image}
                  alt={`Tutorial step ${currentStep + 1}`}
                  className={styles.tutorialImage}
                />
              </div>
            )}
            
            <p className={styles.stepText}>{tutorialSteps[currentStep].content}</p>
            
            <div className={styles.progressDots}>
              {tutorialSteps.map((_, index) => (
                <span 
                  key={index} 
                  className={`${styles.dot} ${index === currentStep ? styles.activeDot : ''}`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className={styles.tutorialControls}>
          <button onClick={handleSkip} className={styles.skipButton}>
            Skip Tutorial
          </button>
          <button onClick={handleNext} className={styles.nextButton}>
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Start Game'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}