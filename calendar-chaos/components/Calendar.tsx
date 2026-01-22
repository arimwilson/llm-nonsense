'use client';

import { Principal, CalendarSlot, TimeSlot, Meeting } from '@/lib/types';
import { START_HOUR, END_HOUR, SLOT_DURATION, DAYS } from '@/lib/constants';
import useGameStore from '@/lib/gameState';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/sounds';

interface CalendarProps {
  calendar: CalendarSlot[][][];
  principals: Principal[];
}

export default function Calendar({ calendar, principals }: CalendarProps) {
  const { draggedMeeting, scheduleMeeting, canScheduleMeeting, setDraggedMeeting } = useGameStore();
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<{
    message: string;
    valid: boolean;
    slot: string;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent, day: number, hour: number, minute: number) => {
    e.preventDefault();

    if (!draggedMeeting) return;

    const timeSlot: TimeSlot = { day, hour, minute };
    const slotKey = `${day}-${hour}-${minute}`;
    setHoveredSlot(slotKey);

    // Check if we can schedule with all required attendees
    const validation = canScheduleMeeting(
      draggedMeeting,
      timeSlot,
      draggedMeeting.requiredAttendees
    );

    setValidationMessage({
      message: validation.reason || 'Valid slot',
      valid: validation.valid,
      slot: slotKey,
    });
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
    setValidationMessage(null);
  };

  const handleDrop = (e: React.DragEvent, day: number, hour: number, minute: number) => {
    e.preventDefault();
    setHoveredSlot(null);
    setValidationMessage(null);

    if (!draggedMeeting) return;

    const timeSlot: TimeSlot = { day, hour, minute };

    // Try to schedule with required attendees first
    const success = scheduleMeeting(
      draggedMeeting,
      timeSlot,
      draggedMeeting.requiredAttendees
    );

    if (success) {
      soundEngine.playMeetingScheduled();
      setDraggedMeeting(null);
    } else {
      soundEngine.playError();
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const renderTimeSlot = (day: number, slotIndex: number) => {
    const hour = START_HOUR + Math.floor((slotIndex * SLOT_DURATION) / 60);
    const minute = (slotIndex * SLOT_DURATION) % 60;
    const slotKey = `${day}-${hour}-${minute}`;
    const isHovered = hoveredSlot === slotKey;

    const daySlots = calendar[day]?.[slotIndex];
    if (!daySlots) return null;

    // Check if any principal has a meeting in this slot
    const meetings = daySlots
      .map((slot) => slot.meeting)
      .filter((m) => m !== undefined);

    const uniqueMeetings = meetings.filter(
      (m, index, self) => m && self.findIndex((m2) => m2?.id === m.id) === index
    );

    return (
      <div
        key={slotKey}
        className="relative border-t border-gray-200 h-12"
        onDragOver={(e) => handleDragOver(e, day, hour, minute)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day, hour, minute)}
      >
        <div className="absolute inset-0 grid grid-cols-6 gap-px bg-gray-100">
          {daySlots.map((slot, pIndex) => {
            const principal = principals[pIndex];
            if (!principal) return null;

            const isBlocked = slot.isBlocked || slot.meeting;
            const meeting = slot.meeting;

            // Only show meeting card on first slot and first principal
            const shouldShowMeeting =
              meeting &&
              uniqueMeetings[0]?.id === meeting.id &&
              principal.id === meeting.attendees[0];

            return (
              <div
                key={`${slotKey}-${principal.id}`}
                className={`
                  relative bg-white
                  ${isHovered && !isBlocked ? 'bg-blue-50' : ''}
                  ${isBlocked ? principal.color.split(' ')[0] + ' opacity-60' : ''}
                `}
              >
                {shouldShowMeeting && meeting && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`
                      absolute inset-0 m-0.5 p-1 rounded text-xs
                      ${principal.color}
                      border-l-4 border-gray-900
                      overflow-hidden
                      z-10
                    `}
                    style={{
                      gridColumn: `span ${meeting.attendees.length}`,
                      height: `${(meeting.duration / SLOT_DURATION) * 48 - 4}px`,
                    }}
                  >
                    <div className="font-semibold truncate text-[10px] leading-tight">
                      {meeting.title}
                    </div>
                    <div className="text-[9px] text-gray-600 mt-0.5">
                      {meeting.duration}m
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover validation message */}
        <AnimatePresence>
          {isHovered && validationMessage?.slot === slotKey && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                absolute top-0 left-0 right-0 z-20 px-2 py-1
                text-xs font-medium text-center
                ${
                  validationMessage.valid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              `}
            >
              {validationMessage.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_DURATION;

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-max">
        {/* Header with days and principals */}
        <div className="sticky top-0 z-10 bg-white border-b-2 border-gray-300">
          <div className="flex">
            {/* Time column header */}
            <div className="w-20 border-r border-gray-200 bg-gray-50" />

            {/* Day headers */}
            {DAYS.map((day, dayIndex) => (
              <div
                key={day}
                className="flex-1 min-w-[600px] border-r border-gray-200"
              >
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900">{day}</h3>
                </div>

                {/* Principal names */}
                <div className="grid grid-cols-6 gap-px bg-gray-100 text-xs">
                  {principals.map((principal) => (
                    <div
                      key={principal.id}
                      className={`px-2 py-1.5 text-center font-medium ${principal.color}`}
                    >
                      <div className="truncate">{principal.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-gray-600 truncate">
                        {principal.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex">
          {/* Time labels */}
          <div className="w-20 border-r border-gray-200 bg-gray-50">
            {Array.from({ length: totalSlots }).map((_, slotIndex) => {
              const hour = START_HOUR + Math.floor((slotIndex * SLOT_DURATION) / 60);
              const minute = (slotIndex * SLOT_DURATION) % 60;

              // Only show time label on hour marks
              if (minute === 0) {
                return (
                  <div
                    key={slotIndex}
                    className="h-12 flex items-center justify-end pr-2 text-xs text-gray-600 font-medium"
                  >
                    {formatTime(hour, minute)}
                  </div>
                );
              }

              return <div key={slotIndex} className="h-12 border-t border-gray-100" />;
            })}
          </div>

          {/* Day columns */}
          {DAYS.map((day, dayIndex) => (
            <div
              key={day}
              className="flex-1 min-w-[600px] border-r border-gray-200"
            >
              {Array.from({ length: totalSlots }).map((_, slotIndex) =>
                renderTimeSlot(dayIndex, slotIndex)
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
