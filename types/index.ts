// types/index.ts

/**
 * Player Data Structure
 */
export type PlayerData = {
  nickname?: string;
  avatar?: string;
  streak?: number;
  proximity?: number;
  score?: number;
  highScore?: number;
  gear?: string[];
  hasSeenTutorial?: boolean;
  equipped?: {
    accessory?: string;
    head?: string;
  };
  powerups?: {
    timeFreeze?: number;
    fiftyFifty?: number;
    repellent?: number;
  };
  created?: Date;
};

/**
 * Question Structure
 */
export type QuestionChoice = {
  [key: string]: string | number;
};

export type Question = {
  id: number;
  prompt: string;
  choices: QuestionChoice;
  answer: string;
  difficulty?: number; // Optional property for difficulty level
};

/**
 * Powerup Types
 */
export type PowerupType = 'timeFreeze' | 'fiftyFifty' | 'repellent';

export type PowerupData = {
  [key in PowerupType]: number;
};

/**
 * Avatar Mapping
 */
export type AvatarMapItem = {
  icon: string;
  label: string;
};

export type AvatarMap = {
  [key: string]: AvatarMapItem;
};

/**
 * Game State
 */
export type GameDifficulty = 1 | 2 | 3; // Easy, Medium, Hard

export type GameState = {
  score: number;
  highScore: number;
  streak: number;
  proximity: number;
  currentQuestion: number;
  difficulty: GameDifficulty;
  isGameOver: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeLeft: number;
  isTimerPaused: boolean;
  eliminatedChoices: string[];
};

/**
 * Final Score Data
 */
export type ScoreData = {
  score: number;
  highScore: number;
  totalQuestions: number;
  correctAnswers: number;
  newHighScore?: boolean;
};

/**
 * Audio Types
 */
export type SoundEffect = 
  | 'correct'
  | 'wrong'
  | 'timeout'
  | 'powerup'
  | 'i-like-this'
  | 'bad-boy'
  | 'talk-to-them'
  | 'do-wa-diddy';

/**
 * Tutorial Step
 */
export type TutorialStep = {
  title: string;
  content: string;
  image?: string;
  icon?: string;
};

/**
 * Animation Variants
 */
export type AnimationVariants = {
  hidden: Record<string, any>;
  visible: Record<string, any>;
  exit?: Record<string, any>;
};

/**
 * Reward Types
 */
export type RewardType = {
  name: string;
  type: 'accessory' | 'powerup' | 'avatar';
  icon?: string;
  effect?: string;
  milestone?: number;
};

/**
 * Component Props Types
 */
export type LoadingScreenProps = {
  minimumDisplayTime?: number;
  imageUrl?: string;
};

export type CutsceneProps = {
  onComplete: () => void;
  skipEnabled?: boolean;
  duration?: number;
};

export type GameTutorialProps = {
  onComplete: () => void;
};

export type RewardModalProps = {
  reward: string;
  onClose: () => void;
  autoCloseTime?: number;
};

export type DiddyMeterProps = {
  level: number;
  maxLevel?: number;
};

export type FeedbackModalProps = {
  isCorrect: boolean;
  message?: string;
  duration?: number;
};

export type FinalScoreScreenProps = {
  data: ScoreData;
  onRestart: () => void;
};

/**
 * Form Input Types
 */
export type LoginFormInputs = {
  email: string;
  password: string;
  nickname?: string;
};

/**
 * API Response Types
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Leaderboard Types
 */
export type LeaderboardEntry = {
  uid: string;
  nickname: string;
  score: number;
  streak: number;
  avatar?: string;
};

export type LeaderboardData = LeaderboardEntry[];