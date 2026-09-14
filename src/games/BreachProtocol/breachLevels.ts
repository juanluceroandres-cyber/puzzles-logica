import type { BreachLevel } from './types';

export const BREACH_LEVELS: Record<string, BreachLevel> = {
  easy: {
    id: 'breach-easy',
    difficulty: 'easy',
    size: 4,
    bufferSize: 5,
    timeLimitMs: 120_000,
    matrix: [
      ['7A', '55', '1C', 'BD'],
      ['FF', '7A', '55', 'E9'],
      ['1C', 'BD', '7A', '55'],
      ['E9', '1C', 'FF', '7A'],
    ],
    sequences: [{ id: 's1', codes: ['7A', '1C', 'FF'] }],
  },
  normal: {
    id: 'breach-normal',
    difficulty: 'normal',
    size: 5,
    bufferSize: 6,
    timeLimitMs: 90_000,
    matrix: [
      ['BD', '1C', '7A', '55', 'E9'],
      ['55', 'FF', 'BD', '1C', '7A'],
      ['7A', '55', 'E9', 'FF', '1C'],
      ['1C', '7A', '55', 'BD', 'FF'],
      ['FF', 'E9', '1C', '7A', 'BD'],
    ],
    sequences: [
      { id: 's1', codes: ['7A', '55', 'E9'] },
      { id: 's2', codes: ['BD', '1C', 'FF'] },
    ],
  },
  hard: {
    id: 'breach-hard',
    difficulty: 'hard',
    size: 6,
    bufferSize: 7,
    timeLimitMs: 60_000,
    matrix: [
      ['7A', '55', '1C', 'BD', 'FF', 'E9'],
      ['FF', '7A', '55', '1C', 'BD', '7A'],
      ['1C', 'BD', '7A', '55', 'E9', '1C'],
      ['E9', '1C', 'FF', '7A', '55', 'BD'],
      ['55', 'E9', '1C', 'FF', '7A', '55'],
      ['BD', 'FF', 'E9', '1C', '7A', 'FF'],
    ],
    sequences: [
      { id: 's1', codes: ['7A', '1C', '55', 'E9'] },
      { id: 's2', codes: ['BD', '7A', 'FF'] },
      { id: 's3', codes: ['1C', 'BD', '7A'] },
    ],
  },
};
