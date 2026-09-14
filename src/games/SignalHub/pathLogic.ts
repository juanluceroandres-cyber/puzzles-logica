import type { CellContent, Endpoint, SignalColor, SignalLevel } from './types';

export const SIGNAL_COLORS: Record<SignalColor, string> = {
  red: '#e74c6a',
  blue: '#4a9eff',
  green: '#3ecf8e',
  yellow: '#f5c542',
  purple: '#a78bfa',
  orange: '#ff8c42',
};

export function buildGrid(level: SignalLevel): CellContent[][] {
  const grid: CellContent[][] = Array.from({ length: level.size }, () =>
    Array.from({ length: level.size }, () => ({ type: 'empty' as const })),
  );

  for (const [r, c] of level.obstacles) {
    grid[r][c] = { type: 'obstacle' };
  }
  for (const ep of level.endpoints) {
    grid[ep.row][ep.col] = { type: 'endpoint', color: ep.color };
  }
  return grid;
}

export function getEndpointPairs(level: SignalLevel): Map<SignalColor, [Endpoint, Endpoint]> {
  const map = new Map<SignalColor, Endpoint[]>();
  for (const ep of level.endpoints) {
    const list = map.get(ep.color) ?? [];
    list.push(ep);
    map.set(ep.color, list);
  }
  const pairs = new Map<SignalColor, [Endpoint, Endpoint]>();
  for (const [color, eps] of map) {
    if (eps.length === 2) pairs.set(color, [eps[0], eps[1]]);
  }
  return pairs;
}

export function pathsToGrid(
  base: CellContent[][],
  paths: Map<SignalColor, [number, number][]>,
): CellContent[][] {
  const grid = base.map((row) => row.map((c) => ({ ...c })));
  for (const [color, cells] of paths) {
    for (const [r, c] of cells) {
      const cell = grid[r][c];
      if (cell.type === 'endpoint' && cell.color === color) continue;
      if (cell.type === 'empty' || cell.type === 'path') {
        grid[r][c] = { type: 'path', color };
      }
    }
  }
  return grid;
}

export function isAdjacent(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

export function isValidPathExtension(
  path: [number, number][],
  next: [number, number],
  size: number,
  base: CellContent[][],
  activeColor: SignalColor,
  allPaths: Map<SignalColor, [number, number][]>,
): boolean {
  const [r, c] = next;
  if (r < 0 || r >= size || c < 0 || c >= size) return false;

  const cell = base[r][c];
  if (cell.type === 'obstacle') return false;

  const last = path[path.length - 1];
  if (!isAdjacent(last, next)) return false;

  if (path.some(([pr, pc]) => pr === r && pc === c)) return false;

  for (const [color, p] of allPaths) {
    if (color === activeColor) continue;
    if (p.some(([pr, pc]) => pr === r && pc === c)) return false;
  }

  if (cell.type === 'endpoint' && cell.color !== activeColor) return false;

  return true;
}

/** Verifica que el camino incluya ambos nodos y los una de forma continua. */
export function isPairConnected(
  path: [number, number][],
  a: Endpoint,
  b: Endpoint,
): boolean {
  if (path.length < 2) return false;

  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
  if (!pathSet.has(`${a.row},${a.col}`) || !pathSet.has(`${b.row},${b.col}`)) {
    return false;
  }

  const queue: [number, number][] = [[a.row, a.col]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (r === b.row && c === b.col) return true;

    for (const [dr, dc] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (pathSet.has(`${nr},${nc}`)) queue.push([nr, nc]);
    }
  }
  return false;
}

export function isColorConnected(
  level: SignalLevel,
  paths: Map<SignalColor, [number, number][]>,
  color: SignalColor,
): boolean {
  const pairs = getEndpointPairs(level);
  const pair = pairs.get(color);
  const path = paths.get(color);
  if (!pair || !path) return false;
  return isPairConnected(path, pair[0], pair[1]);
}

export function checkVictory(
  level: SignalLevel,
  paths: Map<SignalColor, [number, number][]>,
): boolean {
  const pairs = getEndpointPairs(level);
  if (pairs.size === 0) return false;

  for (const [color, [a, b]] of pairs) {
    const path = paths.get(color);
    if (!path || !isPairConnected(path, a, b)) return false;
  }
  return paths.size === pairs.size;
}

export function getConnectionProgress(
  level: SignalLevel,
  paths: Map<SignalColor, [number, number][]>,
): number {
  const pairs = getEndpointPairs(level);
  if (pairs.size === 0) return 0;

  let connected = 0;
  for (const [color, [a, b]] of pairs) {
    const path = paths.get(color);
    if (path && isPairConnected(path, a, b)) connected++;
  }
  return connected / pairs.size;
}

export function countMoves(paths: Map<SignalColor, [number, number][]>): number {
  let total = 0;
  for (const path of paths.values()) {
    total += Math.max(0, path.length - 1);
  }
  return total;
}
