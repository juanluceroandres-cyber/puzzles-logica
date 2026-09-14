import type { Difficulty } from '../../types/common';

export interface BreachSequence {
  id: string;
  codes: string[];
}

export interface BreachLevel {
  id: string;
  difficulty: Difficulty;
  size: number;
  matrix: string[][];
  sequences: BreachSequence[];
  bufferSize: number;
  timeLimitMs: number;
}

export type SelectionPhase = 'row' | 'col';

export interface SequenceStatus {
  id: string;
  completed: boolean;
  progress: number;
  total: number;
  matchedAt: number | null;
}

export interface BreachState {
  buffer: string[];
  selectedCells: [number, number][];
  lastCell: [number, number] | null;
  nextPhase: SelectionPhase;
  sequenceStatuses: SequenceStatus[];
  failed: boolean;
}
