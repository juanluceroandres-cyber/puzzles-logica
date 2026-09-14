import type { MatrixLevel } from './types';

export const MATRIX_LEVELS: Record<string, MatrixLevel> = {
  easy: {
    id: 'matrix-easy',
    difficulty: 'easy',
    size: 5,
    targets: [
      [0, 0], [0, 1], [1, 0], [1, 1],
      [3, 3], [3, 4], [4, 3], [4, 4],
    ],
    pieces: [
      { id: 'p1', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#4a9eff' },
      { id: 'p2', cells: [[0, 0], [1, 0], [2, 0]], color: '#3ecf8e' },
      { id: 'p3', cells: [[0, 0], [0, 1]], color: '#f5c542' },
    ],
  },
  normal: {
    id: 'matrix-normal',
    difficulty: 'normal',
    size: 7,
    targets: [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1],
      [2, 0], [2, 1], [2, 2],
      [4, 4], [4, 5], [5, 4], [5, 5], [5, 6], [6, 4], [6, 5],
    ],
    pieces: [
      { id: 'p1', cells: [[0, 0], [1, 0], [2, 0], [0, 1]], color: '#4a9eff' },
      { id: 'p2', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#3ecf8e' },
      { id: 'p3', cells: [[0, 0], [0, 1], [0, 2]], color: '#f5c542' },
      { id: 'p4', cells: [[0, 0], [1, 0], [1, 1]], color: '#a78bfa' },
      { id: 'p5', cells: [[0, 0], [0, 1]], color: '#e74c6a' },
    ],
  },
  hard: {
    id: 'matrix-hard',
    difficulty: 'hard',
    size: 8,
    targets: [
      [0, 0], [0, 1], [1, 0], [1, 1], [1, 2],
      [3, 3], [3, 4], [4, 3], [4, 4],
      [6, 5], [6, 6], [6, 7], [7, 5], [7, 6], [7, 7],
      [2, 6], [2, 7], [3, 7],
    ],
    pieces: [
      { id: 'p1', cells: [[0, 0], [1, 0], [2, 0], [0, 1]], color: '#4a9eff' },
      { id: 'p2', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#3ecf8e' },
      { id: 'p3', cells: [[0, 0], [0, 1], [0, 2], [1, 1]], color: '#f5c542' },
      { id: 'p4', cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: '#a78bfa' },
      { id: 'p5', cells: [[0, 0], [0, 1], [1, 0]], color: '#e74c6a' },
      { id: 'p6', cells: [[0, 0], [1, 0], [2, 0]], color: '#ff8c42' },
      { id: 'p7', cells: [[0, 0], [0, 1]], color: '#56cfe1' },
    ],
  },
};
