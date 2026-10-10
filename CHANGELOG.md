# Changelog | تغییرات

All notable changes to this project will be documented in this file.

---

## [1.0.0] — 2025-10-10

### ✨ Added | اضافه‌شده

#### Core Features
- **Comment Finder Mode**: AI suggests relevant English comments for X/Twitter posts
- **Viral Post Generator Mode**: AI writes viral X posts for your own account from a topic
- **Bilingual UI**: Full Persian (RTL) and English (LTR) support with one-click toggle
- **Persian Translation**: Every English comment/post includes a faithful Persian translation
- **Dark/Light Mode**: Theme toggle with system preference detection
- **PWA Support**: Installable on Android with custom icons (192px, 512px, maskable)

#### Comment Features
- **Smart Research Toggle**: Searches the web about the tweet topic before commenting (e.g. crypto projects)
- **Anti-AI-Detection**: Comments are written to look like real humans (no "Man," "Dude," AI clichés)
- **Emoji System**: Configurable count (0-3) and style (variety/consistent)
- **5 Tone Options**: Friendly, Professional, Casual, Witty, Expert
- **3 Length Options**: Short (1-15 words), Medium (15-40), Long (40-80)
- **8 Angle Types**: Mixed, Question, Agreement, Insight, Experience, Praise, Humor, Counterpoint
- **3 English Levels**: Simple (B1), Intermediate (B2), Advanced (C1)
- **Image Generation**: Optional relevant image for each comment
- **Tweet Auto-Fetch**: Paste a tweet link → auto-extract text via syndication API

#### Viral Mode Features
- **8 Viral Hooks**: Contrarian, List, Story, Thread, Question, Hot Take, Data Point, Vulnerability
- **Smart Research**: Optional web research before generating posts
- **Image Generation**: Optional image for viral posts

#### Infrastructure
- **Personal API Key**: Use your own z-ai API key (stored in browser only)
- **Site API Fallback**: Default free API for everyone
- **Rules Cache**: X rules loaded once from file, cached in server memory
- **Job-Based Image Polling**: Image generation runs in background via job/poll pattern
- **History**: Last 20 generations saved in browser localStorage
- **Sticky Footer**: Proper layout on all screen sizes
- **Responsive Design**: Mobile-first, works on all devices

#### Documentation
- **Bilingual README**: Full FA/EN installation and usage guide
- **X Rules File**: Comprehensive 2024-2025 algorithm insights + anti-AI practices
- **User Preferences File**: Editable user preferences

### 🐛 Known Issues | مشکلات شناخته‌شده

1. **Image generation takes 60-90 seconds** — runs in background, but slow
2. **Image generation may fail** if gateway times out (job/poll pattern helps but not 100%)
3. **Auto-fetching tweet links** fails for private/deleted tweets (X limitation)
4. **Site API** may rate-limit with heavy usage — use personal API key
5. **Rules cache** is in-memory only (won't work on serverless without Redis)
6. **History** is browser-only, doesn't sync across devices

### 🛠️ Tech Stack
- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- z-ai-web-dev-sdk (AI, web search, image generation)
- Prisma ORM + SQLite
- next-themes
- Vazirmatn font (Persian)

---

## Upcoming | بعدی

### [1.1.0] — Planned
- Improve image generation stability
- Add retry logic for failed image generations
- Add image size options (square, portrait, landscape)

### [1.2.0] — Planned
- User accounts (NextAuth)
- History sync across devices
- Saved favorite comments

### [1.3.0] — Planned
- Post scheduling
- Queue management
- Best-time-to-post suggestions

### [2.0.0] — Future
- Multi-platform support (LinkedIn, Threads, Bluesky)
- Analytics dashboard
- Team collaboration
