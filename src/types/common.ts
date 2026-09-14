export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameId =
  | 'palette'
  | 'signal'
  | 'cube'
  | 'breach'
  | 'matrix';

export interface GameInfo {
  id: GameId;
  name: string;
  icon: string;
  description: string;
}

export interface GameStats {
  bestScore: number;
  timesPlayed: number;
  timesWon: number;
}

export interface GameResultData {
  score: number;
  timeMs: number;
  moves: number;
  restarts: number;
  isOptimal?: boolean;
  extra?: Record<string, string | number | boolean>;
}
