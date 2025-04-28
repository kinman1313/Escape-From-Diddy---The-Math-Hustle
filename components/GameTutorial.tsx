// components/GameTutorial.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TutorialProps = {
  onComplete: () => void;
}

type TutorialStep = {
  title: string;
  content: string;
  image?: string;
  icon?: string;
}

export default function GameTutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Escape from Diddy!",
      content: "In this game, you'll need to answer math questions correctly to avoid being caught by Diddy. Get ready for a wild mathematical adventure!",
      icon: "🧮",
      image: "/tutorial/intro.png" // These tutorial images would need to be created
    },
    {
      title: "Answer Questions",
      content: "Each question has multiple choices. Select the correct answer before the timer runs out!",
      icon: "❓",
      image: "/tutorial/questions.png"
    },
    {
      title: "Watch the Timer",
      content: "The green bar shows your remaining time. It turns yellow, then red as time runs out!",
      icon: "⏱️",
      image: "/tutorial/timer.png"
    },
    {
      title: "Diddy Proximity",
      content: "Wrong answers increase the Diddy Proximity meter. If it fills up completely, you're caught!",
      icon: "🏃",
      image: "/tutorial/proximity.png"
    },
    {
      title: "Build Your Streak",
      content: "Consecutive correct answers build your streak, earning you bonus points and legendary gear!",
      icon: "🔥",
      image: "/tutorial/streak.png"
    },
    {
      title: "Use Powerups",
      content: "You'll unlock powerups as you play. Use them strategically to help in difficult situations!",
      icon: "🛡️",
      image: "/tutorial/powerups.png"
    }
  ]
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'Escape') {
        handleSkip()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep])
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsExiting(true)
      setTimeout(onComplete, 300) // Wait for animation
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(onComplete, 300) // Wait for animation
  }
  
  const handleStepSelect = (index: number) => {
    setCurrentStep(index)
  }
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50 p-4"
      variants={overlayVariants}
      initial="hidden"
      animate={isExiting ? "exit" : "visible"}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white text-black rounded-xl w-full max-w-xl p-6 relative shadow-2xl overflow-hidden"
        variants={cardVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mathGreen to-diddyDanger" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* Step icon */}
            <motion.div
              className="w-16 h-16 rounded-full bg-mathGreen text-black flex items-center justify-center text-3xl mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {tutorialSteps[currentStep].icon}
            </motion.div>
            
            <h2 className="text-xl font-bold mb-4 text-center">
              {tutorialSteps[currentStep].title}
            </h2>
            
            {tutorialSteps[currentStep].image && (
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center border border-gray-200 overflow-hidden">
                <img 
                  src={tutorialSteps[currentStep].image}
                  alt={`Tutorial step ${currentStep + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            <p className="text-center text-gray-700 mb-6">
              {tutorialSteps[currentStep].content}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-4 mb-6">
          {tutorialSteps.map((_, index) => (
            <button 
              key={index} 
              className={`w-3 h-3 rounded-full transition-all
                ${index === currentStep ? 'bg-mathGreen scale-125' : 'bg-gray-300'}`}
              onClick={() => handleStepSelect(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Skip
            </button>
            
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-mathGreen text-black font-bold rounded-lg hover:brightness-105 transition-all"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Start Game'}
            </button>
          </div>
        </div>
        
        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Tip: Use arrow keys to navigate, Esc to skip
        </div>
      </motion.div>
    </motion.div>
  )
}