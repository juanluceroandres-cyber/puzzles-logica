import type { Difficulty } from '../../types/common';

export type TileType = 'empty' | 'wall' | 'hole' | 'goal' | 'breakable' | 'laser';
export type BlockType = 'square' | 'rectangle';
export type Orientation = 'vertical' | 'horizontal';

export interface GoalSpec {
  row: number;
  col: number;
  orientation: Orientation | 'standing';
}

export interface CubeLevel {
  id: string;
  difficulty: Difficulty;
  size: number;
  grid: TileType[][];
  blockType: BlockType;
  startRow: number;
  startCol: number;
  startOrientation: Orientation;
  goal: GoalSpec;
  maxMoves?: number;
}

export interface BlockState {
  row: number;
  col: number;
  orientation: Orientation;
}

export interface CubeGameState {
  block: BlockState;
  brokenTiles: Set<string>;
  moves: number;
}
