// components/LoadingScreen.tsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { playSound, initAudioContext } from '@/lib/soundManager'

// Spooky image paths
const spookyImages = [
  '/diddler.jpg',
  '/hahadiddy.jpg',
  '/diddy333.jpg',
  '/diddlywinks2.0.jpeg',
  '/diddycoat.jpg',
  '/dididdy.jpg',
  '/pffy12.jpg',
]

export default function LoadingScreen() {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Function to manually play audio after user interaction
  const playLoadingAudio = useCallback(() => {
    if (playingAudio || !audioElement) return;

    // First, initialize the audio context
    initAudioContext();
    
    // Try to play the audio
    audioElement.play()
      .then(() => {
        console.log('Loading audio playing successfully!');
        setPlayingAudio(true);
      })
      .catch(err => {
        console.error('Audio play error:', err);
        // Try again with user interaction
        const handleUserInteraction = () => {
          audioElement.play()
            .then(() => {
              console.log('Loading audio now playing after user interaction');
              setPlayingAudio(true);
              document.removeEventListener('click', handleUserInteraction);
            })
            .catch(e => console.error('Still failed to play audio:', e));
        };
        
        document.addEventListener('click', handleUserInteraction);
      });
  }, [playingAudio, audioElement]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined' || audioElement) return;
    
    // Create the audio element
    const audio = new Audio('/sounds/everybyoutake.mp3');
    audio.loop = false;
    audio.volume = 0.2;
    audio.preload = 'auto';
    
    // Store the audio element
    setAudioElement(audio);
    
    // Set up audio event listeners
    audio.addEventListener('ended', () => {
      console.log('Audio ended naturally');
      setPlayingAudio(false);
    });
    
    // Set up cleanup
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('ended', () => {
        setPlayingAudio(false);
      });
    };
  }, [audioElement]);

  // Add click event listener to document for audio initialization
  useEffect(() => {
    if (!audioElement) return;
    
    const handleDocumentClick = () => {
      if (!audioInitialized) {
        setAudioInitialized(true);
        playLoadingAudio();
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [audioElement, audioInitialized, playLoadingAudio]);

  // Set a timeout to stop the audio after 8 seconds
  useEffect(() => {
    if (!playingAudio || !audioElement) return;
    
    const stopTimeout = setTimeout(() => {
      audioElement.pause();
      audioElement.currentTime = 0;
      setPlayingAudio(false);
    }, 8000);
    
    return () => {
      clearTimeout(stopTimeout);
    };
  }, [playingAudio, audioElement]);

  // Flash random images
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomImage = spookyImages[Math.floor(Math.random() * spookyImages.length)];
        setCurrentImage(randomImage);
        setTimeout(() => setCurrentImage(null), 300);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="flex flex-col justify-center items-center min-h-screen bg-black text-mathGreen relative overflow-hidden"
      onClick={() => {
        if (!playingAudio && audioElement) {
          playLoadingAudio();
        }
      }}
    >
      <motion.h1
        className="text-4xl font-bold mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Escaping Diddy...
      </motion.h1>

      <motion.p
        className="text-lg"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        Math, Memes, Mayhem.
      </motion.p>

      {/* Audio play indicator (only during development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          Audio status: {playingAudio ? 'Playing' : 'Not playing'} 
          {!playingAudio && !audioInitialized && ' (Click anywhere to enable audio)'}
        </div>
      )}

      {/* Diddy random flash */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            className="absolute inset-0 flex justify-center items-center z-10 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image 
              src={currentImage} 
              alt="Diddy Spook" 
              width={500} 
              height={500} 
              className="object-contain"
              priority 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}