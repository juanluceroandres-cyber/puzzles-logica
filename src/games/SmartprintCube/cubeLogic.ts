import type {
  BlockState,
  BlockType,
  CubeDirection,
  CubeGameState,
  CubeLevel,
  Orientation,
  TileType,
} from './types';

const DIR_DELTA: Record<CubeDirection, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

/** Celdas ocupadas según orientación (ancla = esquina superior-izquierda del bounding box). */
export function getOccupiedCells(
  block: BlockState,
  blockType: BlockType,
): [number, number][] {
  if (blockType === 'square') {
    return [[block.row, block.col]];
  }

  switch (block.orientation) {
    case 'standing':
      return [[block.row, block.col]];
    case 'horizontal':
      return [
        [block.row, block.col],
        [block.row, block.col + 1],
      ];
    case 'vertical':
      return [
        [block.row, block.col],
        [block.row + 1, block.col],
      ];
  }
}

/**
 * Máquina de estados WW Smartprint Cube — no modifica el estado original.
 * Tabla: STANDING→H/V al tumbar; HORIZONTAL↔STANDING en ←/→, rueda en ↑/↓;
 *        VERTICAL↔STANDING en ↑/↓, rueda en ←/→.
 */
export function getNextCubeState(
  block: BlockState,
  blockType: BlockType,
  direction: CubeDirection,
): BlockState {
  if (blockType === 'square') {
    const [dr, dc] = DIR_DELTA[direction];
    return {
      row: block.row + dr,
      col: block.col + dc,
      orientation: 'standing',
    };
  }

  const { row, col, orientation } = block;

  if (orientation === 'standing') {
    // Rodamiento: la celda original (row,col) queda libre; el bloque rueda hacia la dirección.
    switch (direction) {
      case 'left':
        return { row, col: col - 2, orientation: 'horizontal' };
      case 'right':
        return { row, col: col + 1, orientation: 'horizontal' };
      case 'up':
        return { row: row - 2, col, orientation: 'vertical' };
      case 'down':
        return { row: row + 1, col, orientation: 'vertical' };
    }
  }

  if (orientation === 'horizontal') {
    switch (direction) {
      case 'left':
        return { row, col: col - 1, orientation: 'standing' };
      case 'right':
        return { row, col: col + 2, orientation: 'standing' };
      case 'up':
        return { row: row - 1, col, orientation: 'horizontal' };
      case 'down':
        return { row: row + 1, col, orientation: 'horizontal' };
    }
  }

  // vertical
  switch (direction) {
    case 'up':
      return { row: row - 1, col, orientation: 'standing' };
    case 'down':
      return { row: row + 2, col, orientation: 'standing' };
    case 'left':
      return { row, col: col - 1, orientation: 'vertical' };
    case 'right':
      return { row, col: col + 1, orientation: 'vertical' };
  }
}

export function isValidCubeState(
  block: BlockState,
  level: CubeLevel,
  brokenTiles: Set<string>,
): { valid: boolean; fell: boolean; laser: boolean } {
  const cells = getOccupiedCells(block, level.blockType);

  for (const [r, c] of cells) {
    if (r < 0 || r >= level.size || c < 0 || c >= level.size) {
      return { valid: false, fell: false, laser: false };
    }
    const tile = level.grid[r][c];
    const key = `${r},${c}`;
    if (tile === 'wall') return { valid: false, fell: false, laser: false };
    if (tile === 'breakable' && brokenTiles.has(key)) {
      return { valid: false, fell: false, laser: false };
    }
  }

  let fell = false;
  let laser = false;
  for (const [r, c] of cells) {
    const tile = level.grid[r][c];
    if (tile === 'hole') fell = true;
    if (tile === 'laser') laser = true;
  }

  return { valid: true, fell, laser };
}

export function moveCube(
  level: CubeLevel,
  state: CubeGameState,
  direction: CubeDirection,
): { ok: boolean; state: CubeGameState; fell: boolean; laser: boolean } {
  const candidate = getNextCubeState(state.block, level.blockType, direction);
  const check = isValidCubeState(candidate, level, state.brokenTiles);

  if (!check.valid) {
    return { ok: false, state, fell: false, laser: false };
  }

  const brokenTiles = new Set(state.brokenTiles);
  for (const [r, c] of getOccupiedCells(state.block, level.blockType)) {
    if (level.grid[r][c] === 'breakable') {
      brokenTiles.add(`${r},${c}`);
    }
  }

  if (check.fell || check.laser) {
    return {
      ok: true,
      state: {
        block: {
          row: level.startRow,
          col: level.startCol,
          orientation: level.startOrientation,
        },
        brokenTiles: state.brokenTiles,
        moves: state.moves + 1,
      },
      fell: check.fell,
      laser: check.laser,
    };
  }

  return {
    ok: true,
    state: {
      block: candidate,
      brokenTiles,
      moves: state.moves + 1,
    },
    fell: false,
    laser: false,
  };
}

/** @deprecated alias */
export const tryMove = moveCube;

export function initCubeState(level: CubeLevel): CubeGameState {
  return {
    block: {
      row: level.startRow,
      col: level.startCol,
      orientation: level.startOrientation,
    },
    brokenTiles: new Set(),
    moves: 0,
  };
}

function cellsMatch(a: [number, number][], b: [number, number][]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b.map(([r, c]) => `${r},${c}`));
  return a.every(([r, c]) => setB.has(`${r},${c}`));
}

export function checkVictory(level: CubeLevel, state: CubeGameState): boolean {
  const cells = getOccupiedCells(state.block, level.blockType);

  let goalCells: [number, number][];
  switch (level.goal.orientation) {
    case 'horizontal':
      goalCells = [
        [level.goal.row, level.goal.col],
        [level.goal.row, level.goal.col + 1],
      ];
      break;
    case 'vertical':
      goalCells = [
        [level.goal.row, level.goal.col],
        [level.goal.row + 1, level.goal.col],
      ];
      break;
    case 'standing':
    default:
      goalCells = [[level.goal.row, level.goal.col]];
      break;
  }

  if (!cellsMatch(cells, goalCells)) return false;

  if (level.blockType === 'square') {
    return level.goal.orientation === 'standing';
  }

  return state.block.orientation === level.goal.orientation;
}

export function getTileDisplay(
  level: CubeLevel,
  state: CubeGameState,
  r: number,
  c: number,
): TileType | 'block' {
  const occupied = getOccupiedCells(state.block, level.blockType);
  if (occupied.some(([or, oc]) => or === r && oc === c)) return 'block';

  const tile = level.grid[r][c];
  if (tile === 'breakable' && state.brokenTiles.has(`${r},${c}`)) {
    return 'empty';
  }
  return tile;
}

export function orientationLabel(o: Orientation): string {
  switch (o) {
    case 'standing':
      return 'De pie ■';
    case 'horizontal':
      return 'Acostado ▬';
    case 'vertical':
      return 'Acostado ▮';
  }
}
