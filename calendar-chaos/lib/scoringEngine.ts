import { ScheduledMeeting, TimeSlot, Principal } from './types';
import { SCORING } from './constants';

export function calculateMeetingScore(
  meeting: ScheduledMeeting,
  currentDay: number,
  principals: Principal[]
): number {
  let score = SCORING.BASE_MEETING;

  // Bonus for including optional attendees
  const optionalIncluded = meeting.attendees.filter((id) =>
    meeting.optionalAttendees.includes(id)
  ).length;
  score += optionalIncluded * SCORING.OPTIONAL_ATTENDEE;

  // Penalty for including unnecessary attendees (like Priya who prefers async)
  meeting.attendees.forEach((attendeeId) => {
    const principal = principals.find((p) => p.id === attendeeId);
    if (
      principal?.constraints?.preferAsync &&
      !meeting.requiredAttendees.includes(attendeeId)
    ) {
      score += SCORING.UNNECESSARY_ATTENDEE_PENALTY;
    }
  });

  // Early completion bonus
  const daysBeforeDeadline = meeting.deadline - currentDay;
  if (daysBeforeDeadline > 1) {
    score += SCORING.EARLY_COMPLETION;
  }

  // Late scheduling penalty for high priority
  if (meeting.priority === 'high' && daysBeforeDeadline < 1) {
    score += SCORING.HIGH_PRIORITY_LATE_PENALTY;
  }

  return score;
}

export function calculateEfficiencyBonus(
  scheduledMeetings: ScheduledMeeting[],
  principalId: string
): number {
  // Sort meetings by time for this principal
  const principalMeetings = scheduledMeetings
    .filter((m) => m.attendees.includes(principalId))
    .sort((a, b) => {
      if (a.startTime.day !== b.startTime.day) {
        return a.startTime.day - b.startTime.day;
      }
      if (a.startTime.hour !== b.startTime.hour) {
        return a.startTime.hour - b.startTime.hour;
      }
      return a.startTime.minute - b.startTime.minute;
    });

  let bonus = 0;
  let gapCount = 0;

  // Check for gaps between meetings
  for (let i = 0; i < principalMeetings.length - 1; i++) {
    const current = principalMeetings[i];
    const next = principalMeetings[i + 1];

    // Only check same day
    if (current.startTime.day !== next.startTime.day) continue;

    const currentEndMinutes =
      current.startTime.hour * 60 + current.startTime.minute + current.duration;
    const nextStartMinutes = next.startTime.hour * 60 + next.startTime.minute;

    const gap = nextStartMinutes - currentEndMinutes;

    // Small gaps (30-60 min) are good for transitions
    if (gap > 60) {
      gapCount++;
    }
  }

  // Fewer gaps = better efficiency
  if (gapCount === 0 && principalMeetings.length > 2) {
    bonus += SCORING.EFFICIENCY_BONUS;
  }

  return bonus;
}

export function calculateFocusTimeBonus(
  scheduledMeetings: ScheduledMeeting[],
  principalId: string
): number {
  let bonus = 0;

  // Check each day for 2+ hour blocks of free time
  for (let day = 0; day < 5; day++) {
    const dayMeetings = scheduledMeetings
      .filter((m) => m.attendees.includes(principalId) && m.startTime.day === day)
      .sort((a, b) => {
        if (a.startTime.hour !== b.startTime.hour) {
          return a.startTime.hour - b.startTime.hour;
        }
        return a.startTime.minute - b.startTime.minute;
      });

    // Check for focus blocks
    let currentTime = 8 * 60; // 8am in minutes
    const endTime = 18 * 60; // 6pm in minutes

    for (const meeting of dayMeetings) {
      const meetingStart = meeting.startTime.hour * 60 + meeting.startTime.minute;
      const gap = meetingStart - currentTime;

      // 2 hour block = 120 minutes
      if (gap >= 120) {
        bonus += SCORING.FOCUS_TIME_BONUS;
      }

      currentTime = meetingStart + meeting.duration;
    }

    // Check gap after last meeting
    if (endTime - currentTime >= 120) {
      bonus += SCORING.FOCUS_TIME_BONUS;
    }
  }

  return bonus;
}

export function calculateTotalScore(
  scheduledMeetings: ScheduledMeeting[],
  principals: Principal[],
  currentDay: number
): number {
  let total = 0;

  // Score each meeting
  scheduledMeetings.forEach((meeting) => {
    total += calculateMeetingScore(meeting, currentDay, principals);
  });

  // Add efficiency bonuses for each principal
  principals.forEach((principal) => {
    total += calculateEfficiencyBonus(scheduledMeetings, principal.id);
    total += calculateFocusTimeBonus(scheduledMeetings, principal.id);
  });

  return total;
}

export function timeSlotToMinutes(slot: TimeSlot): number {
  return slot.day * 24 * 60 + slot.hour * 60 + slot.minute;
}

export function minutesToTimeSlot(minutes: number): TimeSlot {
  const day = Math.floor(minutes / (24 * 60));
  const remainingMinutes = minutes % (24 * 60);
  const hour = Math.floor(remainingMinutes / 60);
  const minute = remainingMinutes % 60;
  return { day, hour, minute };
}
