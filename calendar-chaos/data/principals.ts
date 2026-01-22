import { Principal } from '@/lib/types';

export const ALL_PRINCIPALS: Principal[] = [
  {
    id: 'dana',
    name: 'Dana Chen',
    title: 'CEO',
    color: 'bg-blue-100 border-blue-300 text-blue-900',
    quirk: 'No meetings before 10am',
    constraints: {
      noMeetingsBefore: 10,
    },
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    title: 'CFO',
    color: 'bg-purple-100 border-purple-300 text-purple-900',
    quirk: 'Needs 15min travel time between buildings',
    constraints: {
      needsTravelTime: 15,
    },
  },
  {
    id: 'priya',
    name: 'Priya Patel',
    title: 'CTO',
    color: 'bg-green-100 border-green-300 text-green-900',
    quirk: 'Prefers async, -10 points if included unnecessarily',
    constraints: {
      preferAsync: true,
    },
  },
  {
    id: 'jordan',
    name: 'Jordan Kim',
    title: 'VP Product',
    color: 'bg-orange-100 border-orange-300 text-orange-900',
    quirk: 'Only available after 9am',
    constraints: {
      noMeetingsBefore: 9,
    },
  },
  {
    id: 'sam',
    name: 'Sam Rodriguez',
    title: 'VP Engineering',
    color: 'bg-pink-100 border-pink-300 text-pink-900',
    quirk: 'Prefers mornings, -5 points for afternoon meetings',
    constraints: {
      noMeetingsAfter: 14,
    },
  },
  {
    id: 'alex',
    name: 'Alex Thompson',
    title: 'VP Sales',
    color: 'bg-cyan-100 border-cyan-300 text-cyan-900',
    quirk: 'Frequent timezone changes',
  },
];

// Get principals for a specific level
export function getPrincipalsForLevel(levelNumber: number): Principal[] {
  switch (levelNumber) {
    case 1:
      return ALL_PRINCIPALS.slice(0, 3); // Dana, Marcus, Priya
    case 2:
      return ALL_PRINCIPALS.slice(0, 4); // Add Jordan
    case 3:
      return ALL_PRINCIPALS.slice(0, 5); // Add Sam
    case 4:
    case 5:
    default:
      return ALL_PRINCIPALS; // All 6
  }
}
