// components/FeedbackModal.tsx
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import styles from '@/styles/FeedbackModal.module.css'

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
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${styles.modalContainer} ${isCorrect ? styles.correct : styles.wrong}`}
    >
      <div className={styles.modalContent}>
        <span className={styles.icon}>
          {isCorrect ? '✅' : '❌'}
        </span>
        <span className={styles.message}>{displayMessage}</span>
      </div>
    </motion.div>
  );
}