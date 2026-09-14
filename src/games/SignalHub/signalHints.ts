import type { SignalColor } from './types';

/** Orden recomendado y consejos para el nivel difícil (7×7). */
export const HARD_SOLVE_ORDER: SignalColor[] = [
  'red',
  'blue',
  'yellow',
  'purple',
  'green',
];

export const HARD_HINTS: Partial<Record<SignalColor, string>> = {
  red: 'Rojo: conecta por la fila superior (0,0)→(0,6) o rodea por abajo.',
  blue: 'Azul: usa la fila 3; pasa por debajo del obstáculo central.',
  yellow: 'Amarillo: une (1,3) con (5,3) bajando por la columna 3.',
  purple: 'Morado: conecta (2,1) con (5,5) rodeando los caminos ya trazados.',
  green: 'Verde: deja el verde para el final — usa la fila inferior.',
};

export function getNextHintColor(
  connectedColors: Set<SignalColor>,
): SignalColor | null {
  for (const color of HARD_SOLVE_ORDER) {
    if (!connectedColors.has(color)) return color;
  }
  return null;
}
