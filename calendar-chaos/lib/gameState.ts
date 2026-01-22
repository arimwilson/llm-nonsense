import { create } from 'zustand';
import {
  GameState,
  ScheduledMeeting,
  Meeting,
  TimeSlot,
  Level,
  CalendarSlot,
} from './types';
import { generateLevel, initializeCalendar } from './levelGenerator';
import { calculateTotalScore, timeSlotToMinutes } from './scoringEngine';
import { SCORING, MAX_FAILED_MEETINGS, START_HOUR, SLOT_DURATION } from './constants';

interface GameStore extends GameState {
  level: Level | null;
  currentDay: number;
  isGameOver: boolean;
  isLevelComplete: boolean;
  draggedMeeting: Meeting | null;

  // Actions
  startLevel: (levelNumber: number) => void;
  scheduleMeeting: (meeting: Meeting, startTime: TimeSlot, attendees: string[]) => boolean;
  removeMeeting: (meetingId: string) => void;
  setDraggedMeeting: (meeting: Meeting | null) => void;
  advanceDay: () => void;
  checkLevelComplete: () => void;
  resetGame: () => void;
  undoLastMove: () => void;
  canScheduleMeeting: (meeting: Meeting, startTime: TimeSlot, attendees: string[]) => {
    valid: boolean;
    reason?: string;
  };
}

