import type { BreachLevel, BreachState, BreachSequence, SequenceStatus } from './types';

export function isSubsequenceAt(buffer: string[], start: number, codes: string[]): boolean {
  let idx = 0;
  for (let i = start; i < buffer.length; i++) {
    if (buffer[i] === codes[idx]) idx++;
    if (idx === codes.length) return true;
  }
  return false;
}

export function getBestSubsequenceProgress(buffer: string[], codes: string[]): number {
  let best = 0;
  for (let start = 0; start < buffer.length; start++) {
    let idx = 0;
    for (let i = start; i < buffer.length; i++) {
      if (buffer[i] === codes[idx]) idx++;
    }
    best = Math.max(best, idx);
  }
  return best;
}

export function findCompletionStart(buffer: string[], codes: string[]): number | null {
  for (let start = 0; start < buffer.length; start++) {
    if (isSubsequenceAt(buffer, start, codes)) return start;
  }
  return null;
}

export function evaluateSequences(
  buffer: string[],
  sequences: BreachSequence[],
): SequenceStatus[] {
  return sequences.map((seq) => {
    const progress = getBestSubsequenceProgress(buffer, seq.codes);
    const completed = progress === seq.codes.length;
    const matchedAt = completed ? findCompletionStart(buffer, seq.codes) : null;
    return {
      id: seq.id,
      completed,
      progress,
      total: seq.codes.length,
      matchedAt,
    };
  });
}

export function initBreachState(level: BreachLevel): BreachState {
  return {
    buffer: [],
    selectedCells: [],
    lastCell: null,
    nextPhase: 'row',
    sequenceStatuses: evaluateSequences([], level.sequences),
    failed: false,
  };
}

export function canSelectCell(
  state: BreachState,
  row: number,
  col: number,
  level: BreachLevel,
): boolean {
  if (state.failed || state.buffer.length >= level.bufferSize) return false;

  if (state.lastCell === null) {
    return row === 0;
  }

  const [lr, lc] = state.lastCell;
  if (state.nextPhase === 'col') {
    return col === lc && row !== lr;
  }
  return row === lr && col !== lc;
}

export function getSelectableCells(
  state: BreachState,
  level: BreachLevel,
): Set<string> {
  const selectable = new Set<string>();
  for (let r = 0; r < level.size; r++) {
    for (let c = 0; c < level.size; c++) {
      if (canSelectCell(state, r, c, level)) {
        selectable.add(`${r},${c}`);
      }
    }
  }
  return selectable;
}

export function getActiveLineHighlight(
  state: BreachState,
): { type: 'row' | 'col'; index: number } | null {
  if (state.lastCell === null) return { type: 'row', index: 0 };
  if (state.nextPhase === 'col') return { type: 'col', index: state.lastCell[1] };
  return { type: 'row', index: state.lastCell[0] };
}

export function getCodeColor(code: string): string {
  const colors: Record<string, string> = {
    '7A': '#ff6b6b',
    '55': '#4ecdc4',
    '1C': '#ffe66d',
    BD: '#a78bfa',
    FF: '#ff8c42',
    E9: '#56cfe1',
  };
  return colors[code] ?? '#8b92a8';
}

export function getSuggestedCodes(
  state: BreachState,
  level: BreachLevel,
): Set<string> {
  const suggested = new Set<string>();
  for (const seq of level.sequences) {
    const status = state.sequenceStatuses.find((s) => s.id === seq.id);
    if (!status || status.completed) continue;
    const nextCode = seq.codes[status.progress];
    if (nextCode) suggested.add(nextCode);
  }
  return suggested;
}

export function selectCell(
  state: BreachState,
  row: number,
  col: number,
  level: BreachLevel,
): BreachState {
  if (!canSelectCell(state, row, col, level)) return state;

  const code = level.matrix[row][col];
  const buffer = [...state.buffer, code];
  const selectedCells: [number, number][] = [...state.selectedCells, [row, col]];
  const sequenceStatuses = evaluateSequences(buffer, level.sequences);

  let failed = false;
  if (buffer.length >= level.bufferSize) {
    const allDone = sequenceStatuses.every((s) => s.completed);
    if (!allDone) failed = true;
  }

  return {
    buffer,
    selectedCells,
    lastCell: [row, col],
    nextPhase: state.nextPhase === 'row' ? 'col' : 'row',
    sequenceStatuses,
    failed,
  };
}

export function checkVictory(state: BreachState, _level: BreachLevel): boolean {
  return state.sequenceStatuses.every((s) => s.completed);
}

export function getProgress(state: BreachState, level: BreachLevel): number {
  const total = level.sequences.reduce((sum, s) => sum + s.codes.length, 0);
  const done = state.sequenceStatuses.reduce((sum, s) => sum + s.progress, 0);
  return total > 0 ? done / total : 0;
}

export function getSelectionHint(state: BreachState): string {
  if (state.lastCell === null) {
    return 'Paso 1 — Elige un código en la fila superior (resaltada)';
  }
  if (state.nextPhase === 'col') {
    return `Paso ${state.buffer.length + 1} — Elige en la columna ${state.lastCell[1] + 1} (resaltada)`;
  }
  return `Paso ${state.buffer.length + 1} — Elige en la fila ${state.lastCell[0] + 1} (resaltada)`;
}

export function isOnSelectedPath(state: BreachState, row: number, col: number): boolean {
  return state.selectedCells.some(([r, c]) => r === row && c === col);
}

export function getPathIndex(state: BreachState, row: number, col: number): number {
  return state.selectedCells.findIndex(([r, c]) => r === row && c === col);
}
