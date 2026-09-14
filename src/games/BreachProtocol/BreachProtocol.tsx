import { useCallback, useEffect, useRef, useState } from 'react';
import { BreachPathOverlay } from '../../components/BreachPathOverlay';
import { BreachSequenceFlow } from '../../components/BreachSequenceFlow';
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
    setTimeout(() => setLastPick(null), 500);
    setState((s) => selectCell(s, row, col, level));
  };

  return (
    <div className="game-screen breach-screen">
      {showTutorial && (
        <Tutorial
          title="Breach Protocol"
          steps={[
            'Alterna fila → columna → fila al elegir códigos en la matriz.',
            'Cada elección llena el buffer de abajo.',
            'Las secuencias pueden empezar en cualquier posición del buffer.',
            'Una misma cadena puede completar varias secuencias a la vez.',
            'Observa cómo se iluminan y conectan los códigos objetivo.',
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

      <div className="breach-panel breach-panel--animated">
        <h4 className="breach-panel-title">Secuencias objetivo</h4>
        {level.sequences.map((seq, idx) => {
          const status = state.sequenceStatuses.find((s) => s.id === seq.id)!;
          return (
            <BreachSequenceFlow
              key={seq.id}
              codes={seq.codes}
              status={status}
              seqIndex={idx}
            />
          );
        })}
      </div>

      <div className="breach-buffer breach-buffer--enhanced">
        <span className="breach-buffer-label">BUFFER</span>
        <div className="breach-buffer-flow">
          {Array.from({ length: level.bufferSize }, (_, i) => (
            <div key={i} className="breach-buffer-slot-wrap">
              {i > 0 && (
                <span className={`breach-buffer-arrow ${state.buffer[i] ? 'breach-buffer-arrow--active' : ''}`}>
                  →
                </span>
              )}
              <span
                className={[
                  'breach-code',
                  state.buffer[i] ? 'breach-code--filled' : '',
                  lastPick && i === state.buffer.length - 1 ? 'breach-code--pop' : '',
                  state.buffer[i] && suggestedCodes.has(state.buffer[i]) ? 'breach-code--useful' : '',
                ].filter(Boolean).join(' ')}
                style={
                  state.buffer[i]
                    ? { color: getCodeColor(state.buffer[i]), borderColor: getCodeColor(state.buffer[i]) }
                    : undefined
                }
              >
                <span className="breach-code-index">{i}</span>
                {state.buffer[i] ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="breach-hint breach-hint--animated">{getSelectionHint(state)}</p>

      <div className="breach-matrix-wrap">
        <BreachPathOverlay cells={state.selectedCells} gridSize={level.size} />
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
      </div>

      <div className="breach-legend">
        <span><span className="breach-legend-dot breach-legend-dot--line" /> Fila/columna activa</span>
        <span><span className="breach-legend-dot breach-legend-dot--path" /> Tu camino animado</span>
        <span><span className="breach-legend-dot breach-legend-dot--next" /> Código útil ahora</span>
      </div>
    </div>
  );
}
