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

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [lastResult, setLastResult] = useState<{ won: boolean; data: GameResultData } | null>(
    null,
  );

  const handleSelectGame = (id: GameId) => {
    setGameId(id);
    setScreen('difficulty');
  };

  const handleSelectDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setScreen('playing');
    setLastResult(null);
  };

  const handleFinish = (won: boolean, data: GameResultData) => {
    setLastResult({ won, data });
    setScreen('result');
  };

  const handleRetry = () => {
    setScreen('playing');
    setLastResult(null);
  };

  const handleMenu = () => {
    setScreen('menu');
    setGameId(null);
    setLastResult(null);
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
      key: `${gameId}-${difficulty}-${screen}`,
    };

    switch (gameId) {
      case 'palette':
        return <OverflowingPalette {...props} />;
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
          onRetry={handleRetry}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
