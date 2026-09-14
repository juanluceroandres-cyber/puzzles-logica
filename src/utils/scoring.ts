import type { Difficulty } from '../types/common';

const DIFFICULTY_MULT: Record<Difficulty, number> = {
  easy: 0.85,
  normal: 1.0,
  hard: 1.15,
};

export interface ScoreInput {
  difficulty: Difficulty;
  timeMs: number;
  moves: number;
  maxMoves?: number;
  optimalMoves?: number;
  restarts: number;
  won: boolean;
  timeLimitMs?: number;
}

export function calculateScore(input: ScoreInput): number {
  if (!input.won) return 0;

  const base = 1000 * DIFFICULTY_MULT[input.difficulty];
  let score = base;

  const timeLimit = input.timeLimitMs ?? 300_000;
  const timeRatio = Math.min(input.timeMs / timeLimit, 1);
  score -= timeRatio * 200;

  if (input.maxMoves !== undefined) {
    const excess = Math.max(0, input.moves - (input.optimalMoves ?? input.maxMoves));
    score -= excess * 40;
  } else if (input.optimalMoves !== undefined) {
    const excess = Math.max(0, input.moves - input.optimalMoves);
    score -= excess * 35;
  }

  score -= input.restarts * 75;

  return Math.max(0, Math.min(1000, Math.round(score)));
}

export function isOptimalSolution(moves: number, optimalMoves: number): boolean {
  return moves <= optimalMoves;
}
