import type { SignalColor, SignalLevel } from './types';
import { getEndpointPairs } from './pathLogic';

/** Orden recomendado para el nivel difícil (7×7). */
export const HARD_SOLVE_ORDER: SignalColor[] = [
  'red',
  'blue',
  'yellow',
  'purple',
  'green',
];

export const COLOR_LABELS: Record<SignalColor, string> = {
  red: 'Rojo',
  blue: 'Azul',
  green: 'Verde',
  yellow: 'Amarillo',
  purple: 'Morado',
  orange: 'Naranja',
};

/** Consejo corto sin coordenadas — la ruta se muestra en el tablero. */
export const HARD_HINT_LABELS: Partial<Record<SignalColor, string>> = {
  red: 'Sigue la fila superior de un extremo al otro.',
  blue: 'Sube por la izquierda, cruza arriba y baja por la derecha.',
  yellow: 'Une los dos nodos amarillos en línea recta vertical.',
  purple: 'Baja por la izquierda y luego avanza hacia la esquina inferior derecha.',
  green: 'Sigue la fila inferior de un extremo al otro.',
};

/**
 * Solución verificada del nivel difícil — las pistas siguen estas rutas
 * para no bloquear colores posteriores.
 */
export const HARD_SOLUTION_PATHS: Partial<Record<SignalColor, [number, number][]>> = {
  red: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  ],
  blue: [
    [3, 0], [2, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 6], [2, 5], [2, 4], [3, 4], [3, 5], [3, 6],
  ],
  yellow: [[2, 2], [3, 2], [4, 2]],
  purple: [
    [2, 1], [3, 1], [4, 1], [4, 0], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5],
  ],
  green: [
    [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
  ],
};

export function getNextHintColor(
  connectedColors: Set<SignalColor>,
): SignalColor | null {
  for (const color of HARD_SOLVE_ORDER) {
    if (!connectedColors.has(color)) return color;
  }
  return null;
}

function pathConflictsWithExisting(
  candidate: [number, number][],
  color: SignalColor,
  existingPaths: Map<SignalColor, [number, number][]>,
): boolean {
  const candidateSet = new Set(candidate.map(([r, c]) => `${r},${c}`));

  for (const [pathColor, path] of existingPaths) {
    if (pathColor === color) continue;
    for (const [r, c] of path) {
      if (candidateSet.has(`${r},${c}`)) return true;
    }
  }

  return false;
}

/** Devuelve la ruta canónica de la pista si sigue siendo válida con los caminos actuales. */
export function findHintPath(
  level: SignalLevel,
  existingPaths: Map<SignalColor, [number, number][]>,
  color: SignalColor,
): [number, number][] | null {
  const canonical = HARD_SOLUTION_PATHS[color];
  if (!canonical) return null;

  for (const [r, c] of level.obstacles) {
    if (canonical.some(([cr, cc]) => cr === r && cc === c)) return null;
  }

  if (pathConflictsWithExisting(canonical, color, existingPaths)) {
    return null;
  }

  const pairs = getEndpointPairs(level);
  const pair = pairs.get(color);
  if (!pair) return null;

  const pathSet = new Set(canonical.map(([r, c]) => `${r},${c}`));
  const a = `${pair[0].row},${pair[0].col}`;
  const b = `${pair[1].row},${pair[1].col}`;
  if (!pathSet.has(a) || !pathSet.has(b)) return null;

  return canonical;
}
