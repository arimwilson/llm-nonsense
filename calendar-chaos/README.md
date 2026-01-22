# 📅 Calendar Chaos

A browser-based strategy game where you take on the role of an executive assistant trying to schedule meetings for a busy leadership team. Think SimCity meets Tetris meets corporate hell!

## 🎮 Game Overview

Manage a week-long calendar for multiple executives, drag-and-drop meetings into valid time slots, and navigate increasingly complex constraints. Can you handle the pressure?

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎯 How to Play

1. **Drag meetings** from the queue on the right to the calendar grid
2. **Ensure all required attendees** are available in that time slot
3. **Watch deadlines** - meetings must be scheduled by their deadline day
4. **Meet the score threshold** to advance to the next level
5. **Don't fail 3 high-priority meetings** or it's game over!

## 🏆 Scoring System

- **Base points**: 50 per scheduled meeting
- **Bonuses**:
  - +25 per optional attendee included
  - +30 for early completion (before deadline)
  - +40 for scheduling efficiency (minimizing gaps)
  - +60 for preserving focus time (2+ hour blocks)
- **Penalties**:
  - -10 for including async-preferring principals unnecessarily
  - -50 for scheduling high-priority meetings late
  - -100 for missing deadlines

## 📊 Levels

### Level 1: The Honeymoon
- 3 principals
- 20% calendar pre-filled
- 8 meetings to schedule
- Score threshold: 500 points

### Level 2: Reality Sets In
- 4 principals
- 35% calendar pre-filled
- Introduces optional attendees and priorities
- 12 meetings to schedule
- Score threshold: 900 points

### Level 3: Q4 Planning
- 5 principals
- 50% calendar pre-filled
- Time zone constraints
- 15 meetings to schedule
- Score threshold: 1400 points

### Level 4: Board Week
- 6 principals
- 65% calendar pre-filled
- Prep time requirements
- Meeting room constraints (max 3 rooms)
- 18 meetings to schedule
- Score threshold: 2000 points

### Level 5: The Gauntlet
- All features enabled
- Maximum difficulty
- 20 meetings to schedule
- Score threshold: 2500 points

## 👥 The Principals

- **Dana Chen (CEO)** - No meetings before 10am
- **Marcus Johnson (CFO)** - Needs 15min travel time between buildings
- **Priya Patel (CTO)** - Prefers async, -10 points if included unnecessarily
- **Jordan Kim (VP Product)** - Only available after 9am
- **Sam Rodriguez (VP Engineering)** - Prefers mornings
- **Alex Thompson (VP Sales)** - Frequent timezone changes

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Language**: TypeScript
- **Deployment**: Vercel

## 📁 Project Structure

```
calendar-chaos/
├── app/
│   ├── page.tsx          # Main game page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Calendar.tsx      # Calendar grid with drag-drop
│   ├── MeetingCard.tsx   # Individual meeting card
│   ├── MeetingQueue.tsx  # Sidebar with meetings
│   ├── ScoreBoard.tsx    # Score and progress display
│   ├── LevelComplete.tsx # Level completion modal
│   └── GameOver.tsx      # Game over modal
├── lib/
│   ├── gameState.ts      # Zustand store
│   ├── types.ts          # TypeScript types
│   ├── constants.ts      # Game constants
│   ├── scoringEngine.ts  # Scoring calculations
│   ├── meetingGenerator.ts # Procedural meeting generation
│   └── levelGenerator.ts # Level setup
└── data/
    ├── buzzwords.ts      # Corporate meeting name generator
    └── principals.ts     # Executive definitions
```

## 🎨 Game Features

- ✅ Drag-and-drop meeting scheduling
- ✅ Real-time validation feedback
- ✅ Procedurally generated meeting names
- ✅ 5 levels with increasing difficulty
- ✅ Score tracking and thresholds
- ✅ Principal constraints and quirks
- ✅ Priority system (high/medium/low)
- ✅ Deadline management
- ✅ Meeting room constraints
- ✅ Prep time requirements
- ✅ Local storage for progress
- ✅ Responsive design

## 🚧 Future Enhancements

- [ ] Leaderboard with Vercel KV
- [ ] Daily challenge mode
- [ ] "Boss Mode" spreadsheet skin
- [ ] Share score as image
- [ ] Sound effects and music
- [ ] Undo functionality
- [ ] Keyboard navigation
- [ ] Mobile optimization
- [ ] Tutorial/onboarding
- [ ] Achievement system

## 🚀 Deploy on Vercel

The easiest way to deploy Calendar Chaos is to use the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

Alternatively, you can use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

Made with ☕ and 😰 by developers who know calendar chaos too well.
