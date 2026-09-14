import { DIFFICULTY_LABELS, GAMES } from '../data/games';
import type { Difficulty, GameId, GameResultData } from '../types/common';
import { formatTime } from '../utils/timer';

interface GameResultProps {
  gameId: GameId;
  difficulty: Difficulty;
  won: boolean;
  result: GameResultData;
  onRetry: () => void;
  onRetryWithBonus?: () => void;
  bonusMovesAvailable?: number;
  onMenu: () => void;
}

export function GameResult({
  gameId,
  difficulty,
  won,
  result,
  onRetry,
  onRetryWithBonus,
  bonusMovesAvailable,
  onMenu,
}: GameResultProps) {
  const game = GAMES.find((g) => g.id === gameId)!;

  return (
    <div className="screen result-screen">
      <div className={`result-card ${won ? 'result-card--win' : 'result-card--lose'}`}>
        <span className="result-icon">{won ? '🏆' : '✗'}</span>
        <h2>{won ? '¡Victoria!' : 'Intento fallido'}</h2>
        <p className="result-game">
          {game.icon} {game.name} — {DIFFICULTY_LABELS[difficulty]}
        </p>

        {won && (
          <div className="result-score">
            <span className="score-value">{result.score}</span>
            <span className="score-label">puntos</span>
          </div>
        )}

        <dl className="result-stats">
          <div>
            <dt>Tiempo</dt>
            <dd>{formatTime(result.timeMs)}</dd>
          </div>
          <div>
            <dt>Movimientos</dt>
            <dd>{result.moves}</dd>
          </div>
          {result.restarts > 0 && (
            <div>
              <dt>Reinicios</dt>
              <dd>{result.restarts}</dd>
            </div>
          )}
          {result.isOptimal !== undefined && (
            <div>
              <dt>Solución óptima</dt>
              <dd>{result.isOptimal ? 'Sí ✓' : 'No'}</dd>
            </div>
          )}
          {result.extra &&
            Object.entries(result.extra).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
        </dl>

        {!won && bonusMovesAvailable !== undefined && bonusMovesAvailable > 0 && (
          <p className="result-bonus-hint">
            Tienes +{bonusMovesAvailable} movimiento{bonusMovesAvailable > 1 ? 's' : ''} de ayuda
            disponible{bonusMovesAvailable > 1 ? 's' : ''} por fallos en esta sesión.
          </p>
        )}

        <div className="result-actions">
          <button type="button" className="btn-primary" onClick={onRetry}>
            Reintentar
          </button>
          {onRetryWithBonus && bonusMovesAvailable !== undefined && bonusMovesAvailable > 0 && (
            <button type="button" className="btn-bonus" onClick={onRetryWithBonus}>
              Reintentar con +{bonusMovesAvailable} mov.
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onMenu}>
            Menú principal
          </button>
        </div>
      </div>
    </div>
  );
}
