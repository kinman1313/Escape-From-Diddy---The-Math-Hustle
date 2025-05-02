// lib/soundManager.ts
import { Howl } from 'howler'

/**
 * Sound Manager - Enhanced version
 * Manages audio playback for the game with improved organization and error handling
 */

// Define sound categories for organization
type SoundCategory = 'ui' | 'gameplay' | 'feedback' | 'character' | 'ambient';

// Sound configuration interface
interface SoundConfig {
  path: string;
  volume?: number;
  category: SoundCategory;
  loop?: boolean;
  preload?: boolean;
}

// Define sound files with their configurations
const SOUND_CONFIG: Record<string, SoundConfig> = {
  // UI Sounds
  click: { path: '/sounds/click.m4a', volume: 0.5, category: 'ui', preload: true },
  hover: { path: '/sounds/hover.m4a', volume: 0.3, category: 'ui' },
  
  // Feedback Sounds
  correct: { path: '/sounds/correct.m4a', volume: 0.7, category: 'feedback', preload: true },
  wrong: { path: '/sounds/wrong.m4a', volume: 0.7, category: 'feedback', preload: true },
  timeout: { path: '/sounds/timeout.m4a', volume: 0.6, category: 'feedback' },
  
  // Character Sounds
  'bad-boy': { path: '/sounds/bad-boy.m4a', volume: 0.7, category: 'character', preload: true },
  'do-wa-diddy': { path: '/sounds/do-wa-diddy.m4a', volume: 0.7, category: 'character', preload: true },
  'i-like-this': { path: '/sounds/i-like-this.m4a', volume: 0.7, category: 'character', preload: true },
  'talk-to-them': { path: '/sounds/talk-to-them.m4a', volume: 0.7, category: 'character' },
  
  // Gameplay Sounds
  powerup: { path: '/sounds/powerup.m4a', volume: 0.7, category: 'gameplay', preload: true },
  levelup: { path: '/sounds/levelup.m4a', volume: 0.8, category: 'gameplay' },
  streak: { path: '/sounds/streak.m4a', volume: 0.7, category: 'gameplay' },
  
  // Ambient Sounds
  background: { path: '/sounds/background.m4a', volume: 0.4, category: 'ambient', loop: true },
  
  // Utility Sounds
  silent: { path: '/sounds/silent.m4a', volume: 0.001, category: 'ui' }
};

// Loaded sounds cache
const sounds: Record<string, Howl> = {};

// Track which sounds have been loaded
const loadedSounds: Record<string, boolean> = {};

// Global state tracking
let isInitialized = false;
let audioContextInitialized = false;
let globalVolume = 0.7;
let isMuted = false;
let backgroundMusicPlaying = false;

/**
 * Initialize sound manager - call this early in app lifecycle
 * This preloads sounds marked for preloading
 */
export function initSoundManager() {
  if (isInitialized) return true; // Prevent multiple initializations
  
  try {
    // Load all sounds marked for preloading
    Object.entries(SOUND_CONFIG).forEach(([name, config]) => {
      if (config.preload) {
        registerSound(name, config.path, config.volume);
      }
    });
    
    isInitialized = true;
    return true;
  } catch (err) {
    console.error('Failed to initialize sound manager:', err);
    return false;
  }
}

/**
 * Register a sound for later use
 * @param name Sound identifier
 * @param path Path to sound file
 * @param volume Optional volume override (0.0 to 1.0)
 */
export function registerSound(name: string, path: string, volume?: number) {
  if (loadedSounds[name]) return;
  
  try {
    // Get config if it exists, otherwise use defaults
    const config = SOUND_CONFIG[name] || { path, volume: 0.7, category: 'ui' };
    
    // Create the Howl instance
    sounds[name] = new Howl({
      src: [path],
      preload: true,
      volume: volume ?? config.volume ?? globalVolume,
      loop: config.loop || false,
      html5: false // Using WebAudio API for better performance when possible
    });
    
    loadedSounds[name] = true;
  } catch (err) {
    console.error(`Failed to register sound: ${name}`, err);
  }
}

/**
 * Play a sound by name with fallback
 * @param name Sound identifier
 * @param fallbackName Optional fallback sound if primary sound fails
 * @returns Success status
 */
export function playSound(name: string, fallbackName?: string): boolean {
  if (!audioContextInitialized) {
    console.warn('Audio context not initialized. Call initAudioContext first.');
    return false;
  }
  
  if (isMuted) return false;
  
  try {
    // First try to get from cache
    let sound = sounds[name];
    
    // If not cached, try to create it
    if (!sound && !loadedSounds[name]) {
      // Check if we have a config for this sound
      const config = SOUND_CONFIG[name];
      
      if (config) {
        registerSound(name, config.path, config.volume);
        sound = sounds[name];
      } else {
        // Try to load from default path
        const defaultPath = `/sounds/${name}.m4a`;
        registerSound(name, defaultPath);
        sound = sounds[name];
      }
    }
    
    // If sound exists, play it
    if (sound) {
      // For non-looping sounds, stop previous instances to prevent overlap
      if (!SOUND_CONFIG[name]?.loop) {
        sound.stop();
      }
      
      const soundId = sound.play();
      sound.volume(SOUND_CONFIG[name]?.volume ?? globalVolume);
      
      return soundId !== null;
    } 
    
    // Try fallback if provided
    if (fallbackName && fallbackName !== name) {
      return playSound(fallbackName);
    }
    
    return false;
  } catch (err) {
    console.error(`Error playing sound: ${name}`, err);
    
    // Try fallback if provided
    if (fallbackName && fallbackName !== name) {
      return playSound(fallbackName);
    }
    
    return false;
  }
}

