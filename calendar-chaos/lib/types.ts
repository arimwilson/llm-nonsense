export type Priority = 'high' | 'medium' | 'low';

export type TimeSlot = {
  day: number; // 0-4 (Mon-Fri)
  hour: number; // 8-18
  minute: number; // 0 or 30
};

export type Principal = {
  id: string;
  name: string;
  title: string;
  color: string;
  quirk?: string;
  constraints?: {
    noMeetingsBefore?: number; // hour
    noMeetingsAfter?: number; // hour
    needsTravelTime?: number; // minutes
    preferAsync?: boolean;
  };
};

export type Meeting = {
  id: string;
  title: string;
  duration: number; // in minutes
  requiredAttendees: string[]; // principal IDs
  optionalAttendees: string[]; // principal IDs
  priority: Priority;
  deadline: number; // day index (0-4)
  needsPrep?: boolean; // requires 30min buffer before
  isInPerson?: boolean; // requires meeting room
};

export type ScheduledMeeting = Meeting & {
  startTime: TimeSlot;
  attendees: string[]; // includes both required and optional who were included
};

export type CalendarSlot = {
  time: TimeSlot;
  principalId: string;
  meeting?: ScheduledMeeting;
  isBlocked?: boolean; // pre-existing meetings/blockers
};

export type Level = {
  number: number;
  name: string;
  description: string;
  principals: Principal[];
  prefilledPercentage: number;
  meetingsToSchedule: number;
  scoreThreshold: number;
  hasOptionalAttendees: boolean;
  hasPriorities: boolean;
  hasTimeZones: boolean;
  hasPrepTime: boolean;
  hasMeetingRooms: boolean;
  maxMeetingRooms?: number;
};

export type GameState = {
  currentLevel: number;
  score: number;
  scheduledMeetings: ScheduledMeeting[];
  queuedMeetings: Meeting[];
  calendar: CalendarSlot[][][]; // [day][hour][principal]
  blockedSlots: ScheduledMeeting[];
  failedMeetings: number;
  usedRooms: { [key: string]: number }; // timeSlot -> room count
  undoStack: GameState[];
  maxUndos: number;
};

export type DraggedMeeting = {
  meeting: Meeting;
  sourceIndex: number;
};
