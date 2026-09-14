import type { Difficulty, GameId, GameStats } from '../types/common';

const PREFIX = 'logic-lab';

function key(gameId: GameId, difficulty: Difficulty): string {
  return `${PREFIX}:${gameId}:${difficulty}`;
}

export function getStats(gameId: GameId, difficulty: Difficulty): GameStats {
  try {
    const raw = localStorage.getItem(key(gameId, difficulty));
    if (!raw) return { bestScore: 0, timesPlayed: 0, timesWon: 0 };
    return JSON.parse(raw) as GameStats;
  } catch {
    return { bestScore: 0, timesPlayed: 0, timesWon: 0 };
  }
}

export function saveResult(
  gameId: GameId,
  difficulty: Difficulty,
  score: number,
  won: boolean,
): void {
  const stats = getStats(gameId, difficulty);
  stats.timesPlayed += 1;
  if (won) {
    stats.timesWon += 1;
    stats.bestScore = Math.max(stats.bestScore, score);
  }
  localStorage.setItem(key(gameId, difficulty), JSON.stringify(stats));
}

export function getFailedAttempts(gameId: GameId, difficulty: Difficulty): number {
  const stats = getStats(gameId, difficulty);
  return Math.max(0, stats.timesPlayed - stats.timesWon);
}

export function getAllBestScores(): Record<string, number> {
  const games: GameId[] = ['palette', 'signal', 'cube', 'breach', 'matrix'];
  const diffs: Difficulty[] = ['easy', 'normal', 'hard'];
  const result: Record<string, number> = {};
  for (const g of games) {
    for (const d of diffs) {
      result[`${g}-${d}`] = getStats(g, d).bestScore;
    }
  }
  return result;
}
