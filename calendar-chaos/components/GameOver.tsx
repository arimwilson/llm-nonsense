'use client';

import { motion } from 'framer-motion';

interface GameOverProps {
  level: number;
  score: number;
  reason: string;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOver({
  level,
  score,
  reason,
  onRestart,
  onMainMenu,
}: GameOverProps) {
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
            😰
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendar Chaos!</h2>
          <p className="text-lg text-gray-600 mb-2">You couldn&apos;t handle the pressure</p>
          <p className="text-sm text-red-600 font-medium mb-6">{reason}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div>
              <div className="text-sm text-gray-600">Level Reached</div>
              <div className="text-3xl font-bold text-gray-900">Level {level}</div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600">Final Score</div>
              <div className="text-3xl font-bold text-blue-600">{score}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onMainMenu}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Main Menu
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Tip: Focus on high priority meetings first and watch those deadlines!
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
