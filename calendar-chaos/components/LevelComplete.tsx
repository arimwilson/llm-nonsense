'use client';

import { motion } from 'framer-motion';

interface LevelCompleteProps {
  level: number;
  score: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

export default function LevelComplete({
  level,
  score,
  onNextLevel,
  onRestart,
}: LevelCompleteProps) {
  const messages = [
    'Excellent work! Ready for more?',
    'You handled that like a pro!',
    'Smooth scheduling! Next challenge awaits.',
    'Calendar mastery achieved!',
    'You survived the chaos!',
  ];

  const message = messages[level - 1] || messages[messages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Level Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">{message}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">Final Score</div>
            <div className="text-4xl font-bold text-blue-600">{score}</div>
          </div>

          <div className="space-y-3">
            {level < 5 ? (
              <>
                <button
                  onClick={onNextLevel}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Next Level →
                </button>
                <button
                  onClick={onRestart}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Restart Level
                </button>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600 mb-4">
                  🏆 You&apos;ve Mastered Calendar Chaos! 🏆
                </div>
                <button
                  onClick={onRestart}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
