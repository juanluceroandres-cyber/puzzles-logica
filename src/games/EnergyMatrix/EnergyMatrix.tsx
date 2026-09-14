import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from '../../components/GameHeader';
import { Tutorial } from '../../components/Tutorial';
import type { Difficulty, GameResultData } from '../../types/common';
import { calculateScore } from '../../utils/scoring';
import { saveResult } from '../../utils/storage';
import {
  allPiecesPlaced,
  canPlace,
  checkVictory,
  getCoverage,
  getPieceCells,
  rotateCells,
} from './matrixLogic';
import { MATRIX_LEVELS } from './matrixLevels';
import type { PlacedPiece } from './types';

interface Props {
  difficulty: Difficulty;
  onFinish: (won: boolean, result: GameResultData) => void;
  onMenu: () => void;
}

export function EnergyMatrix({ difficulty, onFinish, onMenu }: Props) {
  const level = MATRIX_LEVELS[difficulty];
  const [showTutorial, setShowTutorial] = useState(true);
  const [placed, setPlaced] = useState<PlacedPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [restarts, setRestarts] = useState(0);
  const [moves, setMoves] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);

  const unplacedPieces = level.pieces.filter(
    (p) => !placed.some((pl) => pl.pieceId === p.id),
  );

  useEffect(() => {
    if (showTutorial || finished.current) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime.current), 200);
    return () => clearInterval(id);
  }, [showTutorial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setRotation((r) => (r + 1) % 4);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleRestart = useCallback(() => {
    setPlaced([]);
    setSelectedPieceId(null);
    setRotation(0);
    setHoverCell(null);
    setMoves(0);
    setStatusMsg('');
    setRestarts((r) => r + 1);
    startTime.current = Date.now();
    setElapsed(0);
    finished.current = false;
  }, []);

  const finish = useCallback(
    (won: boolean) => {
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
      saveResult('matrix', difficulty, score, won);
      onFinish(won, { score, timeMs, moves, restarts });
    },
    [difficulty, moves, onFinish, restarts],
  );

  useEffect(() => {
    if (checkVictory(level, placed) && allPiecesPlaced(level, placed)) {
      finish(true);
    }
  }, [placed, level, finish]);

  const covered = getCoverage(level, placed, level.pieces);
  const targetSet = new Set(level.targets.map(([r, c]) => `${r},${c}`));
  const coveredTargets = level.targets.filter(([r, c]) => covered.has(`${r},${c}`)).length;
  const progress = coveredTargets / level.targets.length;

  const selectedPiece = level.pieces.find((p) => p.id === selectedPieceId);

  const previewCells = new Set<string>();
  if (selectedPiece && hoverCell) {
    const cells = getPieceCells(selectedPiece, hoverCell[0], hoverCell[1], rotation);
    const valid = canPlace(level, selectedPiece, hoverCell[0], hoverCell[1], rotation, placed, level.pieces);
    for (const [r, c] of cells) {
      previewCells.add(`${r},${c}:${valid ? 'ok' : 'bad'}`);
    }
  }

  const handleCellClick = (row: number, col: number) => {
    if (finished.current) return;

    const occupying = placed.find((p) => {
      const shape = level.pieces.find((s) => s.id === p.pieceId)!;
      return getPieceCells(shape, p.row, p.col, p.rotation).some(([pr, pc]) => pr === row && pc === col);
    });

    if (occupying && !selectedPieceId) {
      setPlaced(placed.filter((p) => p !== occupying));
      setSelectedPieceId(occupying.pieceId);
      setRotation(occupying.rotation);
      setMoves((m) => m + 1);
      setStatusMsg('Pieza retirada — colócala de nuevo');
      return;
    }

    if (!selectedPieceId) {
      setStatusMsg('Primero selecciona una pieza de abajo');
      return;
    }

    const piece = level.pieces.find((p) => p.id === selectedPieceId)!;
    if (canPlace(level, piece, row, col, rotation, placed, level.pieces)) {
      setPlaced([...placed, { pieceId: selectedPieceId, row, col, rotation }]);
      setSelectedPieceId(null);
      setRotation(0);
      setHoverCell(null);
      setMoves((m) => m + 1);
      setStatusMsg('');
    } else {
      setStatusMsg('No cabe aquí — prueba otra casilla o rota la pieza');
    }
  };

  return (
    <div className="game-screen matrix-screen">
      {showTutorial && (
        <Tutorial
          title="Energy Matrix"
          steps={[
            'Las casillas con brillo ámbar ⚡ son las que debes cubrir.',
            'Selecciona una pieza del panel inferior.',
            'Pasa el cursor sobre el tablero para ver dónde encajaría.',
            'Haz clic en una casilla para colocar la pieza (esquina superior izquierda).',
            'Haz clic en una pieza colocada para retirarla y reintentar.',
            'Presiona R o el botón Rotar para girar 90°.',
          ]}
          onStart={() => {
            setShowTutorial(false);
            startTime.current = Date.now();
          }}
        />
      )}
      <GameHeader
        title="Energy Matrix"
        moves={moves}
        timeMs={elapsed}
        progress={progress}
        onRestart={handleRestart}
        onMenu={onMenu}
      />

      <div className="matrix-legend">
        <span className="matrix-legend-item">
          <span className="matrix-legend-target" /> Casilla objetivo ({coveredTargets}/{level.targets.length})
        </span>
        <span className="matrix-legend-item">
          <span className="matrix-legend-preview" /> Vista previa
        </span>
      </div>

      {statusMsg && <p className="game-hint">{statusMsg}</p>}

      {!selectedPieceId && unplacedPieces.length > 0 && (
        <p className="game-hint game-hint--action">
          👇 Selecciona una pieza y colócala sobre las casillas ⚡
        </p>
      )}

      <div
        className="matrix-board"
        style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }}
      >
        {Array.from({ length: level.size }, (_, r) =>
          Array.from({ length: level.size }, (_, c) => {
            const k = `${r},${c}`;
            const isTarget = targetSet.has(k);
            const isCovered = covered.has(k);
            let pieceColor: string | undefined;

            for (const p of placed) {
              const shape = level.pieces.find((s) => s.id === p.pieceId)!;
              if (getPieceCells(shape, p.row, p.col, p.rotation).some(([pr, pc]) => pr === r && pc === c)) {
                pieceColor = shape.color;
                break;
              }
            }

            let previewClass = '';
            for (const entry of previewCells) {
              const [pos, kind] = entry.split(':');
              if (pos === k) {
                previewClass = kind === 'ok' ? 'matrix-cell--preview-ok' : 'matrix-cell--preview-bad';
              }
            }

            return (
              <button
                key={k}
                type="button"
                className={`matrix-cell ${isTarget ? 'matrix-cell--target' : ''} ${isCovered && isTarget ? 'matrix-cell--target-covered' : ''} ${pieceColor ? 'matrix-cell--placed' : ''} ${previewClass}`}
                style={pieceColor ? { background: pieceColor } : undefined}
                onClick={() => handleCellClick(r, c)}
                onMouseEnter={() => setHoverCell([r, c])}
                onMouseLeave={() => setHoverCell(null)}
              >
                {isTarget && !pieceColor && <span className="matrix-target-icon">⚡</span>}
              </button>
            );
          }),
        )}
      </div>

      <div className="matrix-pieces">
        {unplacedPieces.map((piece) => (
          <button
            key={piece.id}
            type="button"
            className={`matrix-piece-btn ${selectedPieceId === piece.id ? 'matrix-piece-btn--selected' : ''}`}
            onClick={() => {
              setSelectedPieceId(piece.id);
              setRotation(0);
              setStatusMsg('');
            }}
          >
            <MiniPiece piece={piece} rotation={selectedPieceId === piece.id ? rotation : 0} />
          </button>
        ))}
        {selectedPiece && (
          <button
            type="button"
            className="btn-secondary matrix-rotate-btn"
            onClick={() => setRotation((r) => (r + 1) % 4)}
          >
            ↻ Rotar
          </button>
        )}
      </div>

      {selectedPiece && (
        <div className="matrix-preview matrix-preview--animated">
          Coloca aquí: <MiniPiece piece={selectedPiece} rotation={rotation} />
        </div>
      )}
    </div>
  );
}

function MiniPiece({
  piece,
  rotation,
}: {
  piece: { cells: [number, number][]; color: string };
  rotation: number;
}) {
  const cells = rotateCells(piece.cells, rotation);
  const maxR = Math.max(...cells.map(([r]) => r));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));

  return (
    <div
      className="mini-piece"
      style={{
        gridTemplateColumns: `repeat(${maxC + 1}, 14px)`,
        gridTemplateRows: `repeat(${maxR + 1}, 14px)`,
      }}
    >
      {Array.from({ length: (maxR + 1) * (maxC + 1) }, (_, i) => {
        const r = Math.floor(i / (maxC + 1));
        const c = i % (maxC + 1);
        return (
          <div
            key={i}
            className="mini-piece-cell"
            style={{
              background: cellSet.has(`${r},${c}`) ? piece.color : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}
