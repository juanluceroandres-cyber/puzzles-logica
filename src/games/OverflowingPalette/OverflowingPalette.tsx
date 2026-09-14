import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameHeader } from '../../components/GameHeader';
import { Tutorial } from '../../components/Tutorial';
import type { Difficulty, GameResultData } from '../../types/common';
import { calculateScore, isOptimalSolution } from '../../utils/scoring';
import { saveResult } from '../../utils/storage';
import {
  applyColor,
  getAvailableColors,
  getProgress,
  initPaletteState,
  isVictory,
} from './paletteLogic';
import { PALETTE_LEVELS } from './paletteLevels';
import type { ColorId, PaletteState } from './types';

const COLOR_MAP: Record<ColorId, string> = {
  red: '#e74c6a',
  blue: '#4a9eff',
  green: '#3ecf8e',
  yellow: '#f5c542',
  purple: '#a78bfa',
};

const MAX_BONUS_MOVES = 4;

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

export function OverflowingPalette({ difficulty, onFinish, onMenu }: Props) {
  const level = PALETTE_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [state, setState] = useState<PaletteState>(() => initPaletteState(level));
  const [sessionFailures, setSessionFailures] = useState(0);
  const [restarts, setRestarts] = useState(0);
  const [lastColor, setLastColor] = useState<ColorId | null>(null);
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);

  const bonusMoves = useMemo(
    () => Math.min(MAX_BONUS_MOVES, sessionFailures),
    [sessionFailures],
  );
  const maxMoves = level.maxMoves + bonusMoves;

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime.current), 200);
    return () => clearInterval(id);
  }, [showTutorial]);

  const handleRestart = useCallback(() => {
    setState(initPaletteState(level));
    setRestarts((r) => r + 1);
    setLastColor(null);
    startTime.current = Date.now();
    setElapsed(0);
    finished.current = false;
  }, [level]);

  const finish = useCallback(
    (won: boolean, moves: number) => {
      if (finished.current) return;
      finished.current = true;
      const timeMs = Date.now() - startTime.current;
      const optimal = isOptimalSolution(moves, level.optimalMoves);
      const score = calculateScore({
        difficulty,
        timeMs,
        moves,
        maxMoves,
        optimalMoves: level.optimalMoves,
        restarts,
        won,
      });
      saveResult('palette', difficulty, score, won);
      if (!won) setSessionFailures((f) => f + 1);
      onFinish(won, {
        score,
        timeMs,
        moves,
        restarts,
        isOptimal: optimal,
        extra: won
          ? {
              'Movimientos restantes': maxMoves - moves,
              ...(bonusMoves > 0 ? { 'Ayuda extra': `+${bonusMoves} movimientos` } : {}),
            }
          : undefined,
      });
    },
    [bonusMoves, difficulty, level, maxMoves, onFinish, restarts],
  );

  const handleColorSelect = (color: ColorId) => {
    if (finished.current) return;
    setLastColor(color);
    const next = applyColor(state, color);
    setState(next);

    if (isVictory(next, level.targetColor)) {
      finish(true, next.moves);
    } else if (next.moves >= maxMoves) {
      finish(false, next.moves);
    }
  };

  const available = getAvailableColors(state, level.colors);
  const progress = getProgress(state, level.targetColor);

  return (
    <div className="game-screen">
      {showTutorial && (
        <Tutorial
          title="Pintar el lienzo"
          steps={[
            'Tu región comienza en la esquina superior izquierda (borde blanco).',
            'Elige un color de la paleta para expandir tu región.',
            'El color se propaga a todos los bloques conectados de tu región.',
            `Convierte todo el tablero a ${level.targetColor} en ${maxMoves} movimientos o menos.`,
            'Si fallas varias veces en esta sesión, recibirás movimientos extra (se reinician al refrescar).',
          ]}
          onStart={() => {
            setShowTutorial(false);
            startTime.current = Date.now();
          }}
        />
      )}
      <GameHeader
        title="Pintar el lienzo"
        moves={state.moves}
        maxMoves={maxMoves}
        timeMs={elapsed}
        progress={progress}
        onRestart={handleRestart}
        onMenu={onMenu}
      />

      {bonusMoves > 0 && (
        <p className="game-hint game-hint--bonus">
          +{bonusMoves} movimientos de ayuda por fallos en esta sesión
        </p>
      )}

      <div className="palette-target">
        Objetivo:{' '}
        <span
          className="color-swatch"
          style={{ background: COLOR_MAP[level.targetColor] }}
        />
        {level.targetColor}
      </div>

      <div
        className="palette-board"
        style={{
          gridTemplateColumns: `repeat(${level.boardSize}, 1fr)`,
        }}
      >
        {state.board.map((row, r) =>
          row.map((color, c) => {
            const isOwned = state.ownedRegion.has(`${r},${c}`);
            const justChanged = lastColor && isOwned && color === lastColor;
            return (
              <div
                key={`${r}-${c}`}
                className={`palette-cell ${isOwned ? 'palette-cell--owned' : ''} ${justChanged ? 'palette-cell--pulse' : ''}`}
                style={{ background: COLOR_MAP[color] }}
              />
            );
          }),
        )}
      </div>

      <div className="palette-colors">
        {available.map((color) => (
          <button
            key={color}
            type="button"
            className="palette-color-btn"
            style={{ background: COLOR_MAP[color] }}
            onClick={() => handleColorSelect(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
