import { DIFFICULTY_LABELS, GAMES } from '../data/games';
import type { Difficulty, GameId } from '../types/common';
import { getStats } from '../utils/storage';

interface DifficultySelectorProps {
  gameId: GameId;
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export function DifficultySelector({
  gameId,
  onSelect,
  onBack,
}: DifficultySelectorProps) {
  const game = GAMES.find((g) => g.id === gameId)!;

  return (
    <div className="screen difficulty-screen">
      <button type="button" className="btn-back" onClick={onBack}>
        ← Volver
      </button>
      <header className="difficulty-header">
        <span className="game-icon large">{game.icon}</span>
        <h2>{game.name}</h2>
        <p>Selecciona dificultad</p>
      </header>
      <div className="difficulty-buttons">
        {DIFFICULTIES.map((d) => {
          const stats = getStats(gameId, d);
          return (
            <button
              key={d}
              type="button"
              className={`btn-difficulty btn-difficulty--${d}`}
              onClick={() => onSelect(d)}
            >
              <span className="diff-label">{DIFFICULTY_LABELS[d]}</span>
              {stats.bestScore > 0 && (
                <span className="diff-best">Mejor: {stats.bestScore}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
