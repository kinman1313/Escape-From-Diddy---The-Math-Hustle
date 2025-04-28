// components/FeedbackModal.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type FeedbackProps = {
  isCorrect: boolean;
  message?: string;
  duration?: number;
}

export default function FeedbackModal({ 
  isCorrect, 
  message,
  duration = 1000 
}: FeedbackProps) {
  const [feedbackMessages] = useState({
    correct: [
      "Correct! 🔥",
      "Nice work! 🧠",
      "Math genius! ✨",
      "You got it! 👏",
      "Perfect! 💯"
    ],
    incorrect: [
      "Wrong! 😬",
      "Not quite! 🤔",
      "Try again! 📝",
      "Oops! 🚫",
      "Diddy's getting closer! 🏃‍♂️"
    ]
  })
  
  const [displayMessage, setDisplayMessage] = useState<string>('')
  
  useEffect(() => {
    // Use provided message or select random one from array
    if (message) {
      setDisplayMessage(message)
    } else {
      const messages = isCorrect ? feedbackMessages.correct : feedbackMessages.incorrect
      const randomIndex = Math.floor(Math.random() * messages.length)
      setDisplayMessage(messages[randomIndex])
    }
  }, [isCorrect, message, feedbackMessages])
  
  // Variants for animations
  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: -50,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0,
      y: 50,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  }
  
  // Particle effect for correct answers
  const Particles = ({ count = 20 }) => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-300 opacity-70"
            initial={{ 
              x: '50%', 
              y: '50%',
              opacity: 1
            }}
            animate={{ 
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0,
              scale: [1, 0]
            }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    )
  }
  
  return (
    <motion.div
      className={`fixed z-50 top-1/4 left-1/2 transform -translate-x-1/2 px-10 py-5 rounded-xl shadow-2xl
        ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 rounded-xl blur-md -z-10 opacity-70
          ${isCorrect ? 'bg-green-400' : 'bg-red-500'}`} 
      />
      
      {/* Pulse animation ring */}
      <motion.div
        className={`absolute inset-0 rounded-xl -z-10
          ${isCorrect ? 'border-2 border-green-300' : 'border-2 border-red-300'}`}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      {/* Particles for correct answers */}
      {isCorrect && <Particles />}
      
      {/* Feedback content */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">
          {isCorrect ? '✅' : '❌'}
        </span>
        <span className="text-2xl font-bold">{displayMessage}</span>
      </div>
    </motion.div>
  )
}