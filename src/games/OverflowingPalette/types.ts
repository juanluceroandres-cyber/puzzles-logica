import type { Difficulty } from '../../types/common';

export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export interface PaletteLevel {
  id: string;
  difficulty: Difficulty;
  boardSize: number;
  maxMoves: number;
  optimalMoves: number;
  targetColor: ColorId;
  board: ColorId[][];
  colors: ColorId[];
}

export interface PaletteState {
  board: ColorId[][];
  moves: number;
  ownedRegion: Set<string>;
}
