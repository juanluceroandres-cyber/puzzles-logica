import type { BlockState, BlockType, CubeGameState, CubeLevel, Orientation, TileType } from './types';

type Dir = 'up' | 'down' | 'left' | 'right';

const DIR_DELTA: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export function getOccupiedCells(
  block: BlockState,
  blockType: BlockType,
): [number, number][] {
  if (blockType === 'square') {
    return [[block.row, block.col]];
  }
  if (block.orientation === 'vertical') {
    return [
      [block.row, block.col],
      [block.row + 1, block.col],
    ];
  }
  return [
    [block.row, block.col],
    [block.row, block.col + 1],
  ];
}

/** WW-style: el bloque se desliza en la dirección pulsada manteniendo orientación. */
function slideRectangle(block: BlockState, dir: Dir): BlockState {
  const [dr, dc] = DIR_DELTA[dir];
  return {
    row: block.row + dr,
    col: block.col + dc,
    orientation: block.orientation,
  };
}

function moveSquare(block: BlockState, dir: Dir): BlockState {
  const [dr, dc] = DIR_DELTA[dir];
  return { ...block, row: block.row + dr, col: block.col + dc };
}

function blockFits(
  level: CubeLevel,
  block: BlockState,
  brokenTiles: Set<string>,
): boolean {
  const cells = getOccupiedCells(block, level.blockType);
  for (const [r, c] of cells) {
    if (r < 0 || r >= level.size || c < 0 || c >= level.size) return false;
    const tile = level.grid[r][c];
    const key = `${r},${c}`;
    if (tile === 'wall') return false;
    if (tile === 'breakable' && brokenTiles.has(key)) return false;
  }
  return true;
}

export function tryMove(
  level: CubeLevel,
  state: CubeGameState,
  dir: Dir,
): { ok: boolean; state: CubeGameState; fell: boolean; laser: boolean } {
  const newBlock =
    level.blockType === 'square'
      ? moveSquare(state.block, dir)
      : slideRectangle(state.block, dir);

  if (!blockFits(level, newBlock, state.brokenTiles)) {
    return { ok: false, state, fell: false, laser: false };
  }

  const cells = getOccupiedCells(newBlock, level.blockType);
  let fell = false;
  let laser = false;
  for (const [r, c] of cells) {
    const tile = level.grid[r][c];
    if (tile === 'hole') fell = true;
    if (tile === 'laser') laser = true;
  }

  const brokenTiles = new Set(state.brokenTiles);
  for (const [r, c] of getOccupiedCells(state.block, level.blockType)) {
    if (level.grid[r][c] === 'breakable') {
      brokenTiles.add(`${r},${c}`);
    }
  }

  if (fell || laser) {
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
      fell,
      laser,
    };
  }

  return {
    ok: true,
    state: {
      block: newBlock,
      brokenTiles,
      moves: state.moves + 1,
    },
    fell: false,
    laser: false,
  };
}

/** Rotar el bloque rectangular en su sitio (como alinear con la meta en WW). */
export function tryRotate(
  level: CubeLevel,
  state: CubeGameState,
): { ok: boolean; state: CubeGameState } {
  if (level.blockType !== 'rectangle') return { ok: false, state };

  const newOrientation: Orientation =
    state.block.orientation === 'vertical' ? 'horizontal' : 'vertical';
  const newBlock: BlockState = { ...state.block, orientation: newOrientation };

  if (!blockFits(level, newBlock, state.brokenTiles)) {
    return { ok: false, state };
  }

  return {
    ok: true,
    state: {
      ...state,
      block: newBlock,
      moves: state.moves + 1,
    },
  };
}

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

export function checkVictory(level: CubeLevel, state: CubeGameState): boolean {
  const cells = getOccupiedCells(state.block, level.blockType);
  const goalCells: [number, number][] =
    level.goal.orientation === 'horizontal'
      ? [
          [level.goal.row, level.goal.col],
          [level.goal.row, level.goal.col + 1],
        ]
      : level.goal.orientation === 'vertical'
        ? [
            [level.goal.row, level.goal.col],
            [level.goal.row + 1, level.goal.col],
          ]
        : [[level.goal.row, level.goal.col]];

  const onGoal = cells.every(([r, c]) =>
    goalCells.some(([gr, gc]) => gr === r && gc === c),
  );
  if (!onGoal) return false;

  if (level.blockType === 'square') {
    return level.goal.orientation === 'standing';
  }
  if (level.goal.orientation === 'horizontal') {
    return state.block.orientation === 'horizontal';
  }
  if (level.goal.orientation === 'vertical' || level.goal.orientation === 'standing') {
    return state.block.orientation === 'vertical';
  }
  return false;
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
