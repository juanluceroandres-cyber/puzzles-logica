import type { ColorId, PaletteLevel, PaletteState } from './types';

function key(r: number, c: number): string {
  return `${r},${c}`;
}

export function getOwnedRegion(board: ColorId[][]): Set<string> {
  const region = new Set<string>();
  const startColor = board[0][0];
  const queue: [number, number][] = [[0, 0]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const k = key(r, c);
    if (visited.has(k)) continue;
    if (board[r][c] !== startColor) continue;
    visited.add(k);
    region.add(k);
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
        queue.push([nr, nc]);
      }
    }
  }
  return region;
}

export function initPaletteState(level: PaletteLevel): PaletteState {
  const board = level.board.map((row) => [...row]);
  return {
    board,
    moves: 0,
    ownedRegion: getOwnedRegion(board),
  };
}

export function applyColor(
  state: PaletteState,
  newColor: ColorId,
): PaletteState {
  const board = state.board.map((row) => [...row]);
  const currentColor = board[0][0];
  if (currentColor === newColor) return state;

  const region = getOwnedRegion(board);
  for (const k of region) {
    const [r, c] = k.split(',').map(Number);
    board[r][c] = newColor;
  }

  return {
    board,
    moves: state.moves + 1,
    ownedRegion: getOwnedRegion(board),
  };
}

export function isVictory(state: PaletteState, targetColor: ColorId): boolean {
  return state.board.every((row) => row.every((cell) => cell === targetColor));
}

export function isDefeat(state: PaletteState, maxMoves: number): boolean {
  return state.moves >= maxMoves && !state.board.every((row) => row.every((cell) => cell === state.board[0][0]));
}

export function getAvailableColors(
  state: PaletteState,
  levelColors: ColorId[],
): ColorId[] {
  const current = state.board[0][0];
  return levelColors.filter((c) => c !== current);
}

export function getProgress(state: PaletteState, targetColor: ColorId): number {
  const total = state.board.length * state.board[0].length;
  let matching = 0;
  for (const row of state.board) {
    for (const cell of row) {
      if (cell === targetColor) matching++;
    }
  }
  return matching / total;
}
