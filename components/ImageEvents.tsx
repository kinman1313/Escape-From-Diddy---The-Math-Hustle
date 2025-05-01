// components/ImageEvents.tsx

import { useEffect, useState, useContext } from 'react'
import { GameContext } from './GameProvider'
import { playSound } from '@/lib/soundManager'

const JUMP_SCARE_IMAGES = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/pffy12.jpg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg'
]

const JUMP_SCARE_SOUNDS = [
  'bad-boy',
  'come-on',
  'diddy-party',
  'do-wa-diddy',
  'every-step',
  'i-like-this',
  'talk-to-them'
]

const MIN_DELAY = 3 * 60 * 1000  // 3 minutes
const MAX_DELAY = 10 * 60 * 1000 // 10 minutes

declare global {
  interface Window {
    debugTriggerJumpScare?: (index: number) => void
  }
}

export default function ImageEvents() {
  const { gameState } = useContext(GameContext)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (gameState.status !== 'playing') return

    const timer = setTimeout(() => {
      const shouldShow = Math.random() < 0.7
      if (shouldShow) triggerRandomJumpScare()
    }, 2 * 60 * 1000) // initial 2-minute delay

    return () => clearTimeout(timer)
  }, [gameState.status])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // expose dev test hook
      window.debugTriggerJumpScare = (index: number) => {
        const image = JUMP_SCARE_IMAGES[index % JUMP_SCARE_IMAGES.length]
        triggerJumpScare(image)
      }
    }
  }, [])

  const triggerRandomJumpScare = () => {
    const image = JUMP_SCARE_IMAGES[Math.floor(Math.random() * JUMP_SCARE_IMAGES.length)]
    triggerJumpScare(image)
  }

  const triggerJumpScare = (image: string) => {
    setCurrentImage(image)
    setVisible(true)

    const sound = JUMP_SCARE_SOUNDS[Math.floor(Math.random() * JUMP_SCARE_SOUNDS.length)]
    playSound(sound)

    setTimeout(() => {
      setVisible(false)
      setCurrentImage(null)
    }, 4000)

    const nextDelay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY
    setTimeout(() => {
      const shouldShow = Math.random() < 0.6
      if (shouldShow) triggerRandomJumpScare()
    }, nextDelay)
  }

  return (
    <>
      {visible && currentImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img
            src={currentImage}
            alt="Diddy jumpscare"
            className="max-h-full max-w-full animate-pulse object-contain"
            onClick={() => {
              setVisible(false)
              setCurrentImage(null)
            }}
          />
        </div>
      )}
    </>
  )
}
