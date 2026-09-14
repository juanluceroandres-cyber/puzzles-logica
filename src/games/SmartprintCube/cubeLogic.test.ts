/**
 * Pruebas obligatorias de la máquina de estados Smartprint Cube.
 * Ejecutar: npx tsx src/games/SmartprintCube/cubeLogic.test.ts
 */
import {
  checkVictory,
  getNextCubeState,
  getOccupiedCells,
  isValidCubeState,
  moveCube,
} from './cubeLogic';
import type { BlockState, CubeLevel, CubeGameState } from './types';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${msg}`);
  }
}

function assertBlock(
  block: BlockState,
  row: number,
  col: number,
  orientation: BlockState['orientation'],
  label: string,
) {
  assert(block.row === row, `${label} row: expected ${row}, got ${block.row}`);
  assert(block.col === col, `${label} col: expected ${col}, got ${block.col}`);
  assert(block.orientation === orientation, `${label} orient: expected ${orientation}, got ${block.orientation}`);
}

const STANDING: BlockState = { row: 2, col: 2, orientation: 'standing' };
const RECT = 'rectangle' as const;

// TEST 1-4: STANDING + directions (anchor = primera celda ocupada)
assertBlock(getNextCubeState(STANDING, RECT, 'right'), 2, 3, 'horizontal', 'TEST 1');
assertBlock(getNextCubeState(STANDING, RECT, 'left'), 2, 0, 'horizontal', 'TEST 2');
assertBlock(getNextCubeState(STANDING, RECT, 'up'), 0, 2, 'vertical', 'TEST 3');
assertBlock(getNextCubeState(STANDING, RECT, 'down'), 3, 2, 'vertical', 'TEST 4');

// TEST 5-8: HORIZONTAL
const H: BlockState = { row: 2, col: 2, orientation: 'horizontal' };
assertBlock(getNextCubeState(H, RECT, 'right'), 2, 4, 'standing', 'TEST 5');
assertBlock(getNextCubeState(H, RECT, 'left'), 2, 1, 'standing', 'TEST 6');
assertBlock(getNextCubeState(H, RECT, 'up'), 1, 2, 'horizontal', 'TEST 7');
assertBlock(getNextCubeState(H, RECT, 'down'), 3, 2, 'horizontal', 'TEST 8');

// TEST 9-12: VERTICAL
const V: BlockState = { row: 2, col: 2, orientation: 'vertical' };
assertBlock(getNextCubeState(V, RECT, 'up'), 1, 2, 'standing', 'TEST 9');
assertBlock(getNextCubeState(V, RECT, 'down'), 4, 2, 'standing', 'TEST 10');
assertBlock(getNextCubeState(V, RECT, 'left'), 2, 1, 'vertical', 'TEST 11');
assertBlock(getNextCubeState(V, RECT, 'right'), 2, 3, 'vertical', 'TEST 12');

function cellsEqual(a: [number, number][], b: [number, number][], label: string) {
  const setA = new Set(a.map(([r, c]) => `${r},${c}`));
  const ok = b.length === a.length && b.every(([r, c]) => setA.has(`${r},${c}`));
  assert(ok, label);
}

function assertOriginalCellFree(
  from: BlockState,
  dir: Parameters<typeof getNextCubeState>[2],
  label: string,
) {
  const next = getNextCubeState(from, RECT, dir);
  const cells = getOccupiedCells(next, RECT);
  assert(
    !cells.some(([r, c]) => r === from.row && c === from.col),
    `${label}: original cell (${from.row},${from.col}) must be free`,
  );
}

// STANDING + RIGHT: (r,c+1) + (r,c+2), NOT (r,c) + (r,c+1)
cellsEqual(
  getOccupiedCells(getNextCubeState(STANDING, RECT, 'right'), RECT),
  [
    [2, 3],
    [2, 4],
  ],
  'TEST 1 cells: horizontal rolls right',
);
assertOriginalCellFree(STANDING, 'right', 'TEST 1');

// STANDING + LEFT: (r,c-2) + (r,c-1)
cellsEqual(
  getOccupiedCells(getNextCubeState(STANDING, RECT, 'left'), RECT),
  [
    [2, 0],
    [2, 1],
  ],
  'TEST 2 cells: horizontal rolls left',
);
assertOriginalCellFree(STANDING, 'left', 'TEST 2');

// STANDING + UP: (r-2,c) + (r-1,c)
cellsEqual(
  getOccupiedCells(getNextCubeState(STANDING, RECT, 'up'), RECT),
  [
    [0, 2],
    [1, 2],
  ],
  'TEST 3 cells: vertical rolls up',
);
assertOriginalCellFree(STANDING, 'up', 'TEST 3');

// STANDING + DOWN: (r+1,c) + (r+2,c)
cellsEqual(
  getOccupiedCells(getNextCubeState(STANDING, RECT, 'down'), RECT),
  [
    [3, 2],
    [4, 2],
  ],
  'TEST 4 cells: vertical rolls down',
);
assertOriginalCellFree(STANDING, 'down', 'TEST 4');

// TEST 13-14: obstacles block both cells
const levelObstacle: CubeLevel = {
  id: 'test',
  difficulty: 'easy',
  size: 5,
  blockType: 'rectangle',
  startRow: 0,
  startCol: 0,
  startOrientation: 'standing',
  goal: { row: 4, col: 4, orientation: 'standing' },
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'wall', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
};

// Horizontal rolling down: second occupied cell would land on wall at (2,1)
const hBlock: BlockState = { row: 1, col: 0, orientation: 'horizontal' };
const hNext = getNextCubeState(hBlock, RECT, 'down');
assert(
  !isValidCubeState(hNext, levelObstacle, new Set()).valid,
  'TEST 13: horizontal blocked by wall in second cell',
);

// Vertical standing up: standing cell would land on wall at (2,1)
const vBlock: BlockState = { row: 0, col: 1, orientation: 'vertical' };
const vNext = getNextCubeState(vBlock, RECT, 'down');
assert(
  !isValidCubeState(vNext, levelObstacle, new Set()).valid,
  'TEST 14: vertical blocked by wall in second cell',
);

// TEST 15: victory requires full match + orientation
const goalLevel: CubeLevel = {
  id: 'goal-test',
  difficulty: 'normal',
  size: 5,
  blockType: 'rectangle',
  startRow: 0,
  startCol: 0,
  startOrientation: 'standing',
  goal: { row: 2, col: 1, orientation: 'horizontal' },
  grid: Array.from({ length: 5 }, () => Array(5).fill('empty') as CubeLevel['grid'][0]),
};
goalLevel.grid[2][1] = 'goal';
goalLevel.grid[2][2] = 'goal';

const partialWin: CubeGameState = {
  block: { row: 2, col: 1, orientation: 'standing' },
  brokenTiles: new Set(),
  moves: 1,
};
assert(!checkVictory(goalLevel, partialWin), 'TEST 15a: standing on goal cells is not victory');

const fullWin: CubeGameState = {
  block: { row: 2, col: 1, orientation: 'horizontal' },
  brokenTiles: new Set(),
  moves: 2,
};
assert(checkVictory(goalLevel, fullWin), 'TEST 15b: horizontal exactly on goal wins');

// Invalid move does not increment moves
const moveState: CubeGameState = {
  block: { row: 0, col: 0, orientation: 'standing' },
  brokenTiles: new Set(),
  moves: 5,
};
const invalid = moveCube(
  { ...levelObstacle, blockType: 'rectangle', startRow: 0, startCol: 0, startOrientation: 'standing' },
  moveState,
  'left',
);
assert(!invalid.ok && invalid.state.moves === 5, 'Invalid move preserves move count');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