/**
 * Play a sound from a specific category
 * @param category The sound category to play from
 * @returns The sound name that was played, or null if failed
 */
export function playCategorySound(category: SoundCategory): string | null {
  // Get all sounds in this category
  const categoryOptions = Object.entries(SOUND_CONFIG)
    .filter(([_, config]) => config.category === category)
    .map(([name]) => name);
  
  if (categoryOptions.length === 0) return null;
  
  // Play a random sound from the category
  const randomName = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
  const success = playSound(randomName);
  
  return success ? randomName : null;
}

/**
 * Play a random sound from a given list
 * @param options Array of sound names to choose from
 * @returns Success status
 */
export function playRandomSound(options: string[]): boolean {
  if (!options || options.length === 0) return false;
  
  const randomIndex = Math.floor(Math.random() * options.length);
  return playSound(options[randomIndex]);
}

/**
 * Play a sound for a streak milestone
 * @param streak The current streak count
 * @returns Success status
 */
export function playStreakSound(streak: number): boolean {
  if (streak === 3) {
    return playSound('i-like-this');
  } else if (streak === 5) {
    return playSound('bad-boy');
  } else if (streak === 10) {
    return playSound('talk-to-them', 'i-like-this');
  } else {
    return playRandomSound([
      'i-like-this',
      'bad-boy',
      'correct'
    ]);
  }
}

/**
 * Initialize the audio context with a user interaction
 * Call this on first user click to enable audio on iOS/Safari
 * @returns Success status
 */
export function initAudioContext(): boolean {
  if (audioContextInitialized) return true;
  
  try {
    // Create a silent sound and play it to unlock audio on iOS/Safari
    const unlockSound = new Howl({
      src: ['/sounds/silent.m4a'],
      volume: 0.001,
      html5: true
    });
    
    unlockSound.play();
    
    // Initialize all sounds
    initSoundManager();
    
    audioContextInitialized = true;
    return true;
  } catch (err) {
    console.error('Error initializing audio context:', err);
    return false;
  }
}

/**
 * Play background music
 * @param name Optional specific background sound to play
 * @returns Success status
 */
export function playBackgroundMusic(name?: string): boolean {
  if (backgroundMusicPlaying) {
    stopBackgroundMusic();
  }
  
  const bgSound = name || 'background';
  
  try {
    // Ensure sound is registered
    if (!loadedSounds[bgSound]) {
      const config = SOUND_CONFIG[bgSound] || SOUND_CONFIG.background;
      registerSound(bgSound, config.path, config.volume);
    }
    
    const sound = sounds[bgSound];
    if (sound) {
      sound.loop(true);
      sound.volume((SOUND_CONFIG[bgSound]?.volume ?? 0.4) * globalVolume);
      sound.play();
      backgroundMusicPlaying = true;
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Error playing background music:', err);
    return false;
  }
}

/**
 * Stop background music
 * @returns Success status
 */
export function stopBackgroundMusic(): boolean {
  try {
    Object.entries(sounds).forEach(([name, sound]) => {
      if (SOUND_CONFIG[name]?.loop) {
        sound.stop();
      }
    });
    
    backgroundMusicPlaying = false;
    return true;
  } catch (err) {
    console.error('Error stopping background music:', err);
    return false;
  }
}

/**
 * Stop all currently playing sounds
 * @returns Success status
 */
export function stopAllSounds(): boolean {
  try {
    Object.values(sounds).forEach(sound => {
      sound.stop();
    });
    
    backgroundMusicPlaying = false;
    return true;
  } catch (err) {
    console.error('Error stopping sounds', err);
    return false;
  }
}

/**
 * Set global volume for all sounds
 * @param volume Volume level from 0.0 to 1.0
 */
export function setVolume(volume: number): void {
  // Clamp volume between 0 and 1
  globalVolume = Math.max(0, Math.min(1, volume));
  
  // Update volume for all loaded sounds
  Object.entries(sounds).forEach(([name, sound]) => {
    const configVolume = SOUND_CONFIG[name]?.volume ?? 0.7;
    sound.volume(configVolume * globalVolume);
  });
}

/**
 * Mute or unmute all sounds
 * @param mute True to mute, false to unmute
 */
export function setMute(mute: boolean): void {
  isMuted = mute;
  
  // Update mute state for all sounds
  Object.values(sounds).forEach(sound => {
    sound.mute(mute);
  });
}

/**
 * Check if a sound is loaded
 * @param name Sound name to check
 * @returns True if sound is loaded
 */
export function isSoundLoaded(name: string): boolean {
  return !!loadedSounds[name];
}

/**
 * Preload a collection of sounds
 * @param soundNames Array of sound names to preload
 */
export function preloadSounds(soundNames: string[]): void {
  soundNames.forEach(name => {
    if (!loadedSounds[name]) {
      const config = SOUND_CONFIG[name];
      if (config) {
        registerSound(name, config.path, config.volume);
      } else {
        // Try default path
        registerSound(name, `/sounds/${name}.m4a`);
      }
    }
  });
}