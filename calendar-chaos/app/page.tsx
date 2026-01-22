'use client';

import { useEffect, useState } from 'react';
import useGameStore from '@/lib/gameState';
import Calendar from '@/components/Calendar';
import MeetingQueue from '@/components/MeetingQueue';
import ScoreBoard from '@/components/ScoreBoard';
import LevelComplete from '@/components/LevelComplete';
import GameOver from '@/components/GameOver';
import { MAX_FAILED_MEETINGS } from '@/lib/constants';

export default function Home() {
  const {
    level,
    score,
    calendar,
    queuedMeetings,
    scheduledMeetings,
    failedMeetings,
    currentDay,
    currentLevel,
    isGameOver,
    isLevelComplete,
    startLevel,
    resetGame,
  } = useGameStore();

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Load saved progress from localStorage
    const savedLevel = localStorage.getItem('currentLevel');
    if (savedLevel) {
      const levelNum = parseInt(savedLevel, 10);
      if (levelNum > 0 && levelNum <= 5) {
        // Auto-start is disabled for now
        // startLevel(levelNum);
        // setGameStarted(true);
      }
    }
  }, []);

  const handleStartGame = (levelNum: number = 1) => {
    startLevel(levelNum);
    setGameStarted(true);
    localStorage.setItem('currentLevel', levelNum.toString());
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= 5) {
      startLevel(nextLevel);
      localStorage.setItem('currentLevel', nextLevel.toString());
    }
  };

  const handleRestartLevel = () => {
    startLevel(currentLevel);
  };

  const handleMainMenu = () => {
    resetGame();
    setGameStarted(false);
    localStorage.removeItem('currentLevel');
  };

  // Game over condition check
  const gameOverReason = failedMeetings >= MAX_FAILED_MEETINGS
    ? `Too many high priority meetings failed (${failedMeetings}/${MAX_FAILED_MEETINGS})`
    : '';

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">📅 Calendar Chaos</h1>
            <p className="text-xl text-gray-600">
              A SimCity-style Meeting Scheduling Game
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Play</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Drag meetings from the queue to the calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Ensure all required attendees are available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Meet the score threshold by scheduling efficiently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Don&apos;t let 3 high priority meetings fail!</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStartGame(1)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Start Game
            </button>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((levelNum) => (
                <button
                  key={levelNum}
                  onClick={() => handleStartGame(levelNum)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded transition-colors text-sm"
                >
                  Level {levelNum}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Think SimCity meets Tetris meets corporate hell</p>
          </div>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <div className="text-xl text-gray-600">Loading level...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ScoreBoard
        score={score}
        level={level}
        failedMeetings={failedMeetings}
        currentDay={currentDay}
      />

      <div className="flex-1 flex overflow-hidden">
        <Calendar calendar={calendar} principals={level.principals} />
        <MeetingQueue meetings={queuedMeetings} principals={level.principals} />
      </div>

      {/* Level Complete Modal */}
      {isLevelComplete && (
        <LevelComplete
          level={currentLevel}
          score={score}
          onNextLevel={handleNextLevel}
          onRestart={handleRestartLevel}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && gameOverReason && (
        <GameOver
          level={currentLevel}
          score={score}
          reason={gameOverReason}
          onRestart={handleRestartLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Help/Instructions button */}
      <button
        onClick={handleMainMenu}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
      >
        Main Menu
      </button>
    </div>
  );
}
