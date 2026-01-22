'use client';

import { Meeting, Principal } from '@/lib/types';
import { PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_BG } from '@/lib/constants';
import { motion } from 'framer-motion';

interface MeetingCardProps {
  meeting: Meeting;
  principals: Principal[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export default function MeetingCard({
  meeting,
  principals,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: MeetingCardProps) {
  const priorityColor = PRIORITY_COLORS[meeting.priority];
  const priorityBg = PRIORITY_BG[meeting.priority];
  const priorityIcon = PRIORITY_ICONS[meeting.priority];

  const getAttendeeNames = (attendeeIds: string[]) => {
    return attendeeIds
      .map((id) => {
        const principal = principals.find((p) => p.id === id);
        return principal?.name.split(' ')[0] || id;
      })
      .join(', ');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        p-3 rounded-lg border-2 ${priorityColor} ${priorityBg}
        cursor-grab active:cursor-grabbing
        transition-all shadow-sm hover:shadow-md
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm flex-1 text-gray-900">{meeting.title}</h3>
        <span className="text-xs ml-2">{priorityIcon}</span>
      </div>

      <div className="space-y-1 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-medium">Duration:</span>
          <span>{formatDuration(meeting.duration)}</span>
        </div>

        <div className="flex items-start gap-2">
          <span className="font-medium">Required:</span>
          <span className="flex-1">{getAttendeeNames(meeting.requiredAttendees)}</span>
        </div>

        {meeting.optionalAttendees.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-500">Optional:</span>
            <span className="flex-1 text-gray-500">
              {getAttendeeNames(meeting.optionalAttendees)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
          <span className="font-medium">Deadline:</span>
          <span className="font-semibold">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][meeting.deadline]}
          </span>
        </div>

        {meeting.needsPrep && (
          <div className="text-xs text-orange-700 font-medium">⚠️ Needs 30min prep</div>
        )}

        {meeting.isInPerson && (
          <div className="text-xs text-blue-700 font-medium">🏢 In-person (needs room)</div>
        )}
      </div>
    </motion.div>
  );
}
