// components/GameProvider.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define types for the game state
interface PowerUps {
  timeFreeze: number;
  fiftyFifty: number;
  repellent: number;
  firstCollected: boolean;
}

interface Challenges {
  mathCompleted: boolean;
}

interface Triggers {
  firstPowerupShown: boolean;
  mathChallengeShown: boolean;
  [key: string]: boolean;
}

export interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'completed';
  score: number;
  level: number;
  event: string | null;
  powerups: PowerUps;
  challenges: Challenges;
  triggers: Triggers;
}

interface GameContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  setTrigger: (triggerName: string, value: boolean) => void;
  triggerEvent: (eventName: string) => void;
  updatePowerup: (powerupName: keyof PowerUps, value: number) => void;
  completeChallenge: (challengeName: keyof Challenges) => void;
}

// Create the Game Context
export const GameContext = createContext<GameContextType>({} as GameContextType);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    score: 0,
    level: 1,
    event: null,
    powerups: {
      timeFreeze: 0,
      fiftyFifty: 0,
      repellent: 0,
      firstCollected: false
    },
    challenges: {
      mathCompleted: false
    },
    triggers: {
      firstPowerupShown: false,
      mathChallengeShown: false
    }
  });

  // Helper function to update game state
  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Helper function to set a specific trigger
  const setTrigger = (triggerName: string, value: boolean) => {
    setGameState(prev => ({
      ...prev,
      triggers: {
        ...prev.triggers,
        [triggerName]: value
      }
    }));
  };

  // Helper function to trigger events
  const triggerEvent = (eventName: string) => {
    setGameState(prev => ({
      ...prev,
      event: eventName
    }));
  };

  // Helper function to update powerups
  const updatePowerup = (powerupName: keyof PowerUps, value: number) => {
    setGameState(prev => ({
      ...prev,
      powerups: {
        ...prev.powerups,
        [powerupName]: value,
        firstCollected: true // Mark that at least one powerup was collected
      }
    }));
  };

  // Helper function to mark a challenge as completed
  const completeChallenge = (challengeName: keyof Challenges) => {
    setGameState(prev => ({
      ...prev,
      challenges: {
        ...prev.challenges,
        [challengeName]: true
      }
    }));
  };

  // Prepare the context value
  const contextValue: GameContextType = {
    gameState,
    updateGameState,
    setTrigger,
    triggerEvent,
    updatePowerup,
    completeChallenge
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}