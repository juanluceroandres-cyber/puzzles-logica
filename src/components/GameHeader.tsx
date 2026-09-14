import { formatTime } from '../utils/timer';

interface GameHeaderProps {
  title: string;
  moves?: number;
  maxMoves?: number;
  timeMs?: number;
  countdownMs?: number;
  progress?: number;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameHeader({
  title,
  moves,
  maxMoves,
  timeMs,
  countdownMs,
  progress,
  onRestart,
  onMenu,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="game-header-top">
        <button type="button" className="btn-icon" onClick={onMenu} title="Menú">
          ☰
        </button>
        <h2 className="game-header-title">{title}</h2>
        <button type="button" className="btn-icon" onClick={onRestart} title="Reiniciar">
          ↺
        </button>
      </div>
      <div className="game-header-stats">
        {moves !== undefined && (
          <span className="stat">
            Movimientos: {moves}
            {maxMoves !== undefined && ` / ${maxMoves}`}
          </span>
        )}
        {timeMs !== undefined && (
          <span className="stat">Tiempo: {formatTime(timeMs)}</span>
        )}
        {countdownMs !== undefined && (
          <span className={`stat ${countdownMs < 30000 ? 'stat--urgent' : ''}`}>
            ⏱ {formatTime(countdownMs)}
          </span>
        )}
        {progress !== undefined && (
          <span className="stat">Progreso: {Math.round(progress * 100)}%</span>
        )}
      </div>
    </header>
  );
}
