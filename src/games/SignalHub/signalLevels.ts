import type { SignalLevel } from './types';

export const SIGNAL_LEVELS: Record<string, SignalLevel> = {
  easy: {
    id: 'signal-easy',
    difficulty: 'easy',
    size: 5,
    endpoints: [
      { row: 0, col: 0, color: 'red' },
      { row: 0, col: 4, color: 'red' },
      { row: 2, col: 0, color: 'blue' },
      { row: 2, col: 4, color: 'blue' },
      { row: 4, col: 0, color: 'green' },
      { row: 4, col: 4, color: 'green' },
    ],
    obstacles: [],
  },
  normal: {
    id: 'signal-normal',
    difficulty: 'normal',
    size: 6,
    endpoints: [
      { row: 0, col: 0, color: 'red' },
      { row: 0, col: 5, color: 'red' },
      { row: 2, col: 1, color: 'blue' },
      { row: 2, col: 4, color: 'blue' },
      { row: 5, col: 0, color: 'green' },
      { row: 5, col: 5, color: 'green' },
      { row: 1, col: 3, color: 'yellow' },
      { row: 4, col: 3, color: 'yellow' },
    ],
    obstacles: [
      [3, 2],
      [3, 3],
    ],
  },
  hard: {
    id: 'signal-hard',
    difficulty: 'hard',
    size: 7,
    endpoints: [
      { row: 0, col: 0, color: 'red' },
      { row: 0, col: 6, color: 'red' },
      { row: 3, col: 0, color: 'blue' },
      { row: 3, col: 6, color: 'blue' },
      { row: 6, col: 0, color: 'green' },
      { row: 6, col: 6, color: 'green' },
      { row: 1, col: 3, color: 'yellow' },
      { row: 5, col: 3, color: 'yellow' },
      { row: 2, col: 1, color: 'purple' },
      { row: 5, col: 5, color: 'purple' },
    ],
    obstacles: [
      [2, 3],
      [3, 3],
    ],
  },
};
