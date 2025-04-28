// components/EnhancedFeedbackModal.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import styles from '@/styles/EnhancedFeedback.module.css'

type FeedbackProps = {
  isCorrect: boolean;
  message?: string;
  duration?: number;
  streakCount?: number;
}

export default function EnhancedFeedbackModal({ 
  isCorrect, 
  message,
  duration = 1000,
  streakCount = 0
}: FeedbackProps) {
  const [feedbackMessages] = useState({
    correct: [
      "Correct! 🔥",
      "Math genius! ✨",
      "You got it! 👏",
      "Great work! 🧠",
      "Impressive! 💯"
    ],
    incorrect: [
      "Oops! Not quite! 😬",
      "Try again! 📝",
      "Almost had it... 🤔",
      "Diddy's getting closer! 🏃‍♂️",
      "Not this time! 🚫"
    ]
  });
  
  const [displayMessage, setDisplayMessage] = useState<string>('');
  
  useEffect(() => {
    // Use provided message or select random one from array
    if (message) {
      setDisplayMessage(message);
    } else {
      const messages = isCorrect ? feedbackMessages.correct : feedbackMessages.incorrect;
      const randomIndex = Math.floor(Math.random() * messages.length);
      setDisplayMessage(messages[randomIndex]);
    }
  }, [isCorrect, message, feedbackMessages]);
  
  // Confetti-like particles for correct answers
  const Particles = () => {
    return (
      <div className={styles.particleContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            initial={{ 
              x: 0, 
              y: 0,
              scale: 0
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 200, 
              y: (Math.random() - 0.5) * 200,
              rotate: Math.random() * 360,
              scale: Math.random() * 0.5 + 0.5
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
            style={{
              background: isCorrect 
                ? `hsl(${Math.random() * 60 + 100}, 100%, 65%)` // Green/yellow hues
                : `hsl(${Math.random() * 60 + 340}, 100%, 65%)` // Red hues
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className={`${styles.modalContainer} ${isCorrect ? styles.correct : styles.wrong}`}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      {/* Background glow */}
      <div className={styles.glow} />
      
      {/* Particles effect */}
      <Particles />
      
      {/* Main content */}
      <div className={styles.content}>
        <span className={styles.icon}>
          {isCorrect 
            ? <motion.span 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                ✅
              </motion.span>
            : <motion.span 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: 2, duration: 0.2 }}
              >
                ❌
              </motion.span>
          }
        </span>
        
        <motion.span 
          className={styles.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {displayMessage}
        </motion.span>
      </div>
      
      {/* Streak bonus message */}
      {isCorrect && streakCount >= 3 && (
        <motion.div
          className={styles.streakBonus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {streakCount >= 10 ? "🔥 Master Streak Bonus!" : 
           streakCount >= 5 ? "🔥 Super Streak Bonus!" : 
           "🔥 Streak Bonus!"}
        </motion.div>
      )}
    </motion.div>
  );
}