import { Meeting, Priority, Principal } from './types';
import { PREFIXES, SUBJECTS, SUFFIXES, MEETING_DURATIONS } from '@/data/buzzwords';

let meetingIdCounter = 0;

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMeetingTitle(): string {
  const prefix = getRandomElement(PREFIXES);
  const subject = getRandomElement(SUBJECTS);
  const suffix = getRandomElement(SUFFIXES);
  return `${prefix} ${subject} ${suffix}`;
}

function selectRandomAttendees(
  principals: Principal[],
  min: number,
  max: number
): string[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...principals].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p) => p.id);
}

export function generateMeeting(
  principals: Principal[],
  hasOptionalAttendees: boolean,
  hasPriorities: boolean,
  hasPrepTime: boolean,
  hasMeetingRooms: boolean,
  deadline?: number
): Meeting {
  const id = `meeting-${++meetingIdCounter}`;
  const title = generateMeetingTitle();
  const duration = getRandomElement(MEETING_DURATIONS);

  // At least 1 required attendee, up to half the principals
  const requiredCount = Math.max(1, Math.floor(Math.random() * (principals.length / 2)) + 1);
  const requiredAttendees = selectRandomAttendees(principals, requiredCount, requiredCount);

  // Optional attendees (if enabled)
  let optionalAttendees: string[] = [];
  if (hasOptionalAttendees && Math.random() > 0.5) {
    const availableOptional = principals.filter(
      (p) => !requiredAttendees.includes(p.id)
    );
    if (availableOptional.length > 0) {
      const optionalCount = Math.floor(Math.random() * Math.min(2, availableOptional.length)) + 1;
      optionalAttendees = selectRandomAttendees(availableOptional, optionalCount, optionalCount);
    }
  }

  // Priority (if enabled)
  let priority: Priority = 'medium';
  if (hasPriorities) {
    const rand = Math.random();
    if (rand < 0.3) priority = 'high';
    else if (rand < 0.7) priority = 'medium';
    else priority = 'low';
  }

  // Deadline (random day between current and end of week)
  const meetingDeadline = deadline ?? Math.floor(Math.random() * 5);

  // Special requirements
  const needsPrep = hasPrepTime && Math.random() > 0.7;
  const isInPerson = hasMeetingRooms && Math.random() > 0.6;

  return {
    id,
    title,
    duration,
    requiredAttendees,
    optionalAttendees,
    priority,
    deadline: meetingDeadline,
    needsPrep,
    isInPerson,
  };
}

export function generateMeetingsForLevel(
  principals: Principal[],
  count: number,
  hasOptionalAttendees: boolean,
  hasPriorities: boolean,
  hasPrepTime: boolean,
  hasMeetingRooms: boolean
): Meeting[] {
  const meetings: Meeting[] = [];

  for (let i = 0; i < count; i++) {
    // Ensure high priority meetings have earlier deadlines
    const deadline = Math.floor(Math.random() * 5);
    meetings.push(
      generateMeeting(
        principals,
        hasOptionalAttendees,
        hasPriorities,
        hasPrepTime,
        hasMeetingRooms,
        deadline
      )
    );
  }

  return meetings;
}

export function resetMeetingCounter(): void {
  meetingIdCounter = 0;
}
