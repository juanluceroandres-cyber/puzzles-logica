import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from '../../components/GameHeader';
import { Tutorial } from '../../components/Tutorial';
import type { Difficulty, GameResultData } from '../../types/common';
import { calculateScore } from '../../utils/scoring';
import { saveResult } from '../../utils/storage';
import {
  checkVictory,
  getActiveLineHighlight,
  getCodeColor,
  getPathIndex,
  getProgress,
  getSelectableCells,
  getSelectionHint,
  getSuggestedCodes,
  initBreachState,
  isOnSelectedPath,
  selectCell,
} from './breachLogic';
import { BREACH_LEVELS } from './breachLevels';

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

export function BreachProtocol({ difficulty, onFinish, onMenu }: Props) {
  const level = BREACH_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [state, setState] = useState(() => initBreachState(level));
  const [restarts, setRestarts] = useState(0);
  const [lastPick, setLastPick] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const [remaining, setRemaining] = useState(level.timeLimitMs);
  const finished = useRef(false);

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const left = Math.max(0, level.timeLimitMs - elapsed);
      setRemaining(left);
      if (left <= 0 && !finished.current) {
        finish(false, state.buffer.length);
      }
    }, 200);
    return () => clearInterval(id);
  }, [showTutorial, level.timeLimitMs, state.buffer.length]);

  const handleRestart = useCallback(() => {
    setState(initBreachState(level));
    setRestarts((r) => r + 1);
    setLastPick(null);
    startTime.current = Date.now();
    setRemaining(level.timeLimitMs);
    finished.current = false;
  }, [level]);

  const finish = useCallback(
    (won: boolean, moves: number) => {
      if (finished.current) return;
      finished.current = true;
      const timeMs = Date.now() - startTime.current;
      const completed = state.sequenceStatuses.filter((s) => s.completed).length;
      const score = calculateScore({
        difficulty,
        timeMs,
        moves,
        restarts,
        won,
        timeLimitMs: level.timeLimitMs,
      });
      saveResult('breach', difficulty, score, won);
      onFinish(won, {
        score,
        timeMs,
        moves,
        restarts,
        extra: {
          'Secuencias completadas': `${completed}/${level.sequences.length}`,
        },
      });
    },
    [difficulty, level, onFinish, restarts, state.sequenceStatuses],
  );

  useEffect(() => {
    if (state.failed) finish(false, state.buffer.length);
    if (checkVictory(state, level)) finish(true, state.buffer.length);
  }, [state, level, finish]);

  const selectable = getSelectableCells(state, level);
  const progress = getProgress(state, level);
  const activeLine = getActiveLineHighlight(state);
  const suggestedCodes = getSuggestedCodes(state, level);

  const handleSelect = (row: number, col: number) => {
    if (finished.current) return;
    setLastPick(`${row},${col}`);
    setTimeout(() => setLastPick(null), 400);
    setState((s) => selectCell(s, row, col, level));
  };

  return (
    <div className="game-screen breach-screen">
      {showTutorial && (
        <Tutorial
          title="Breach Protocol"
          steps={[
            'Busca un camino en la matriz alternando fila → columna → fila…',
            'Cada código elegido entra al buffer (espacio limitado).',
            'Las secuencias objetivo pueden empezar en cualquier posición del buffer.',
            'Varias secuencias pueden completarse con la misma cadena (se solapan).',
            'Tras cada elección, revisa qué secuencias avanzaron o se completaron.',
          ]}
          onStart={() => {
            setShowTutorial(false);
            startTime.current = Date.now();
          }}
        />
      )}
      <GameHeader
        title="Breach Protocol"
        moves={state.buffer.length}
        countdownMs={remaining}
        progress={progress}
        onRestart={handleRestart}
        onMenu={onMenu}
      />

      <div className="breach-panel">
        <div className="breach-sequences">
          <h4>Secuencias objetivo</h4>
          {level.sequences.map((seq) => {
            const status = state.sequenceStatuses.find((s) => s.id === seq.id)!;
            return (
              <div
                key={seq.id}
                className={`breach-seq ${status.completed ? 'breach-seq--done' : ''}`}
              >
                <div className="breach-seq-codes">
                  {seq.codes.map((code, i) => (
                    <span
                      key={i}
                      className={`breach-seq-code ${i < status.progress ? 'breach-seq-code--matched' : ''}`}
                      style={{ color: getCodeColor(code) }}
                    >
                      {code}
                      {i < seq.codes.length - 1 && <span className="breach-arrow"> → </span>}
                    </span>
                  ))}
                </div>
                <div className="breach-seq-status">
                  {status.completed ? (
                    <span className="breach-done-badge">
                      ✓ Completada{status.matchedAt !== null ? ` (desde buffer[${status.matchedAt}])` : ''}
                    </span>
                  ) : (
                    <span className="breach-progress-badge">
                      {status.progress}/{status.total} códigos
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="breach-buffer breach-buffer--enhanced">
        <span className="breach-buffer-label">BUFFER — cadena de códigos</span>
        <div className="breach-buffer-codes">
          {Array.from({ length: level.bufferSize }, (_, i) => (
            <span
              key={i}
              className={`breach-code ${state.buffer[i] ? 'breach-code--filled' : ''} ${lastPick && i === state.buffer.length - 1 ? 'breach-code--pop' : ''}`}
              style={
                state.buffer[i]
                  ? { color: getCodeColor(state.buffer[i]), borderColor: getCodeColor(state.buffer[i]) }
                  : undefined
              }
            >
              <span className="breach-code-index">{i}</span>
              {state.buffer[i] ?? '—'}
            </span>
          ))}
        </div>
      </div>

      <p className="breach-hint breach-hint--animated">{getSelectionHint(state)}</p>

      <div
        className="breach-matrix breach-matrix--enhanced"
        style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }}
      >
        {level.matrix.map((row, r) =>
          row.map((code, c) => {
            const k = `${r},${c}`;
            const canSelect = selectable.has(k);
            const isCurrent = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
            const onPath = isOnSelectedPath(state, r, c);
            const pathStep = getPathIndex(state, r, c);
            const isActiveLine =
              activeLine &&
              ((activeLine.type === 'row' && activeLine.index === r) ||
                (activeLine.type === 'col' && activeLine.index === c));
            const codeColor = getCodeColor(code);
            const isSuggested = suggestedCodes.has(code) && canSelect;

            return (
              <button
                key={k}
                type="button"
                className={[
                  'breach-cell',
                  canSelect ? 'breach-cell--selectable' : '',
                  isCurrent ? 'breach-cell--selected' : '',
                  onPath ? 'breach-cell--on-path' : '',
                  isActiveLine ? 'breach-cell--active-line' : '',
                  isSuggested ? 'breach-cell--matches-next' : '',
                  lastPick === k ? 'breach-cell--just-picked' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleSelect(r, c)}
                disabled={!canSelect}
              >
                {onPath && <span className="breach-path-step">{pathStep + 1}</span>}
                <span className="breach-cell-code" style={{ color: codeColor }}>{code}</span>
              </button>
            );
          }),
        )}
      </div>

      <div className="breach-legend">
        <span><span className="breach-legend-dot breach-legend-dot--line" /> Fila/columna activa</span>
        <span><span className="breach-legend-dot breach-legend-dot--path" /> Tu camino</span>
        <span><span className="breach-legend-dot breach-legend-dot--next" /> Código útil ahora</span>
      </div>
    </div>
  );
}
