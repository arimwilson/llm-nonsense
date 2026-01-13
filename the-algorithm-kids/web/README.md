# The Algorithm Kids - Marketing Website

A Next.js marketing website for The Algorithm Kids book series and upcoming movie launch.

## Features

- 🎬 Embedded video trailer
- 📚 Free EPUB reader for Book 1
- 🎨 Modern, glitch-aesthetic design matching the book's theme
- 📱 Fully responsive design
- ⚡ Built with Next.js 15 and TypeScript
- 🎨 Styled with Tailwind CSS

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Deployment

This site is optimized for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js and deploy

Alternatively, you can deploy using the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Project Structure

```
web/
├── app/
│   ├── globals.css          # Global styles with custom animations
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main landing page
├── public/
│   ├── trailer.mp4           # Video trailer
│   ├── book1.epub            # Book 1 EPUB file
│   └── cover.png             # Book cover image
├── package.json
└── next.config.js
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **EPUB Support**: Native browser iframe

## Features Detail

### Hero Section
- Animated loading circle effect
- Glitch text animations
- Call-to-action buttons
- Book cover display

### Trailer Section
- Native HTML5 video player
- Video controls
- Poster image

### Read Section
- Direct EPUB viewing in browser
- Download option for offline reading
- Toggle reader interface

### About Section
- World overview
- Character introductions
- Series information

## License

© 2026 The Algorithm Kids - Written by Claude Code, an Anthropic AI
