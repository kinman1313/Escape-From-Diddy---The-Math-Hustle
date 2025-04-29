import { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { GameContext } from '@/components/GameProvider';

// Collection of all Diddy images
const DIDDY_IMAGES = {
  LOADING: '/loading-diddy.jpg',
  COAT: '/diddycoat.jpg',
  WINKS: '/diddywinks2.0.jpeg',
  DIDDY_333: '/diddy333.jpg',
  DIDIDDY: '/dididdy.jpg',
  DIDDLER: '/diddler.jpg',
  HAHA_DIDDY: '/hahadiddy.jpg',
  PFFY: '/pffy12.jpg',
};

// Mapping of game events to images
const EVENT_IMAGE_MAPPING = {
  game_start: DIDDY_IMAGES.COAT,
  loading: DIDDY_IMAGES.LOADING,
  level_complete: DIDDY_IMAGES.WINKS,
  first_powerup: DIDDY_IMAGES.DIDDY_333,
  math_challenge_complete: DIDDY_IMAGES.DIDIDDY,
  jump_scare_1: DIDDY_IMAGES.DIDDLER,
  jump_scare_2: DIDDY_IMAGES.HAHA_DIDDY,
  jump_scare_3: DIDDY_IMAGES.PFFY,
};

const JUMP_SCARE_CONFIG = {
  minTimeBetweenScares: 180000, // 3 minutes
  maxTimeBetweenScares: 600000, // 10 minutes
  scareDuration: 800,
  scareChance: 0.7,
  initialDelay: 120000,
};

interface Triggers {
  firstPowerupShown: boolean;
  mathChallengeShown: boolean;
  [key: string]: boolean;
}

interface PowerUps {
  timeFreeze?: number;
  fiftyFifty?: number;
  repellent?: number;
  firstCollected?: boolean;
}

interface Challenges {
  mathCompleted?: boolean;
}

interface GameState {
  status?: string;
  event?: string | null;
  triggers?: Triggers;
  powerups?: PowerUps;
  challenges?: Challenges;
}

// Define the shape of the context
interface GameContextValue {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setTrigger?: (triggerName: string, value: boolean) => void;
}

export default function ImageEvents(): JSX.Element {
  // Use type assertion to handle the context type
  const contextValue = useContext(GameContext) as unknown as GameContextValue;
  const contextGameState = contextValue.gameState;
  const contextSetTrigger = contextValue.setTrigger;
  
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
  const [imageSource, setImageSource] = useState<string>('');
  const [isJumpScare, setIsJumpScare] = useState<boolean>(false);
  const [lastJumpScareTime, setLastJumpScareTime] = useState<number>(0);
  const [nextJumpScareTime, setNextJumpScareTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent overlapping modals
  const safeShowImage = (src: string, jumpScare: boolean, duration: number) => {
    if (showImage) return;
    setImageSource(src);
    setIsJumpScare(jumpScare);
    setShowImage(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowImage(false), duration);
  };

  // For random jump scares
  useEffect(() => {
    if (contextGameState?.status !== 'playing') return;
    if (nextJumpScareTime === 0) {
      setNextJumpScareTime(Date.now() + JUMP_SCARE_CONFIG.initialDelay);
      return;
    }
    const jumpScareTimer = setInterval(() => {
      const now = Date.now();
      if (now >= nextJumpScareTime) {
        if (Math.random() < JUMP_SCARE_CONFIG.scareChance) {
          triggerRandomJumpScare();
        }
        const nextTime =
          now +
          JUMP_SCARE_CONFIG.minTimeBetweenScares +
          Math.random() *
            (JUMP_SCARE_CONFIG.maxTimeBetweenScares -
              JUMP_SCARE_CONFIG.minTimeBetweenScares);
        setNextJumpScareTime(nextTime);
      }
    }, 5000);
    return () => clearInterval(jumpScareTimer);
  }, [contextGameState?.status, nextJumpScareTime]);

  // For event-based images (cutscenes)
  useEffect(() => {
    if (contextGameState?.event && contextGameState.event !== currentEvent) {
      setCurrentEvent(contextGameState.event);
      if (contextGameState.event in EVENT_IMAGE_MAPPING) {
        safeShowImage(
          EVENT_IMAGE_MAPPING[contextGameState.event as keyof typeof EVENT_IMAGE_MAPPING],
          false,
          3000
        );
      }
    }
  }, [contextGameState?.event, currentEvent]);

  // Track game progress for special triggered events
  useEffect(() => {
    if (
      contextGameState?.powerups?.firstCollected &&
      !contextGameState?.triggers?.firstPowerupShown
    ) {
      safeShowImage(EVENT_IMAGE_MAPPING.first_powerup, false, 3000);
      // Update triggers using setTrigger if available
      if (contextSetTrigger) {
        contextSetTrigger('firstPowerupShown', true);
      }
    }
    if (
      contextGameState?.challenges?.mathCompleted &&
      !contextGameState?.triggers?.mathChallengeShown
    ) {
      safeShowImage(EVENT_IMAGE_MAPPING.math_challenge_complete, false, 3000);
      // Update triggers using setTrigger if available
      if (contextSetTrigger) {
        contextSetTrigger('mathChallengeShown', true);
      }
    }
  }, [
    contextGameState?.powerups?.firstCollected,
    contextGameState?.challenges?.mathCompleted,
    contextGameState?.triggers?.firstPowerupShown,
    contextGameState?.triggers?.mathChallengeShown,
    contextSetTrigger
  ]);

  // Function to trigger a random jump scare
  const triggerRandomJumpScare = (): void => {
    const now = Date.now();
    if (now - lastJumpScareTime < JUMP_SCARE_CONFIG.minTimeBetweenScares) return;
    const jumpScares = [
      EVENT_IMAGE_MAPPING.jump_scare_1,
      EVENT_IMAGE_MAPPING.jump_scare_2,
      EVENT_IMAGE_MAPPING.jump_scare_3,
    ];
    const randomIndex = Math.floor(Math.random() * jumpScares.length);
    safeShowImage(jumpScares[randomIndex], true, JUMP_SCARE_CONFIG.scareDuration);

    // Play scare sound if available
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('/jumpscare-sound.mp3');
        audio.volume = 0.7;
        audio.play().catch((err) => console.error('Error playing sound:', err));
      } catch (error) {
        console.error('Error with audio playback:', error);
      }
    }
    setLastJumpScareTime(now);
  };

  // Manually trigger a jump scare (for debugging or specific game events)
  const debugTriggerJumpScare = (index: number = 0): void => {
    const jumpScares = [
      EVENT_IMAGE_MAPPING.jump_scare_1,
      EVENT_IMAGE_MAPPING.jump_scare_2,
      EVENT_IMAGE_MAPPING.jump_scare_3,
    ];
    if (index >= 0 && index < jumpScares.length) {
      safeShowImage(jumpScares[index], true, JUMP_SCARE_CONFIG.scareDuration);
    }
  };

  // Expose debug function to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).debugTriggerJumpScare = debugTriggerJumpScare;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).debugTriggerJumpScare;
      }
    };
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Optional: Close modal on click or Escape
  useEffect(() => {
    if (!showImage) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowImage(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showImage]);

  return (
    <AnimatePresence mode="wait">
      {showImage && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isJumpScare ? 0.1 : 0.3 }}
          aria-modal="true"
          role="dialog"
          onClick={() => setShowImage(false)}
        >
          <motion.div
            className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-2xl"
            initial={{ scale: isJumpScare ? 0.8 : 0.9 }}
            animate={{
              scale: 1,
              x: isJumpScare ? [0, -5, 5, -5, 5, 0] : 0,
            }}
            transition={{
              duration: isJumpScare ? 0.2 : 0.5,
              type: isJumpScare ? 'spring' : 'easeOut',
              stiffness: isJumpScare ? 300 : 100,
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Image
              src={imageSource}
              alt="Diddy Event"
              width={800}
              height={600}
              className={`w-full object-contain ${isJumpScare ? 'animate-pulse' : ''}`}
              priority={isJumpScare}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}