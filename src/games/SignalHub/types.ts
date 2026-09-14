import type { Difficulty } from '../../types/common';

export type SignalColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Endpoint {
  row: number;
  col: number;
  color: SignalColor;
}

export interface SignalLevel {
  id: string;
  difficulty: Difficulty;
  size: number;
  endpoints: Endpoint[];
  obstacles: [number, number][];
}

export type CellContent =
  | { type: 'empty' }
  | { type: 'obstacle' }
  | { type: 'endpoint'; color: SignalColor }
  | { type: 'path'; color: SignalColor };
