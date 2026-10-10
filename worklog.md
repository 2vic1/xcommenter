---
Task ID: all
Agent: main (Z.ai Code)
Task: Build a Persian web app that suggests relevant English comments for X/Twitter posts, using AI, with X rules loaded once from a file and cached in memory.

Work Log:
- Loaded LLM and web-reader skills to understand z-ai-web-dev-sdk usage (chat completions + page_reader function).
- Created `data/x-rules.md` — comprehensive X/Twitter platform rules + engagement best practices + comment angle taxonomy (in Persian).
- Created `data/user-preferences.md` — default user preferences file (editable).
- Built `src/lib/rules-cache.ts` — loads rules from disk ONCE, caches in memory, exposes getRules/reloadRules/saveXRules/saveUserPreferences.
- Built `src/lib/tweet-fetcher.ts` — uses z-ai page_reader function to fetch tweet content from an X URL, with URL validation/normalization and HTML-to-text cleaning.
- Built `src/lib/comment-generator.ts` — uses z-ai chat completions with a system prompt that injects cached X rules + user preferences + request settings (tone/length/angle/emojis/english level/count). Returns structured JSON with comments + Persian reasoning + Persian tweet summary.
- Created API routes:
  - `POST /api/fetch-tweet` — validates + fetches tweet content.
  - `POST /api/generate-comment` — sanitizes options, calls comment-generator.
  - `GET /api/rules` — returns cached rules + preferences.
- Built frontend in Persian (RTL):
  - Updated `layout.tsx` — lang="fa" dir="rtl", Vazirmatn font, next-themes provider.
  - Updated `globals.css` — Vazirmatn as font-sans, `.ltr` utility for English text, custom scrollbar styling.
  - Created `theme-provider.tsx` and `theme-toggle.tsx` (dark mode).
  - Created `comment-card.tsx` — colored angle badge, word count, copy button (with toast), Persian reasoning.
  - Built `page.tsx` — sticky header, hero, input card (link/text tabs), settings card (tone/length/angle/level/count slider/toggles), generate button, results (summary + comment grid), history (localStorage), rules accordion, sticky footer.
- Verified with agent-browser: page renders, text input works, generate produces 5 diverse English comments with Persian reasoning, copy works, history saves, rules accordion shows file content, dark mode works, no console errors, lint passes.

Stage Summary:
- App name: «کامنت‌یار ایکس» (X Comment Companion).
- Architecture: Next.js 16 App Router, all AI calls via backend (z-ai-web-dev-sdk), rules cached in server memory after first file load (473ms first load → 13ms cached).
- Golden path verified end-to-end in browser: paste tweet text → choose settings → generate → 5 relevant English comments with copy buttons + Persian explanations → history auto-saved.
- Link-fetch mode is a bonus; robust text-paste fallback always available since X blocks scraping.
- Files produced: data/x-rules.md, data/user-preferences.md, src/lib/rules-cache.ts, src/lib/tweet-fetcher.ts, src/lib/comment-generator.ts, src/app/api/{fetch-tweet,generate-comment,rules}/route.ts, src/components/{theme-provider,theme-toggle,comment-card}.tsx, src/app/{layout,page}.tsx, globals.css updated.
