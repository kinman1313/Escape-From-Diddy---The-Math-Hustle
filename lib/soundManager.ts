// lib/soundManager.ts
import { Howl } from 'howler'

// Define sound files
const sounds: Record<string, Howl> = {}

// Cache to prevent duplicate loading
const loadedSounds: Record<string, boolean> = {}

// Keep track of initialization state
let isInitialized = false
let audioContextInitialized = false

/**
 * Initialize sound manager - call this early in app lifecycle
 * This preloads common sounds to prevent delays
 */
export function initSoundManager() {
  if (isInitialized) return true // Prevent multiple initializations
  
  try {
    // Preload common sounds
    registerSound('bad-boy', '/sounds/bad-boy.m4a')
    registerSound('correct', '/sounds/correct.m4a')
    registerSound('wrong', '/sounds/wrong.m4a')
    registerSound('do-wa-diddy', '/sounds/do-wa-diddy.m4a')
    registerSound('i-like-this', '/sounds/i-like-this.m4a')
    registerSound('powerup', '/sounds/powerup.m4a')
    
    isInitialized = true
    return true
  } catch (err) {
    console.error('Failed to initialize sound manager:', err)
    return false
  }
}

/**
 * Register a sound for later use
 */
export function registerSound(name: string, path: string) {
  if (loadedSounds[name]) return
  
  try {
    sounds[name] = new Howl({
      src: [path],
      preload: true,
      volume: 0.7
    })
    loadedSounds[name] = true
  } catch (err) {
    console.error(`Failed to register sound: ${name}`, err)
  }
}

/**
 * Play a sound by name with fallback
 */
export function playSound(name: string, fallbackName?: string) {
  if (!audioContextInitialized) {
    // Don't try to play sounds if audio context isn't initialized
    console.warn('Audio context not initialized. Call initAudioContext first.')
    return false
  }

  try {
    // First try to get from cache
    let sound = sounds[name]
    
    // If not cached, create it
    if (!sound && !loadedSounds[name]) {
      registerSound(name, `/sounds/${name}.m4a`)
      sound = sounds[name]
    }
    
    // If sound exists, play it
    if (sound) {
      // Stop any previous instance of this sound
      sound.stop()
      
      // Play with error handling
      sound.play()
      return true
    } 
    
    // Try fallback if provided
    if (fallbackName && fallbackName !== name) {
      return playSound(fallbackName)
    }
    
    return false
  } catch (err) {
    console.error(`Error playing sound: ${name}`, err)
    
    // Try fallback if provided
    if (fallbackName && fallbackName !== name) {
      return playSound(fallbackName)
    }
    
    return false
  }
}

/**
 * Play a random sound from a given list
 */
export function playRandomSound(options: string[]) {
  if (!options || options.length === 0) return false
  
  const randomIndex = Math.floor(Math.random() * options.length)
  return playSound(options[randomIndex])
}

/**
 * Play a sound for a streak milestone
 */
export function playStreakSound(streak: number) {
  if (streak === 3) {
    return playSound('i-like-this')
  } else if (streak === 5) {
    return playSound('bad-boy')
  } else if (streak === 10) {
    return playSound('talk-to-them', 'i-like-this')
  } else {
    return playRandomSound([
      'i-like-this',
      'bad-boy',
      'correct'
    ])
  }
}

/**
 * Initialize the audio context with a user interaction
 * Call this on first user click to enable audio on iOS/Safari
 */
export function initAudioContext() {
  if (audioContextInitialized) return true
  
  try {
    // Create a silent sound and play it to unlock audio on iOS/Safari
    const unlockSound = new Howl({
      src: ['/sounds/silent.m4a'],
      volume: 0.001,
      html5: true
    })
    
    unlockSound.play()
    
    // Initialize all sounds
    initSoundManager()
    
    audioContextInitialized = true
    return true
  } catch (err) {
    console.error('Error initializing audio context:', err)
    return false
  }
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds() {
  try {
    Object.values(sounds).forEach(sound => {
      sound.stop()
    })
    return true
  } catch (err) {
    console.error('Error stopping sounds', err)
    return false
  }
}