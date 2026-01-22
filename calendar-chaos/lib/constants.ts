import { Level, Priority } from './types';

// Time constants
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const START_HOUR = 8;
export const END_HOUR = 18;
export const SLOT_DURATION = 30; // minutes

// Scoring constants
export const SCORING = {
  BASE_MEETING: 50,
  OPTIONAL_ATTENDEE: 25,
  EARLY_COMPLETION: 30,
  EFFICIENCY_BONUS: 40, // for minimizing gaps
  FOCUS_TIME_BONUS: 60, // for preserving 2+ hour blocks
  HIGH_PRIORITY_LATE_PENALTY: -50,
  MISSED_DEADLINE_PENALTY: -100,
  UNNECESSARY_ATTENDEE_PENALTY: -10,
};

// Priority colors
export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'border-red-500',
  medium: 'border-yellow-500',
  low: 'border-green-500',
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: 'bg-red-50',
  medium: 'bg-yellow-50',
  low: 'bg-green-50',
};

export const PRIORITY_ICONS: Record<Priority, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

// Principal colors (for calendar view)
export const PRINCIPAL_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-green-100 border-green-300 text-green-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-pink-100 border-pink-300 text-pink-900',
  'bg-cyan-100 border-cyan-300 text-cyan-900',
];

// Level configurations
export const LEVELS: Level[] = [
  {
    number: 1,
    name: 'The Honeymoon',
    description: 'Your first week on the job. Keep it simple.',
    principals: [], // Will be populated with actual principals
    prefilledPercentage: 20,
    meetingsToSchedule: 8,
    scoreThreshold: 500,
    hasOptionalAttendees: false,
    hasPriorities: false,
    hasTimeZones: false,
    hasPrepTime: false,
    hasMeetingRooms: false,
  },
  {
    number: 2,
    name: 'Reality Sets In',
    description: 'The executives are getting busier...',
    principals: [],
    prefilledPercentage: 35,
    meetingsToSchedule: 12,
    scoreThreshold: 900,
    hasOptionalAttendees: true,
    hasPriorities: true,
    hasTimeZones: false,
    hasPrepTime: false,
    hasMeetingRooms: false,
  },
  {
    number: 3,
    name: 'Q4 Planning',
    description: 'End of year madness begins.',
    principals: [],
    prefilledPercentage: 50,
    meetingsToSchedule: 15,
    scoreThreshold: 1400,
    hasOptionalAttendees: true,
    hasPriorities: true,
    hasTimeZones: true,
    hasPrepTime: false,
    hasMeetingRooms: false,
  },
  {
    number: 4,
    name: 'Board Week',
    description: 'The board is in town. Everything is urgent.',
    principals: [],
    prefilledPercentage: 65,
    meetingsToSchedule: 18,
    scoreThreshold: 2000,
    hasOptionalAttendees: true,
    hasPriorities: true,
    hasTimeZones: true,
    hasPrepTime: true,
    hasMeetingRooms: true,
    maxMeetingRooms: 3,
  },
  {
    number: 5,
    name: 'The Gauntlet',
    description: 'Endless chaos. How long can you survive?',
    principals: [],
    prefilledPercentage: 75,
    meetingsToSchedule: 20,
    scoreThreshold: 2500,
    hasOptionalAttendees: true,
    hasPriorities: true,
    hasTimeZones: true,
    hasPrepTime: true,
    hasMeetingRooms: true,
    maxMeetingRooms: 3,
  },
];

// Max failed high priority meetings before game over
export const MAX_FAILED_MEETINGS = 3;
