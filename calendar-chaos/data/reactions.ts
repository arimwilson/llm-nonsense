export const EXECUTIVE_REACTIONS = {
  scheduled: [
    "Perfect! That works for me.",
    "Great, I'll clear my calendar.",
    "Excellent timing!",
    "Works for me!",
    "Sounds good!",
    "I'll be there.",
    "Let's do it!",
    "Count me in.",
  ],
  tooManyMeetings: [
    "My calendar is looking pretty packed...",
    "Do I really need to attend this?",
    "Another meeting? Really?",
    "Can't this be an email?",
    "My day is already full!",
    "I'm drowning in meetings!",
  ],
  earlyMorning: [
    "That's pretty early...",
    "I'll need extra coffee for this one.",
    "Can we push this later?",
    "Not a morning person...",
    "Ugh, morning meetings.",
  ],
  lateFriday: [
    "On a Friday afternoon?!",
    "There goes my weekend plans...",
    "Can we do this Monday instead?",
    "Friday meetings are the worst.",
  ],
  backToBack: [
    "No time to breathe between meetings!",
    "When am I supposed to get actual work done?",
    "Back-to-back meetings all day...",
    "I need a break!",
  ],
  wellScheduled: [
    "This is a well-organized day!",
    "Great scheduling!",
    "I appreciate the breathing room.",
    "Finally, some focus time!",
    "This calendar looks manageable.",
  ],
};

export const LEVEL_FLAVOR_TEXT = [
  {
    level: 1,
    intro: "Welcome to your first week! The executives are still being nice to you. Enjoy it while it lasts.",
    complete: "Not bad! But wait until you see what's coming next week...",
  },
  {
    level: 2,
    intro: "The honeymoon is over. Now they have 'preferences' and 'priorities'.",
    complete: "You survived! The executives are starting to trust you. Don't let it go to your head.",
  },
  {
    level: 3,
    intro: "Q4 planning begins. Everyone suddenly needs to meet about everything.",
    complete: "Amazing! You're becoming a scheduling wizard. But the real test is ahead...",
  },
  {
    level: 4,
    intro: "Board week. The stress is real. The coffee is strong. The meetings are endless.",
    complete: "Incredible! You've mastered the art of corporate calendar Tetris!",
  },
  {
    level: 5,
    intro: "Welcome to chaos mode. No more mercy. Good luck, you'll need it.",
    complete: "🎉 LEGENDARY! You've achieved calendar nirvana! You are the meeting master!",
  },
];

export const ACHIEVEMENT_MESSAGES = {
  perfectLevel: "🌟 PERFECT LEVEL! All meetings scheduled optimally!",
  speedDemon: "⚡ SPEED DEMON! Completed level in under 2 minutes!",
  efficiencyKing: "👑 EFFICIENCY KING! Minimal gaps, maximum productivity!",
  focusTime: "🎯 FOCUS TIME CHAMPION! Preserved all 2-hour blocks!",
  noFails: "💯 FLAWLESS! No meetings failed!",
  optionalMaster: "🌈 PEOPLE PLEASER! Included all optional attendees!",
  earlyBird: "🐦 EARLY BIRD! All meetings scheduled before deadline!",
};

export const CHAOS_EVENTS = [
  {
    message: "🚨 BREAKING: CEO stuck in traffic! All morning meetings delayed!",
    effect: "Dana unavailable until 11am",
  },
  {
    message: "⚠️ URGENT: Board member needs immediate sync!",
    effect: "New high-priority meeting added",
  },
  {
    message: "📧 Email alert: CFO flying to NYC, timezone changes!",
    effect: "Marcus unavailable after 3pm",
  },
  {
    message: "🔥 CRISIS: Production down! Engineering all-hands required!",
    effect: "New urgent meeting with all engineers",
  },
  {
    message: "☕ Coffee machine broken. Everyone grumpy. Schedule carefully!",
    effect: "All meeting scores -10 for this round",
  },
  {
    message: "🎉 Good news! Team won a big deal! Everyone's in a good mood!",
    effect: "All meeting scores +15 bonus",
  },
];

export const FUNNY_MEETING_COMBOS = [
  "Why We Meet About Meetings",
  "Discussing the Discussion",
  "Synergy Synergy Sync",
  "Bandwidth for Bandwidth Planning",
  "Emergency Non-Emergency Meeting",
  "Urgent Review of Urgent Reviews",
  "Strategic Strategy Session",
  "Alignment About Alignment",
  "Circle Back Roundtable",
  "Touch Base About Touching Base",
  "Quick Sync About Quick Syncs",
  "Deep Dive Into Deep Dives",
  "Parking Lot for Parking Lots",
  "Action Items for Action Items",
  "Stakeholder Stakeholder Update",
];

export function getRandomReaction(category: keyof typeof EXECUTIVE_REACTIONS): string {
  const reactions = EXECUTIVE_REACTIONS[category];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

export function getFunnyMeetingName(): string {
  return FUNNY_MEETING_COMBOS[Math.floor(Math.random() * FUNNY_MEETING_COMBOS.length)];
}
