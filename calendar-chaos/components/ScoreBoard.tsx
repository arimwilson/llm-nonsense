'use client';

import { Level } from '@/lib/types';
import { MAX_FAILED_MEETINGS } from '@/lib/constants';

interface ScoreBoardProps {
  score: number;
  level: Level;
  failedMeetings: number;
  currentDay: number;
}

export default function ScoreBoard({
  score,
  level,
  failedMeetings,
  currentDay,
}: ScoreBoardProps) {
  const scorePercentage = Math.min((score / level.scoreThreshold) * 100, 100);
  const isScoreThresholdMet = score >= level.scoreThreshold;

  const getMotivationalMessage = () => {
    if (failedMeetings >= 2) return '⚠️ Careful! One more failure = game over!';
    if (scorePercentage >= 100) return '🎉 You\'re crushing it!';
    if (scorePercentage >= 75) return '🔥 Almost there!';
    if (scorePercentage >= 50) return '💪 Halfway to victory!';
    if (scorePercentage >= 25) return '👍 Good start!';
    return '📅 Let\'s schedule some meetings!';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar Chaos</h1>
            <p className="text-sm text-gray-600">
              Level {level.number}: {level.name}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">Current Day</div>
            <div className="text-xl font-bold text-gray-900">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay] || 'Week Complete'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Score Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Score</span>
              <span className="text-sm text-gray-600">
                {score} / {level.scoreThreshold}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  isScoreThresholdMet ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            {isScoreThresholdMet && (
              <div className="text-xs text-green-600 font-medium mt-1">
                ✓ Threshold met!
              </div>
            )}
          </div>

          {/* Failed Meetings */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Failed High Priority</span>
              <span className="text-sm text-gray-600">
                {failedMeetings} / {MAX_FAILED_MEETINGS}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_FAILED_MEETINGS }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2.5 rounded ${
                    i < failedMeetings ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {failedMeetings >= MAX_FAILED_MEETINGS && (
              <div className="text-xs text-red-600 font-medium mt-1">
                ⚠️ Game Over!
              </div>
            )}
          </div>

          {/* Motivational Status */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border-2 border-blue-100">
            <div className="text-sm font-bold text-gray-900 mb-2 text-center">
              {getMotivationalMessage()}
            </div>
            <div className="text-xs text-gray-600 text-center space-y-0.5">
              <div className="font-medium">{level.principals.length} Execs • {level.meetingsToSchedule} Meetings</div>
              <div className="text-gray-500 italic">&quot;{level.description}&quot;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
