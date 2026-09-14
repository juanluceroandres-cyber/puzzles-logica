import type { PieceShape, PlacedPiece, MatrixLevel } from './types';

export function rotateCells(cells: [number, number][], times: number): [number, number][] {
  let result = cells.map(([r, c]) => [r, c] as [number, number]);
  for (let t = 0; t < times % 4; t++) {
    result = result.map(([r, c]) => [c, -r] as [number, number]);
    const minR = Math.min(...result.map(([r]) => r));
    const minC = Math.min(...result.map(([, c]) => c));
    result = result.map(([r, c]) => [r - minR, c - minC] as [number, number]);
  }
  return result;
}

export function getPieceCells(
  piece: PieceShape,
  row: number,
  col: number,
  rotation: number,
): [number, number][] {
  const rotated = rotateCells(piece.cells, rotation);
  return rotated.map(([r, c]) => [row + r, col + c] as [number, number]);
}

export function canPlace(
  level: MatrixLevel,
  piece: PieceShape,
  row: number,
  col: number,
  rotation: number,
  placed: PlacedPiece[],
  allPieces: PieceShape[],
): boolean {
  const cells = getPieceCells(piece, row, col, rotation);
  const occupied = new Set<string>();

  for (const p of placed) {
    const shape = allPieces.find((s) => s.id === p.pieceId)!;
    for (const [r, c] of getPieceCells(shape, p.row, p.col, p.rotation)) {
      occupied.add(`${r},${c}`);
    }
  }

  for (const [r, c] of cells) {
    if (r < 0 || r >= level.size || c < 0 || c >= level.size) return false;
    if (occupied.has(`${r},${c}`)) return false;
  }
  return true;
}

export function getCoverage(
  _level: MatrixLevel,
  placed: PlacedPiece[],
  allPieces: PieceShape[],
): Set<string> {
  const covered = new Set<string>();
  for (const p of placed) {
    const shape = allPieces.find((s) => s.id === p.pieceId)!;
    for (const [r, c] of getPieceCells(shape, p.row, p.col, p.rotation)) {
      covered.add(`${r},${c}`);
    }
  }
  return covered;
}

export function checkVictory(
  level: MatrixLevel,
  placed: PlacedPiece[],
): boolean {
  const covered = getCoverage(level, placed, level.pieces);
  return level.targets.every(([r, c]) => covered.has(`${r},${c}`));
}

export function allPiecesPlaced(level: MatrixLevel, placed: PlacedPiece[]): boolean {
  return placed.length === level.pieces.length;
}
