'use client';

import { Meeting, Principal } from '@/lib/types';
import MeetingCard from './MeetingCard';
import useGameStore from '@/lib/gameState';

interface MeetingQueueProps {
  meetings: Meeting[];
  principals: Principal[];
}

export default function MeetingQueue({ meetings, principals }: MeetingQueueProps) {
  const { setDraggedMeeting, draggedMeeting } = useGameStore();

  const handleDragStart = (meeting: Meeting) => {
    setDraggedMeeting(meeting);
  };

  const handleDragEnd = () => {
    // Keep the dragged meeting reference until it's dropped
    // We'll clear it in the drop handler
  };

  const highPriority = meetings.filter((m) => m.priority === 'high');
  const mediumPriority = meetings.filter((m) => m.priority === 'medium');
  const lowPriority = meetings.filter((m) => m.priority === 'low');

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Meeting Queue</h2>
        <p className="text-sm text-gray-600">{meetings.length} meetings to schedule</p>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">🎉</p>
          <p className="text-sm">All meetings scheduled!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {highPriority.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-2">
                <span>🔴</span>
                High Priority ({highPriority.length})
              </h3>
              <div className="space-y-2">
                {highPriority.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    principals={principals}
                    onDragStart={() => handleDragStart(meeting)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedMeeting?.id === meeting.id}
                  />
                ))}
              </div>
            </div>
          )}

          {mediumPriority.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-yellow-700 uppercase mb-2 flex items-center gap-2">
                <span>🟡</span>
                Medium Priority ({mediumPriority.length})
              </h3>
              <div className="space-y-2">
                {mediumPriority.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    principals={principals}
                    onDragStart={() => handleDragStart(meeting)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedMeeting?.id === meeting.id}
                  />
                ))}
              </div>
            </div>
          )}

          {lowPriority.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-2">
                <span>🟢</span>
                Low Priority ({lowPriority.length})
              </h3>
              <div className="space-y-2">
                {lowPriority.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    principals={principals}
                    onDragStart={() => handleDragStart(meeting)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedMeeting?.id === meeting.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-300">
        <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Instructions</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag meetings to calendar slots</li>
          <li>• All required attendees must be free</li>
          <li>• Watch for deadlines and constraints</li>
          <li>• Include optional attendees for bonus points</li>
        </ul>
      </div>
    </div>
  );
}
