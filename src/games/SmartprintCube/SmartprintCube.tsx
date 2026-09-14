import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from '../../components/GameHeader';
import { Tutorial } from '../../components/Tutorial';
import type { Difficulty, GameResultData } from '../../types/common';
import { calculateScore } from '../../utils/scoring';
import { saveResult } from '../../utils/storage';
import {
  checkVictory,
  getOccupiedCells,
  getTileDisplay,
  initCubeState,
  moveCube,
  orientationLabel,
} from './cubeLogic';
import { CUBE_LEVELS } from './cubeLevels';
import type { BlockState, CubeDirection, CubeGameState, Orientation } from './types';

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

const TILE_CLASS: Record<string, string> = {
  empty: 'cube-cell--empty',
  wall: 'cube-cell--wall',
  hole: 'cube-cell--hole',
  goal: 'cube-cell--goal',
  breakable: 'cube-cell--breakable',
  laser: 'cube-cell--laser',
};

export function SmartprintCube({ difficulty, onFinish, onMenu }: Props) {
  const level = CUBE_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [state, setState] = useState<CubeGameState>(() => initCubeState(level));
  const [restarts, setRestarts] = useState(0);
  const [anim, setAnim] = useState<{ dir: CubeDirection; from: BlockState; to: BlockState } | null>(
    null,
  );
  const [feedback, setFeedback] = useState('');
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime.current), 200);
    return () => clearInterval(id);
  }, [showTutorial]);

  const handleRestart = useCallback(() => {
    setState(initCubeState(level));
    setRestarts((r) => r + 1);
    setAnim(null);
    setFeedback('');
    isAnimating.current = false;
    startTime.current = Date.now();
    setElapsed(0);
    finished.current = false;
  }, [level]);

  const finish = useCallback(
    (won: boolean, moves: number) => {
      if (finished.current) return;
      finished.current = true;
      const timeMs = Date.now() - startTime.current;
      const score = calculateScore({
        difficulty,
        timeMs,
        moves,
        maxMoves: level.maxMoves,
        restarts,
        won,
      });
      saveResult('cube', difficulty, score, won);
      onFinish(won, { score, timeMs, moves, restarts });
    },
    [difficulty, level.maxMoves, onFinish, restarts],
  );

  const move = useCallback(
    (dir: CubeDirection) => {
      if (finished.current || isAnimating.current) return;

      const fromBlock = state.block;
      const result = moveCube(level, state, dir);

      if (!result.ok) {
        setFeedback('Movimiento inválido — no hay espacio');
        setTimeout(() => setFeedback(''), 700);
        return;
      }

      isAnimating.current = true;
      setAnim({ dir, from: fromBlock, to: result.state.block });

      if (result.fell) {
        setFeedback('¡Caíste en un hueco! Reiniciando…');
        setRestarts((r) => r + 1);
      } else if (result.laser) {
        setFeedback('¡Láser! Reiniciando…');
        setRestarts((r) => r + 1);
      } else {
        setFeedback(
          `${orientationLabel(fromBlock.orientation)} → ${orientationLabel(result.state.block.orientation)}`,
        );
      }

      setTimeout(() => {
        setState(result.state);
        setAnim(null);
        isAnimating.current = false;
        if (result.fell || result.laser) setFeedback('');

        if (checkVictory(level, result.state)) {
          finish(true, result.state.moves);
        } else if (level.maxMoves && result.state.moves >= level.maxMoves) {
          finish(false, result.state.moves);
        }
      }, 300);
    },
    [level, state, finish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const map: Record<string, CubeDirection> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      };
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const displayBlock = anim ? anim.to : state.block;
  const progress = checkVictory(level, state) ? 1 : Math.min(0.9, state.moves / (level.maxMoves ?? 30));
  const tumbleClass = anim ? getTumbleClass(anim.from.orientation, anim.to.orientation, anim.dir) : '';

  return (
    <div className="game-screen cube-screen">
      {showTutorial && (
        <Tutorial
          title="Smartprint Cube"
          steps={[
            'El bloque rectangular tiene 3 estados: de pie ■, acostado ▬ (horizontal) o ▮ (vertical).',
            'De pie + ←/→ = se tumba horizontal. De pie + ↑/↓ = se tumba vertical.',
            'Acostado + dirección de su eje = rueda. Acostado + eje perpendicular = se levanta de pie.',
            'Usa solo las flechas o WASD — cada pulsación es un movimiento.',
            `Meta: orientación ${orientationLabel(level.goal.orientation)} en la zona verde.`,
          ]}
          onStart={() => {
            setShowTutorial(false);
            startTime.current = Date.now();
          }}
        />
      )}
      <GameHeader
        title="Smartprint Cube"
        moves={state.moves}
        maxMoves={level.maxMoves}
        timeMs={elapsed}
        progress={progress}
        onRestart={handleRestart}
        onMenu={onMenu}
      />

      {level.blockType === 'rectangle' && (
        <div className="cube-orientation-badge">
          Estado: <strong>{orientationLabel(displayBlock.orientation)}</strong>
        </div>
      )}

      {feedback && (
        <p className={`game-hint cube-feedback ${feedback.includes('!') ? 'game-hint--warn' : ''}`}>
          {feedback}
        </p>
      )}

      <div className="cube-board-wrapper">
        <div
          className="cube-board"
          style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }}
        >
          {Array.from({ length: level.size }, (_, r) =>
            Array.from({ length: level.size }, (_, c) => {
              const display = getTileDisplay(level, state, r, c);
              const isBlockCell = getOccupiedCells(displayBlock, level.blockType).some(
                ([br, bc]) => br === r && bc === c,
              );
              return (
                <div
                  key={`${r}-${c}`}
                  className={`cube-cell ${TILE_CLASS[isBlockCell ? 'empty' : display]}`}
                />
              );
            }),
          )}
        </div>

        <div
          className={`cube-block cube-block--${displayBlock.orientation} ${tumbleClass}`}
          style={getBlockStyle(displayBlock, level.blockType, level.size)}
        >
          <div className="cube-block-inner">
            {level.blockType === 'rectangle' && (
              <span className="cube-block-glyph">{getGlyph(displayBlock.orientation)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="cube-controls">
        <button type="button" className="cube-btn" onClick={() => move('up')} disabled={isAnimating.current}>
          ↑
        </button>
        <div className="cube-controls-row">
          <button type="button" className="cube-btn" onClick={() => move('left')} disabled={isAnimating.current}>
            ←
          </button>
          <button type="button" className="cube-btn" onClick={() => move('down')} disabled={isAnimating.current}>
            ↓
          </button>
          <button type="button" className="cube-btn" onClick={() => move('right')} disabled={isAnimating.current}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function getGlyph(o: Orientation): string {
  switch (o) {
    case 'standing':
      return '■';
    case 'horizontal':
      return '▬';
    case 'vertical':
      return '▮';
  }
}

function getBlockStyle(
  block: BlockState,
  blockType: 'square' | 'rectangle',
  gridSize: number,
): React.CSSProperties {
  let cols = 1;
  let rows = 1;
  if (blockType === 'rectangle') {
    if (block.orientation === 'horizontal') cols = 2;
    else if (block.orientation === 'vertical') rows = 2;
  }
  return {
    top: `calc(${block.row} * (100% / ${gridSize}))`,
    left: `calc(${block.col} * (100% / ${gridSize}))`,
    width: `calc(${cols} * (100% / ${gridSize}))`,
    height: `calc(${rows} * (100% / ${gridSize}))`,
    transition: 'top 0.28s ease, left 0.28s ease, width 0.28s ease, height 0.28s ease',
  };
}

function getTumbleClass(
  from: Orientation,
  to: Orientation,
  dir: CubeDirection,
): string {
  if (from === to) return `cube-tumble--roll-${dir}`;
  if (from === 'standing' && to === 'horizontal') return `cube-tumble--fall-h-${dir}`;
  if (from === 'standing' && to === 'vertical') return `cube-tumble--fall-v-${dir}`;
  if (from === 'horizontal' && to === 'standing') return `cube-tumble--rise-h-${dir}`;
  if (from === 'vertical' && to === 'standing') return `cube-tumble--rise-v-${dir}`;
  return '';
}
