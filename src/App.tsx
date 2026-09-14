import { useState } from 'react';
import { DifficultySelector } from './components/DifficultySelector';
import { GameResult } from './components/GameResult';
import { MainMenu } from './components/MainMenu';
import { BreachProtocol } from './games/BreachProtocol/BreachProtocol';
import { EnergyMatrix } from './games/EnergyMatrix/EnergyMatrix';
import { OverflowingPalette } from './games/OverflowingPalette/OverflowingPalette';
import { SignalHub } from './games/SignalHub/SignalHub';
import { SmartprintCube } from './games/SmartprintCube/SmartprintCube';
import type { Difficulty, GameId, GameResultData } from './types/common';

type Screen = 'menu' | 'difficulty' | 'playing' | 'result';

const MAX_PALETTE_BONUS_MOVES = 4;

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [lastResult, setLastResult] = useState<{ won: boolean; data: GameResultData } | null>(
    null,
  );
  const [paletteSessionFailures, setPaletteSessionFailures] = useState(0);
  const [paletteBonusMoves, setPaletteBonusMoves] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  const handleSelectGame = (id: GameId) => {
    setGameId(id);
    setScreen('difficulty');
  };

  const handleSelectDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setPaletteBonusMoves(0);
    setScreen('playing');
    setLastResult(null);
    setPlayKey((k) => k + 1);
  };

  const handleFinish = (won: boolean, data: GameResultData) => {
    if (gameId === 'palette') {
      if (!won) {
        setPaletteSessionFailures((f) => f + 1);
      } else {
        setPaletteSessionFailures(0);
      }
    }
    setLastResult({ won, data });
    setScreen('result');
  };

  const handleRetry = (useBonus = false) => {
    if (gameId === 'palette') {
      const available = Math.min(MAX_PALETTE_BONUS_MOVES, paletteSessionFailures);
      setPaletteBonusMoves(useBonus ? available : 0);
    }
    setScreen('playing');
    setLastResult(null);
    setPlayKey((k) => k + 1);
  };

  const handleMenu = () => {
    setScreen('menu');
    setGameId(null);
    setLastResult(null);
    setPaletteSessionFailures(0);
    setPaletteBonusMoves(0);
  };

  const handleBackFromDifficulty = () => {
    setScreen('menu');
    setGameId(null);
  };

  const renderGame = () => {
    if (!gameId) return null;
    const props = {
      difficulty,
      onFinish: handleFinish,
      onMenu: handleMenu,
      key: `${gameId}-${difficulty}-${playKey}`,
    };

    switch (gameId) {
      case 'palette':
        return <OverflowingPalette {...props} bonusMoves={paletteBonusMoves} />;
      case 'signal':
        return <SignalHub {...props} />;
      case 'cube':
        return <SmartprintCube {...props} />;
      case 'breach':
        return <BreachProtocol {...props} />;
      case 'matrix':
        return <EnergyMatrix {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {screen === 'menu' && <MainMenu onSelectGame={handleSelectGame} />}
      {screen === 'difficulty' && gameId && (
        <DifficultySelector
          gameId={gameId}
          onSelect={handleSelectDifficulty}
          onBack={handleBackFromDifficulty}
        />
      )}
      {screen === 'playing' && renderGame()}
      {screen === 'result' && gameId && lastResult && (
        <GameResult
          gameId={gameId}
          difficulty={difficulty}
          won={lastResult.won}
          result={lastResult.data}
          onRetry={() => handleRetry(false)}
          onRetryWithBonus={
            gameId === 'palette' && !lastResult.won && paletteSessionFailures > 0
              ? () => handleRetry(true)
              : undefined
          }
          bonusMovesAvailable={
            gameId === 'palette' && !lastResult.won
              ? Math.min(MAX_PALETTE_BONUS_MOVES, paletteSessionFailures)
              : undefined
          }
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
