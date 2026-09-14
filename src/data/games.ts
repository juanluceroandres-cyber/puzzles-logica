import type { GameInfo } from '../types/common';

export const GAMES: GameInfo[] = [
  {
    id: 'palette',
    name: 'Pintar el lienzo',
    icon: '🎨',
    description:
      'Convierte todo el tablero al color objetivo propagando colores desde tu región.',
  },
  {
    id: 'signal',
    name: 'Conectar colores',
    icon: '🔗',
    description:
      'Conecta cada par de nodos del mismo color sin que los caminos se crucen.',
  },
  {
    id: 'cube',
    name: 'Smartprint Cube',
    icon: '🧊',
    description:
      'Mueve el bloque hasta la meta respetando su orientación y los obstáculos.',
  },
  {
    id: 'breach',
    name: 'Breach Protocol',
    icon: '💻',
    description:
      'Selecciona códigos en la matriz alternando fila y columna para formar la secuencia.',
  },
  {
    id: 'matrix',
    name: 'Energy Matrix',
    icon: '⚡',
    description:
      'Coloca y rota piezas para cubrir todas las casillas objetivo del tablero.',
  },
];

export const DIFFICULTY_LABELS = {
  easy: 'Fácil',
  normal: 'Normal',
  hard: 'Difícil',
} as const;
