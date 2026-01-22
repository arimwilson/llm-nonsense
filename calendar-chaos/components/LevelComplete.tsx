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
    { text: 'Not bad for a rookie! 🌟', subtext: 'But wait until you see what\'s coming...' },
    { text: 'You\'re getting the hang of this! 💪', subtext: 'The executives are starting to trust you.' },
    { text: 'Calendar wizard in the making! 🧙‍♂️', subtext: 'Q4 planning doesn\'t scare you!' },
    { text: 'Board week? More like board WEAK! 🔥', subtext: 'You handled that pressure like a pro!' },
    { text: 'LEGENDARY STATUS ACHIEVED! 🏆', subtext: 'You are the meeting scheduling MASTER!' },
  ];

  const message = messages[level - 1] || messages[messages.length - 1];

  const scoreGrade = score >= 2000 ? 'S' : score >= 1500 ? 'A' : score >= 1000 ? 'B' : score >= 500 ? 'C' : 'D';
  const gradeColor = scoreGrade === 'S' ? 'text-yellow-500' : scoreGrade === 'A' ? 'text-green-500' : scoreGrade === 'B' ? 'text-blue-500' : 'text-gray-500';

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
          <p className="text-lg font-semibold text-gray-800 mb-2">{message.text}</p>
          <p className="text-sm text-gray-600 mb-6">{message.subtext}</p>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Final Score</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-5xl font-bold text-blue-600"
                >
                  {score}
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className={`text-6xl font-black ${gradeColor}`}
              >
                {scoreGrade}
              </motion.div>
            </div>
            {scoreGrade === 'S' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-center text-yellow-600 font-semibold"
              >
                ⭐ PERFECT SCORE! You're a scheduling superhero! ⭐
              </motion.div>
            )}
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
