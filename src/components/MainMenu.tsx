import { GAMES } from '../data/games';
import type { GameId } from '../types/common';

interface MainMenuProps {
  onSelectGame: (gameId: GameId) => void;
}

export function MainMenu({ onSelectGame }: MainMenuProps) {
  return (
    <div className="screen menu-screen">
      <header className="menu-header">
        <h1 className="menu-title">LOGIC LAB</h1>
        <p className="menu-subtitle">Elige un desafío</p>
      </header>
      <nav className="game-list">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            className="game-card"
            onClick={() => onSelectGame(game.id)}
          >
            <span className="game-icon">{game.icon}</span>
            <span className="game-name">{game.name}</span>
            <span className="game-desc">{game.description}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
