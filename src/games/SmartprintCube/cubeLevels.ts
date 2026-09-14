import type { CubeLevel } from './types';

function grid(size: number, fill: CubeLevel['grid'][0][0] = 'empty'): CubeLevel['grid'] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

export const CUBE_LEVELS: Record<string, CubeLevel> = {
  easy: {
    id: 'cube-easy',
    difficulty: 'easy',
    size: 5,
    blockType: 'square',
    startRow: 0,
    startCol: 0,
    startOrientation: 'vertical',
    goal: { row: 4, col: 4, orientation: 'standing' },
    grid: (() => {
      const g = grid(5);
      g[4][4] = 'goal';
      return g;
    })(),
  },
  normal: {
    id: 'cube-normal',
    difficulty: 'normal',
    size: 7,
    blockType: 'rectangle',
    startRow: 0,
    startCol: 0,
    startOrientation: 'vertical',
    maxMoves: 25,
    goal: { row: 6, col: 5, orientation: 'horizontal' },
    grid: (() => {
      const g = grid(7);
      g[2][2] = 'wall';
      g[2][3] = 'wall';
      g[2][4] = 'wall';
      g[4][1] = 'hole';
      g[4][2] = 'hole';
      g[6][5] = 'goal';
      g[6][6] = 'goal';
      return g;
    })(),
  },
  hard: {
    id: 'cube-hard',
    difficulty: 'hard',
    size: 9,
    blockType: 'rectangle',
    startRow: 0,
    startCol: 0,
    startOrientation: 'vertical',
    maxMoves: 35,
    goal: { row: 8, col: 7, orientation: 'horizontal' },
    grid: (() => {
      const g = grid(9);
      g[1][3] = 'wall';
      g[1][4] = 'wall';
      g[1][5] = 'wall';
      g[3][3] = 'breakable';
      g[3][4] = 'breakable';
      g[5][2] = 'hole';
      g[5][3] = 'hole';
      g[4][6] = 'laser';
      g[4][7] = 'laser';
      g[7][1] = 'wall';
      g[7][2] = 'wall';
      g[8][7] = 'goal';
      g[8][8] = 'goal';
      return g;
    })(),
  },
};