const useGameStore = create<GameStore>((set, get) => ({
  currentLevel: 1,
  score: 0,
  scheduledMeetings: [],
  queuedMeetings: [],
  calendar: [],
  blockedSlots: [],
  failedMeetings: 0,
  usedRooms: {},
  undoStack: [],
  maxUndos: 3,
  level: null,
  currentDay: 0,
  isGameOver: false,
  isLevelComplete: false,
  draggedMeeting: null,

  startLevel: (levelNumber: number) => {
    const { level, queuedMeetings, blockedSlots } = generateLevel(levelNumber);
    const principals = level.principals.map((p) => p.id);
    const calendar = initializeCalendar(principals, blockedSlots);

    set({
      currentLevel: levelNumber,
      level,
      queuedMeetings,
      blockedSlots,
      calendar,
      scheduledMeetings: [],
      score: 0,
      failedMeetings: 0,
      usedRooms: {},
      undoStack: [],
      currentDay: 0,
      isGameOver: false,
      isLevelComplete: false,
    });
  },

  canScheduleMeeting: (meeting: Meeting, startTime: TimeSlot, attendees: string[]) => {
    const state = get();
    const { level, calendar, scheduledMeetings, usedRooms } = state;

    if (!level) return { valid: false, reason: 'No active level' };

    // Check all required attendees are included
    const missingRequired = meeting.requiredAttendees.filter(
      (id) => !attendees.includes(id)
    );
    if (missingRequired.length > 0) {
      return { valid: false, reason: 'Missing required attendees' };
    }

    // Check deadline
    if (startTime.day > meeting.deadline) {
      return { valid: false, reason: 'Past deadline' };
    }

    // Check time bounds
    const slotsNeeded = meeting.duration / SLOT_DURATION;
    const startSlotIndex = ((startTime.hour - START_HOUR) * 60 + startTime.minute) / SLOT_DURATION;

    if (startSlotIndex + slotsNeeded > calendar[startTime.day].length) {
      return { valid: false, reason: 'Meeting extends past end of day' };
    }

    // Check for conflicts and principal constraints
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startSlotIndex + i;

      for (const attendeeId of attendees) {
        const principal = level.principals.find((p) => p.id === attendeeId);
        if (!principal) continue;

        const principalIndex = level.principals.findIndex((p) => p.id === attendeeId);
        const slot = calendar[startTime.day]?.[slotIndex]?.[principalIndex];

        if (!slot) {
          return { valid: false, reason: 'Invalid time slot' };
        }

        // Check if blocked
        if (slot.isBlocked || slot.meeting) {
          return { valid: false, reason: `${principal.name} is already busy` };
        }

        // Check principal constraints (only for first slot)
        if (i === 0) {
          const hour = startTime.hour;

          if (principal.constraints?.noMeetingsBefore && hour < principal.constraints.noMeetingsBefore) {
            return {
              valid: false,
              reason: `${principal.name} is not available before ${principal.constraints.noMeetingsBefore}:00`,
            };
          }

          if (principal.constraints?.noMeetingsAfter && hour >= principal.constraints.noMeetingsAfter) {
            return {
              valid: false,
              reason: `${principal.name} is not available after ${principal.constraints.noMeetingsAfter}:00`,
            };
          }
        }
      }
    }

    // Check prep time requirement
    if (meeting.needsPrep && startSlotIndex > 0) {
      // Need 30min buffer before meeting
      const prevSlotIndex = startSlotIndex - 1;

      for (const attendeeId of attendees) {
        const principalIndex = level.principals.findIndex((p) => p.id === attendeeId);
        const prevSlot = calendar[startTime.day]?.[prevSlotIndex]?.[principalIndex];

        if (prevSlot?.meeting || prevSlot?.isBlocked) {
          return { valid: false, reason: 'Needs 30min prep time before meeting' };
        }
      }
    }

    // Check meeting room availability
    if (meeting.isInPerson && level.maxMeetingRooms) {
      const timeKey = `${startTime.day}-${startTime.hour}-${startTime.minute}`;
      const roomsUsed = usedRooms[timeKey] || 0;

      if (roomsUsed >= level.maxMeetingRooms) {
        return { valid: false, reason: 'No meeting rooms available' };
      }
    }

    return { valid: true };
  },

  scheduleMeeting: (meeting: Meeting, startTime: TimeSlot, attendees: string[]) => {
    const state = get();
    const validation = state.canScheduleMeeting(meeting, startTime, attendees);

    if (!validation.valid) {
      return false;
    }

    const { level, calendar, queuedMeetings, scheduledMeetings, score, currentDay } = state;
    if (!level) return false;

    // Create scheduled meeting
    const scheduledMeeting: ScheduledMeeting = {
      ...meeting,
      startTime,
      attendees,
    };

    // Update calendar
    const newCalendar = JSON.parse(JSON.stringify(calendar)) as CalendarSlot[][][];
    const slotsNeeded = meeting.duration / SLOT_DURATION;
    const startSlotIndex = ((startTime.hour - START_HOUR) * 60 + startTime.minute) / SLOT_DURATION;

    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startSlotIndex + i;

      attendees.forEach((attendeeId) => {
        const principalIndex = level.principals.findIndex((p) => p.id === attendeeId);
        if (principalIndex !== -1) {
          newCalendar[startTime.day][slotIndex][principalIndex] = {
            ...newCalendar[startTime.day][slotIndex][principalIndex],
            meeting: scheduledMeeting,
          };
        }
      });
    }

    // Update room usage
    const newUsedRooms = { ...state.usedRooms };
    if (meeting.isInPerson) {
      const timeKey = `${startTime.day}-${startTime.hour}-${startTime.minute}`;
      newUsedRooms[timeKey] = (newUsedRooms[timeKey] || 0) + 1;
    }

    // Calculate new score
    const newScheduledMeetings = [...scheduledMeetings, scheduledMeeting];
    const newScore = calculateTotalScore(newScheduledMeetings, level.principals, currentDay);

    // Remove from queue
    const newQueue = queuedMeetings.filter((m) => m.id !== meeting.id);

    set({
      calendar: newCalendar,
      scheduledMeetings: newScheduledMeetings,
      queuedMeetings: newQueue,
      score: newScore,
      usedRooms: newUsedRooms,
    });

    // Check if level is complete
    get().checkLevelComplete();

    return true;
  },

  removeMeeting: (meetingId: string) => {
    const state = get();
    const { calendar, scheduledMeetings, queuedMeetings, level } = state;
    if (!level) return;

    const meeting = scheduledMeetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    // Clear from calendar
    const newCalendar = JSON.parse(JSON.stringify(calendar)) as CalendarSlot[][][];
    const slotsNeeded = meeting.duration / SLOT_DURATION;
    const startSlotIndex =
      ((meeting.startTime.hour - START_HOUR) * 60 + meeting.startTime.minute) / SLOT_DURATION;

    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startSlotIndex + i;

      meeting.attendees.forEach((attendeeId) => {
        const principalIndex = level.principals.findIndex((p) => p.id === attendeeId);
        if (principalIndex !== -1 && newCalendar[meeting.startTime.day]?.[slotIndex]?.[principalIndex]) {
          newCalendar[meeting.startTime.day][slotIndex][principalIndex] = {
            ...newCalendar[meeting.startTime.day][slotIndex][principalIndex],
            meeting: undefined,
          };
        }
      });
    }

    // Update state
    const newScheduledMeetings = scheduledMeetings.filter((m) => m.id !== meetingId);
    const newScore = calculateTotalScore(newScheduledMeetings, level.principals, state.currentDay);

    set({
      calendar: newCalendar,
      scheduledMeetings: newScheduledMeetings,
      queuedMeetings: [...queuedMeetings, meeting],
      score: newScore,
    });
  },

  setDraggedMeeting: (meeting: Meeting | null) => {
    set({ draggedMeeting: meeting });
  },

  advanceDay: () => {
    const state = get();
    const { currentDay, queuedMeetings, failedMeetings, level } = state;

    // Check for expired meetings
    const expiredMeetings = queuedMeetings.filter((m) => m.deadline < currentDay);
    const highPriorityExpired = expiredMeetings.filter((m) => m.priority === 'high').length;

    const newFailedMeetings = failedMeetings + highPriorityExpired;
    const newQueue = queuedMeetings.filter((m) => m.deadline >= currentDay);

    // Apply penalties for expired meetings
    const penalty = expiredMeetings.length * SCORING.MISSED_DEADLINE_PENALTY;

    set({
      currentDay: currentDay + 1,
      queuedMeetings: newQueue,
      failedMeetings: newFailedMeetings,
      score: state.score + penalty,
      isGameOver: newFailedMeetings >= MAX_FAILED_MEETINGS,
    });
  },

  checkLevelComplete: () => {
    const state = get();
    const { queuedMeetings, score, level, scheduledMeetings } = state;

    if (!level) return;

    // Check if all high priority meetings are scheduled
    const highPriorityInQueue = queuedMeetings.filter((m) => m.priority === 'high').length;

    // Level complete if:
    // 1. All high priority meetings scheduled
    // 2. Score threshold met
    // 3. All meetings scheduled (optional)
    if (queuedMeetings.length === 0 && score >= level.scoreThreshold) {
      set({ isLevelComplete: true });
    } else if (highPriorityInQueue === 0 && score >= level.scoreThreshold) {
      set({ isLevelComplete: true });
    }
  },

  resetGame: () => {
    set({
      currentLevel: 1,
      score: 0,
      scheduledMeetings: [],
      queuedMeetings: [],
      calendar: [],
      blockedSlots: [],
      failedMeetings: 0,
      usedRooms: {},
      undoStack: [],
      level: null,
      currentDay: 0,
      isGameOver: false,
      isLevelComplete: false,
      draggedMeeting: null,
    });
  },

  undoLastMove: () => {
    // TODO: Implement undo functionality
    console.log('Undo not yet implemented');
  },
}));

export default useGameStore;
