import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from '../../components/GameHeader';
import { Tutorial } from '../../components/Tutorial';
import type { Difficulty, GameResultData } from '../../types/common';
import { calculateScore } from '../../utils/scoring';
import { saveResult } from '../../utils/storage';
import {
  buildGrid,
  checkVictory,
  countMoves,
  getConnectionProgress,
  getEndpointPairs,
  isColorConnected,
  isPairConnected,
  isValidPathExtension,
  pathsToGrid,
  SIGNAL_COLORS,
} from './pathLogic';
import {
  COLOR_LABELS,
  findHintPath,
  getNextHintColor,
  HARD_HINT_LABELS,
} from './signalHints';
import { SIGNAL_LEVELS } from './signalLevels';
import type { SignalColor } from './types';

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

export function SignalHub({ difficulty, onFinish, onMenu }: Props) {
  const level = SIGNAL_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [paths, setPaths] = useState<Map<SignalColor, [number, number][]>>(new Map());
  const [drawing, setDrawing] = useState<{
    color: SignalColor;
    path: [number, number][];
  } | null>(null);
  const [restarts, setRestarts] = useState(0);
  const [hintColor, setHintColor] = useState<SignalColor | null>(null);
  const [hintPath, setHintPath] = useState<[number, number][] | null>(null);
  const [hintLabel, setHintLabel] = useState<string | null>(null);
  const [pathError, setPathError] = useState('');
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);

  const baseGrid = buildGrid(level);

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime.current), 200);
    return () => clearInterval(id);
  }, [showTutorial]);

  const handleRestart = useCallback(() => {
    setPaths(new Map());
    setDrawing(null);
    setHintColor(null);
    setHintPath(null);
    setHintLabel(null);
    setPathError('');
    setRestarts((r) => r + 1);
    startTime.current = Date.now();
    setElapsed(0);
    finished.current = false;
  }, []);

  const finish = useCallback(
    (won: boolean, moves: number) => {
      if (finished.current) return;
      finished.current = true;
      const timeMs = Date.now() - startTime.current;
      const score = calculateScore({
        difficulty,
        timeMs,
        moves,
        restarts,
        won,
      });
      saveResult('signal', difficulty, score, won);
      onFinish(won, { score, timeMs, moves, restarts });
    },
    [difficulty, onFinish, restarts],
  );

  useEffect(() => {
    if (checkVictory(level, paths)) {
      finish(true, countMoves(paths));
    }
  }, [paths, level, finish]);

  const getCellFromEvent = (
    e: React.MouseEvent | React.TouchEvent,
    gridEl: HTMLElement,
  ): [number, number] | null => {
    const rect = gridEl.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const col = Math.floor(((clientX - rect.left) / rect.width) * level.size);
    const row = Math.floor(((clientY - rect.top) / rect.height) * level.size);
    if (row < 0 || row >= level.size || col < 0 || col >= level.size) return null;
    return [row, col];
  };

  const startDraw = (row: number, col: number) => {
    const cell = baseGrid[row][col];
    if (cell.type === 'obstacle') return;
    setPathError('');

    if (cell.type === 'endpoint') {
      const color = cell.color;
      const newPaths = new Map(paths);
      newPaths.delete(color);
      setPaths(newPaths);
      setDrawing({ color, path: [[row, col]] });
    }
  };

  const extendDraw = (row: number, col: number) => {
    if (!drawing) return;
    const next: [number, number] = [row, col];
    if (isValidPathExtension(drawing.path, next, level.size, baseGrid, drawing.color, paths)) {
      setDrawing({ ...drawing, path: [...drawing.path, next] });
    }
  };

  const endDraw = () => {
    if (!drawing) return;
    const pairs = getEndpointPairs(level);
    const pair = pairs.get(drawing.color);

    if (pair && isPairConnected(drawing.path, pair[0], pair[1])) {
      const newPaths = new Map(paths);
      newPaths.set(drawing.color, drawing.path);
      setPaths(newPaths);
      setPathError('');
      if (hintColor === drawing.color) {
        setHintColor(null);
        setHintPath(null);
        setHintLabel(null);
      }
    } else if (drawing.path.length >= 2) {
      setPathError('El camino debe llegar al otro nodo del mismo color');
    }
    setDrawing(null);
  };

  const showHint = () => {
    const connected = new Set<SignalColor>();
    for (const color of getEndpointPairs(level).keys()) {
      if (isColorConnected(level, paths, color)) connected.add(color);
    }
    const next = getNextHintColor(connected);
    if (!next) {
      setHintColor(null);
      setHintPath(null);
      setHintLabel('¡Ya conectaste todos los pares!');
      return;
    }

    const path = findHintPath(level, paths, next);
    setHintColor(next);
    setHintPath(path);
    setHintLabel(
      path
        ? `${COLOR_LABELS[next]}: ${HARD_HINT_LABELS[next] ?? 'Sigue la ruta resaltada en el tablero.'}`
        : `${COLOR_LABELS[next]}: un camino anterior bloquea la solución — borra el último color conectado y sigue las pistas en orden (Rojo → Azul → Amarillo → Morado → Verde).`,
    );
  };

  const hintPathSet = new Set(hintPath?.map(([r, c]) => `${r},${c}`) ?? []);

  const displayPaths = new Map(paths);
  if (drawing) displayPaths.set(drawing.color, drawing.path);
  const grid = pathsToGrid(baseGrid, displayPaths);

  const progress = getConnectionProgress(level, paths);
  const allConnected = checkVictory(level, paths);

  return (
    <div className="game-screen">
      {showTutorial && (
        <Tutorial
          title="Conectar colores"
          steps={[
            'Cada color tiene dos nodos que debes conectar.',
            'Arrastra desde un nodo hasta el otro del mismo color.',
            'El camino debe llegar completamente al segundo nodo para contar.',
            'Los caminos no pueden cruzarse ni compartir casillas.',
          ]}
          onStart={() => {
            setShowTutorial(false);
            startTime.current = Date.now();
          }}
        />
      )}
      <GameHeader
        title="Conectar colores"
        moves={countMoves(displayPaths)}
        timeMs={elapsed}
        progress={progress}
        onRestart={handleRestart}
        onMenu={onMenu}
      />

      {difficulty === 'hard' && (
        <button type="button" className="btn-secondary signal-hint-btn" onClick={showHint}>
          💡 Mostrar pista
        </button>
      )}

      {hintLabel && (
        <p className="game-hint game-hint--action signal-hint-label">{hintLabel}</p>
      )}

      {pathError && (
        <p className="game-hint game-hint--warn">{pathError}</p>
      )}

      <div
        className="signal-grid"
        style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }}
        onMouseLeave={endDraw}
        onMouseUp={endDraw}
        onTouchEnd={endDraw}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            let bg = 'var(--cell-empty)';
            let content: React.ReactNode = null;

            if (cell.type === 'obstacle') {
              bg = 'var(--cell-obstacle)';
            } else if (cell.type === 'path') {
              bg = SIGNAL_COLORS[cell.color];
            } else if (cell.type === 'endpoint') {
              bg = SIGNAL_COLORS[cell.color];
              content = <span className="signal-node" />;
            }

            const isPath = cell.type === 'path';
            const isHintCell = hintColor !== null && hintPathSet.has(`${r},${c}`);
            const isHintEndpoint =
              hintColor !== null &&
              cell.type === 'endpoint' &&
              cell.color === hintColor;
            const pair = drawing ? getEndpointPairs(level).get(drawing.color) : null;
            const isTargetEndpoint =
              pair &&
              drawing &&
              ((r === pair[1].row && c === pair[1].col) ||
                (r === pair[0].row && c === pair[0].col));

            const hintStyle =
              isHintCell && hintColor
                ? ({
                    '--hint-color': SIGNAL_COLORS[hintColor],
                  } as React.CSSProperties)
                : undefined;

            return (
              <div
                key={`${r}-${c}`}
                className={`signal-cell ${isPath ? 'signal-cell--path' : ''} ${isTargetEndpoint ? 'signal-cell--target-ep' : ''} ${isHintCell ? 'signal-cell--hint' : ''} ${isHintEndpoint ? 'signal-cell--hint-endpoint' : ''}`}
                style={{ background: bg, ...hintStyle }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startDraw(r, c);
                }}
                onMouseEnter={() => extendDraw(r, c)}
                onTouchStart={(e) => {
                  const gridEl = e.currentTarget.parentElement!;
                  const pos = getCellFromEvent(e, gridEl);
                  if (pos) startDraw(pos[0], pos[1]);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const gridEl = e.currentTarget.parentElement!;
                  const pos = getCellFromEvent(e, gridEl);
                  if (pos) extendDraw(pos[0], pos[1]);
                }}
              >
                {content}
              </div>
            );
          }),
        )}
      </div>

      {allConnected && !finished.current && (
        <p className="game-hint game-hint--success signal-win-hint">
          ¡Todos los pares conectados!
        </p>
      )}
    </div>
  );
}
