import type { Difficulty } from '../../types/common';

export interface PieceShape {
  id: string;
  cells: [number, number][];
  color: string;
}

export interface MatrixLevel {
  id: string;
  difficulty: Difficulty;
  size: number;
  targets: [number, number][];
  pieces: PieceShape[];
}

export interface PlacedPiece {
  pieceId: string;
  row: number;
  col: number;
  rotation: number;
}
