'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '@/lib/gameState';
import Calendar from '@/components/Calendar';
import MeetingQueue from '@/components/MeetingQueue';
import ScoreBoard from '@/components/ScoreBoard';
import LevelComplete from '@/components/LevelComplete';
import GameOver from '@/components/GameOver';
import { ToastContainer, ToastType } from '@/components/Toast';
import Confetti from '@/components/Confetti';
import { MAX_FAILED_MEETINGS } from '@/lib/constants';
import { soundEngine } from '@/lib/sounds';
import { LEVEL_FLAVOR_TEXT } from '@/data/reactions';

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
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Show confetti on level complete
  useEffect(() => {
    if (isLevelComplete) {
      setShowConfetti(true);
      soundEngine.playLevelComplete();
      const flavor = LEVEL_FLAVOR_TEXT[currentLevel - 1];
      if (flavor) {
        addToast(flavor.complete, 'achievement');
      }
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [isLevelComplete, currentLevel, addToast]);

  // Toast on game over
  useEffect(() => {
    if (isGameOver) {
      soundEngine.playError();
      addToast('Too many failed meetings! 😰', 'error');
    }
  }, [isGameOver, addToast]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 text-6xl"
          >
            📅
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-20 text-6xl"
          >
            📊
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/2 right-10 text-6xl"
          >
            ☕
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 relative z-10"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-5xl font-bold text-gray-900 mb-3"
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 1 }}
                className="inline-block"
              >
                📅
              </motion.span>
              {' '}Calendar Chaos
            </motion.h1>
            <p className="text-xl text-gray-600 font-medium">
              SimCity meets Tetris meets corporate hell
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Can you survive the meeting madness?
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleStartGame(1);
                soundEngine.playSuccess();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all text-lg shadow-lg hover:shadow-xl"
            >
              🎮 Start Game
            </motion.button>

            <p className="text-center text-xs text-gray-500">Or jump to a level:</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { num: 1, emoji: '🌟', name: 'Honeymoon' },
                { num: 2, emoji: '😅', name: 'Reality' },
                { num: 3, emoji: '😰', name: 'Q4 Chaos' },
                { num: 4, emoji: '🔥', name: 'Board Week' },
                { num: 5, emoji: '💀', name: 'Gauntlet' },
              ].map((level) => (
                <motion.button
                  key={level.num}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStartGame(level.num)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-2 rounded transition-all text-xs group relative"
                  title={level.name}
                >
                  <div>{level.emoji}</div>
                  <div className="text-[10px]">L{level.num}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium mb-2">Pro Tips:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 Include optional attendees for bonus points</p>
              <p>⚡ Schedule early to avoid deadline penalties</p>
              <p>🎯 Preserve 2+ hour blocks for focus time bonuses</p>
            </div>
          </div>
        </motion.div>
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
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confetti on level complete */}
      {showConfetti && <Confetti />}

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

      {/* Control buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            addToast(soundEnabled ? 'Sound OFF' : 'Sound ON', 'info');
          }}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
          title="Toggle Sound"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          onClick={handleMainMenu}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
