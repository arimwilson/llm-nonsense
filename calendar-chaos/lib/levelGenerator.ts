import { CalendarSlot, Level, Meeting, TimeSlot, ScheduledMeeting } from './types';
import { LEVELS, START_HOUR, END_HOUR, SLOT_DURATION } from './constants';
import { getPrincipalsForLevel } from '@/data/principals';
import { generateMeetingsForLevel, generateMeeting, resetMeetingCounter } from './meetingGenerator';

function createEmptyCalendar(principals: number): CalendarSlot[][][] {
  const calendar: CalendarSlot[][][] = [];

  // 5 days
  for (let day = 0; day < 5; day++) {
    const daySlots: CalendarSlot[][] = [];

    // Hours from 8am to 6pm (in 30-minute slots)
    const totalSlots = ((END_HOUR - START_HOUR) * 60) / SLOT_DURATION;

    for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
      const hour = START_HOUR + Math.floor((slotIndex * SLOT_DURATION) / 60);
      const minute = (slotIndex * SLOT_DURATION) % 60;

      const principalSlots: CalendarSlot[] = [];

      for (let p = 0; p < principals; p++) {
        principalSlots.push({
          time: { day, hour, minute },
          principalId: `principal-${p}`,
          isBlocked: false,
        });
      }

      daySlots.push(principalSlots);
    }

    calendar.push(daySlots);
  }

  return calendar;
}

function generateBlockedSlots(
  principals: string[],
  prefilledPercentage: number
): ScheduledMeeting[] {
  const totalSlots = 5 * ((END_HOUR - START_HOUR) * 60) / SLOT_DURATION * principals.length;
  const slotsToFill = Math.floor((totalSlots * prefilledPercentage) / 100);

  const blockedMeetings: ScheduledMeeting[] = [];
  let attempts = 0;
  const maxAttempts = slotsToFill * 3; // Prevent infinite loops

  while (blockedMeetings.length < slotsToFill / 2 && attempts < maxAttempts) {
    attempts++;

    const day = Math.floor(Math.random() * 5);
    const hour = START_HOUR + Math.floor(Math.random() * (END_HOUR - START_HOUR - 1));
    const minute = Math.random() > 0.5 ? 0 : 30;
    const duration = [30, 60, 90][Math.floor(Math.random() * 3)];

    // Random principal(s)
    const attendeeCount = Math.floor(Math.random() * Math.min(3, principals.length)) + 1;
    const attendees = [...principals]
      .sort(() => Math.random() - 0.5)
      .slice(0, attendeeCount);

    const startTime: TimeSlot = { day, hour, minute };

    // Check if this conflicts with existing blocked meetings
    const hasConflict = blockedMeetings.some((existing) => {
      if (existing.startTime.day !== day) return false;

      const existingStart = existing.startTime.hour * 60 + existing.startTime.minute;
      const existingEnd = existingStart + existing.duration;
      const newStart = hour * 60 + minute;
      const newEnd = newStart + duration;

      // Check if any attendee overlaps
      const sharedAttendees = attendees.filter((a) => existing.attendees.includes(a));
      if (sharedAttendees.length === 0) return false;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (!hasConflict) {
      blockedMeetings.push({
        id: `blocked-${blockedMeetings.length}`,
        title: 'Blocked',
        duration,
        requiredAttendees: attendees,
        optionalAttendees: [],
        attendees,
        priority: 'low',
        deadline: 4,
        startTime,
      });
    }
  }

  return blockedMeetings;
}

export function generateLevel(levelNumber: number): {
  level: Level;
  queuedMeetings: Meeting[];
  blockedSlots: ScheduledMeeting[];
} {
  resetMeetingCounter();

  const levelConfig = LEVELS[levelNumber - 1];
  const principals = getPrincipalsForLevel(levelNumber);

  // Create level with actual principals
  const level: Level = {
    ...levelConfig,
    principals,
  };

  // Generate meetings to schedule
  const queuedMeetings = generateMeetingsForLevel(
    principals,
    level.meetingsToSchedule,
    level.hasOptionalAttendees,
    level.hasPriorities,
    level.hasPrepTime,
    level.hasMeetingRooms
  );

  // Generate blocked slots
  const blockedSlots = generateBlockedSlots(
    principals.map((p) => p.id),
    level.prefilledPercentage
  );

  return {
    level,
    queuedMeetings,
    blockedSlots,
  };
}

export function initializeCalendar(
  principals: string[],
  blockedSlots: ScheduledMeeting[]
): CalendarSlot[][][] {
  const calendar = createEmptyCalendar(principals.length);

  // Mark blocked slots
  blockedSlots.forEach((meeting) => {
    const { day, hour, minute } = meeting.startTime;
    const slotIndex = ((hour - START_HOUR) * 60 + minute) / SLOT_DURATION;

    const slotsNeeded = meeting.duration / SLOT_DURATION;

    for (let i = 0; i < slotsNeeded; i++) {
      meeting.attendees.forEach((attendeeId) => {
        const principalIndex = principals.indexOf(attendeeId);
        if (principalIndex !== -1 && calendar[day]?.[slotIndex + i]?.[principalIndex]) {
          calendar[day][slotIndex + i][principalIndex] = {
            ...calendar[day][slotIndex + i][principalIndex],
            isBlocked: true,
            meeting,
          };
        }
      });
    }
  });

  return calendar;
}
