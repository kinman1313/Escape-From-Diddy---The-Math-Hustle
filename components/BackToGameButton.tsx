// components/BackToGameButton.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { playSound } from '@/lib/soundManager'

interface BackToGameButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export default function BackToGameButton({ 
  className = '', 
  size = 'medium',
  position = 'top-left'
}: BackToGameButtonProps) {
  // Handle sound effects
  const handleClick = () => {
    playSound('click')
  }
  
  // Size classes
  const sizeClasses = {
    small: 'text-sm px-3 py-1',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  }
  
  // Position classes for fixed positioning
  const positionClasses = {
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'center': 'mx-auto'
  }
  
  return (
    <motion.div 
      className={`${positionClasses[position]} z-40 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        href="/game" 
        className={`
          ${sizeClasses[size]} 
          bg-mathGreen rounded-full font-bold text-black 
          flex items-center gap-2 hover:shadow-lg shadow-mathGreen
          transition-all duration-300 hover:scale-105
        `}
        onClick={handleClick}
      >
        <span className="text-lg">←</span>
        <span>Back to Game</span>
      </Link>
    </motion.div>
  )
}