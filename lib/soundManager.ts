// lib/soundManager.ts
import { Howl } from 'howler'

const sounds: Record<string, Howl> = {
  'bad-boy': new Howl({ src: ['/sounds/bad-boy.m4a'] }),
  'bad-boy-2': new Howl({ src: ['/sounds/bad-boy-2.m4a'] }),
  'come-on': new Howl({ src: ['/sounds/come-on.m4a'] }),
  'diddy-party': new Howl({ src: ['/sounds/diddy-party.m4a'] }),
  'do-wa-diddy': new Howl({ src: ['/sounds/do-wa-diddy.m4a'] }),
  'every-step': new Howl({ src: ['/sounds/every-step.m4a'] }),
  'i-like-this': new Howl({ src: ['/sounds/i-like-this.m4a'] }),
  'talk-to-them': new Howl({ src: ['/sounds/talk-to-them.m4a'] }),
  'correct': new Howl({ src: ['/sounds/correct.m4a'] }),
  'wrong': new Howl({ src: ['/sounds/wrong.m4a'] }),
}
// ✅ Dynamically preload all defined sounds
Object.values(sounds).forEach((sound) => sound.load())

let lastSound: Howl | null = null

export function playSound(name: keyof typeof sounds, onEnd?: () => void) {
  if (lastSound && lastSound.playing()) {
    lastSound.stop()
  }
  const sound = sounds[name]
  if (onEnd) sound.once('end', onEnd)
  sound.play()
  lastSound = sound
}

export function playRandomHypeClip() {
  const keys: (keyof typeof sounds)[] = [
    'bad-boy', 'come-on', 'talk-to-them', 'i-like-this', 'diddy-party'
  ]
  const random = keys[Math.floor(Math.random() * keys.length)]
  playSound(random)
}

export function playTimeoutClip() {
  playSound('come-on')
}

export function playStreakClip() {
  playSound('i-like-this', () => {
    console.log('🔥 Streak sound complete – cue reward animation or modal')
    // Add animation trigger here if desired
  })
}
