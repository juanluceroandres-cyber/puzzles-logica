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
  tryMove,
  tryRotate,
} from './cubeLogic';
import { CUBE_LEVELS } from './cubeLevels';
import type { CubeGameState } from './types';

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

type Dir = 'up' | 'down' | 'left' | 'right';

const TILE_CLASS: Record<string, string> = {
  empty: 'cube-cell--empty',
  wall: 'cube-cell--wall',
  hole: 'cube-cell--hole',
  goal: 'cube-cell--goal',
  breakable: 'cube-cell--breakable',
  laser: 'cube-cell--laser',
};

const DIR_LABEL: Record<Dir, string> = {
  up: '↑ arriba',
  down: '↓ abajo',
  left: '← izquierda',
  right: '→ derecha',
};

export function SmartprintCube({ difficulty, onFinish, onMenu }: Props) {
  const level = CUBE_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [state, setState] = useState<CubeGameState>(() => initCubeState(level));
  const [restarts, setRestarts] = useState(0);
  const [lastDir, setLastDir] = useState<Dir | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime.current), 200);
    return () => clearInterval(id);
  }, [showTutorial]);

  const handleRestart = useCallback(() => {
    setState(initCubeState(level));
    setRestarts((r) => r + 1);
    setLastDir(null);
    setFeedback('');
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

  const afterMove = useCallback(
    (newState: CubeGameState, fell: boolean, laser: boolean) => {
      setState(newState);
      setTimeout(() => {
        setIsAnimating(false);
        setLastDir(null);
        if (fell || laser) setFeedback('');
        if (checkVictory(level, newState)) {
          finish(true, newState.moves);
        } else if (level.maxMoves && newState.moves >= level.maxMoves) {
          finish(false, newState.moves);
        }
      }, 280);
    },
    [level, finish],
  );

  const move = useCallback(
    (dir: Dir) => {
      if (finished.current || isAnimating) return;
      const result = tryMove(level, state, dir);
      if (!result.ok) {
        setFeedback('No hay espacio en esa dirección');
        setTimeout(() => setFeedback(''), 800);
        return;
      }

      setIsAnimating(true);
      setLastDir(dir);

      if (result.fell) {
        setFeedback('¡Caíste en un hueco! Reiniciando posición…');
        setRestarts((r) => r + 1);
      } else if (result.laser) {
        setFeedback('¡Láser! Reiniciando posición…');
        setRestarts((r) => r + 1);
      } else {
        setFeedback(`Desplazamiento ${DIR_LABEL[dir]}`);
      }

      afterMove(result.state, result.fell, result.laser);
    },
    [level, state, isAnimating, afterMove],
  );

  const rotate = useCallback(() => {
    if (finished.current || isAnimating || level.blockType !== 'rectangle') return;
    const result = tryRotate(level, state);
    if (!result.ok) {
      setFeedback('No hay espacio para rotar aquí');
      setTimeout(() => setFeedback(''), 800);
      return;
    }
    setFeedback(
      `Rotado — ahora ${result.state.block.orientation === 'vertical' ? 'vertical ▮' : 'horizontal ▬'}`,
    );
    setState(result.state);
    if (checkVictory(level, result.state)) {
      finish(true, result.state.moves);
    }
  }, [level, state, isAnimating, finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotate();
        return;
      }
      const map: Record<string, Dir> = {
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
  }, [move, rotate]);

  const progress = checkVictory(level, state) ? 1 : Math.min(0.9, state.moves / (level.maxMoves ?? 30));

  const blockStyle = getBlockStyle(state.block, level.blockType, level.size);

  return (
    <div className="game-screen cube-screen">
      {showTutorial && (
        <Tutorial
          title="Smartprint Cube"
          steps={[
            'Usa flechas o WASD para deslizar el bloque en esa dirección.',
            'El bloque se mueve exactamente hacia donde pulsas, sin saltos raros.',
            level.blockType === 'rectangle'
              ? 'Presiona R o el botón ↻ para rotar el bloque (vertical ↔ horizontal).'
              : 'El bloque cuadrado mantiene siempre su forma.',
            'Evita huecos y láseres — te devuelven al inicio.',
            `Meta: zona verde con orientación ${level.goal.orientation === 'horizontal' ? 'horizontal ▬' : 'vertical ▮'}.`,
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
          Orientación:{' '}
          <strong>{state.block.orientation === 'vertical' ? 'Vertical ▮' : 'Horizontal ▬'}</strong>
          <button type="button" className="cube-rotate-btn" onClick={rotate} disabled={isAnimating}>
            ↻ Rotar (R)
          </button>
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
              const isBlockCell = getOccupiedCells(state.block, level.blockType).some(
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
          className={`cube-block cube-block--slide ${isAnimating ? 'cube-block--animating' : ''} ${lastDir ? `cube-block--dir-${lastDir}` : ''} cube-block--${state.block.orientation}`}
          style={blockStyle}
        >
          <div className="cube-block-inner">
            {level.blockType === 'rectangle' && (
              <span className="cube-block-orient">
                {state.block.orientation === 'vertical' ? '▮' : '▬'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cube-controls">
        <button type="button" className="cube-btn" onClick={() => move('up')} disabled={isAnimating}>
          ↑
        </button>
        <div className="cube-controls-row">
          <button type="button" className="cube-btn" onClick={() => move('left')} disabled={isAnimating}>
            ←
          </button>
          <button type="button" className="cube-btn" onClick={() => move('down')} disabled={isAnimating}>
            ↓
          </button>
          <button type="button" className="cube-btn" onClick={() => move('right')} disabled={isAnimating}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function getBlockStyle(
  block: { row: number; col: number; orientation: string },
  blockType: 'square' | 'rectangle',
  gridSize: number,
): React.CSSProperties {
  let cols = 1;
  let rows = 1;
  if (blockType === 'rectangle') {
    if (block.orientation === 'vertical') rows = 2;
    else cols = 2;
  }
  return {
    top: `calc(${block.row} * (100% / ${gridSize}))`,
    left: `calc(${block.col} * (100% / ${gridSize}))`,
    width: `calc(${cols} * (100% / ${gridSize}))`,
    height: `calc(${rows} * (100% / ${gridSize}))`,
  };
}
