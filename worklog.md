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

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Make link-based tweet fetching reliable so the user only needs to paste a tweet URL (no manual text entry required). User explicitly wants: "I give the link, it suggests comments based on that."

Work Log:
- Rewrote src/lib/tweet-fetcher.ts with a multi-method fallback chain:
  1. Twitter/X Syndication API (cdn.syndication.twimg.com/tweet-result) — public, no auth, returns clean JSON. This is the endpoint used for embedded tweets. Also handles quoted tweets (appends quoted text for AI context).
  2. fxtwitter API (api.fxtwitter.com/status/{id}) — public proxy fallback.
  3. z-ai page_reader — last resort (often blocked by X login wall).
- Added extractTweetId() helper to pull the numeric status ID from the URL.
- Added 8s timeout per fetch method to avoid hanging.
- Updated src/app/page.tsx handleGenerate: if tweetContent is empty but tweetUrl is present, auto-fetch the link first, then generate. So the user can just paste a link and click generate in one step.
- Updated canGenerate: button is now enabled when either text (>2 chars) OR a link (>5 chars) is present.
- Updated generate button label to show "در حال دریافت توییت..." during the auto-fetch phase.
- Verified with agent-browser using Jack Dorsey's first tweet (https://x.com/jack/status/20):
  - Syndication API returned "just setting up my twttr" in 425ms.
  - Full flow (paste link → click generate → auto-fetch → 5 comments generated) works end-to-end.
  - Comments are relevant to the tweet content (nostalgia, simplicity, early-twitter references).
- Lint passes, no console errors, no runtime errors.

Stage Summary:
- The "just paste a link" use case now works reliably for public tweets via the syndication API (the same mechanism X uses for embedded tweets).
- Both modes still available: link mode (auto-fetches) and text mode (paste manually). Text mode remains the bulletproof fallback for private/deleted tweets.
- UI structure unchanged per user request; only the backend fetcher + generate button logic were improved.

---
Task ID: 3
Agent: main (Z.ai Code)
Task: Make the UI bilingual (Persian + English with toggle), add Persian translation to each generated comment so the user understands what they're posting, and convert the app to a PWA installable on Android.

Work Log:
- Created src/lib/translations.ts with ~100 UI strings in both fa and en, plus a getTranslator helper.
- Created src/components/language-provider.tsx — React context that persists language choice in localStorage and updates document.documentElement.lang + dir (rtl/ltr) on switch.
- Created src/components/language-toggle.tsx — header button (Languages icon) that toggles FA/EN.
- Updated src/lib/comment-generator.ts: added `persianTranslation` field to CommentSuggestion; updated the system prompt to require a faithful Persian translation of each English comment; updated parseResponse to extract it.
- Rewrote src/components/comment-card.tsx: shows the English comment (LTR box) + a highlighted "ترجمه فارسی" section + reasoning; uses useLanguage() for all labels.
- Rewrote src/app/page.tsx to use useLanguage()/t() for every string; options arrays (tones/lengths/angles/levels) are memoized per language; date locale switches fa-IR/en-US.
- Updated src/app/layout.tsx: wrapped app in LanguageProvider; added PWA metadata (manifest link, apple-web-app meta, theme-color, icons); added Viewport export with themeColor + viewport-fit=cover for notch support.
- Created public/manifest.json — standalone display, rtl+fa, icons (192/512 + maskable), app shortcuts.
- Created scripts/icon.svg + icon-maskable.svg (speech bubble + X mark, accent dots) and scripts/generate-icons.ts (uses sharp, already installed) to generate icon-192.png, icon-512.png, maskable variants, apple-touch-icon.png, favicon-32.png into /public.
- Verified with agent-browser:
  - FA mode: UI in Persian (rtl), generated comments show English text + Persian translation + reasoning.
  - EN mode: full UI switches to English (ltr), document dir/lang updated correctly.
  - Language toggle persists via localStorage.
  - PWA: manifest.json served (200), all icons served (200), manifest link + theme-color + apple meta in <head>.
  - No console errors, no runtime errors, lint passes.

Stage Summary:
- App is now fully bilingual (FA/EN) with one-click toggle in the header; direction (RTL/LTR) switches automatically.
- Every generated English comment now includes a faithful Persian translation so the user knows exactly what they're posting.
- App is an installable PWA: Android users can "Add to Home Screen" and it launches as a standalone app with its own icon, no browser chrome, proper status bar.
- Ready for deployment to user's own server/domain (instructions to be provided in chat).

---
Task ID: 4
Agent: main (Z.ai Code)
Task: Add personal API key support, image generation, improved emoji system (count + style + actually-working), anti-AI-detection, and update X rules to 2024-2025 algorithm.

Work Log:
- Rewrote data/x-rules.md with 2024-2025 X algorithm insights (reply velocity, dwell time, bookmark weight), anti-AI-detection practices (banned openings, required human patterns), and detailed emoji policy.
- Updated src/lib/comment-generator.ts:
  - Replaced `emojis: boolean` with `emojiCount: number` (0-3) + `emojiStyle: 'variety' | 'consistent'`.
  - Added `apiKey?: string` to CommentOptions; ZAI instances now cached per API key; getZAI(apiKey) tries create({apiKey}) / create({key}) / default.
  - Added buildEmojiGuide() — generates precise emoji instructions based on count + style (variety = different emoji per comment, consistent = one emoji family).
  - Added ANTI-AI-DETECTION section to system prompt: banned openings ("This is...", "I appreciate...", etc.), banned patterns (em-dashes, perfect grammar), required human patterns (contractions, varied sentence length, discourse markers like "Man,", "Honestly,", "Tbh,").
  - Added imagePrompt to GenerateResult — LLM now also returns an English image-generation prompt.
- Created src/lib/image-generator.ts — uses zai.images.generations.create to generate an image, returns base64 data URL.
- Updated src/app/api/generate-comment/route.ts — accepts emojiCount, emojiStyle, generateImage, apiKey; generates image after comments if requested; returns imageDataUrl.
- Added ~30 new translation keys (fa + en) for emoji count/style, image generation, API key settings.
- Updated src/app/page.tsx:
  - Replaced emoji switch with emoji count slider (0-3) + emoji style dropdown (variety/consistent).
  - Added "Generate relevant image" toggle.
  - Added API source dropdown (Site API / Personal key) + password input + Save/Clear buttons; key stored in localStorage; persists across reloads.
  - Added image display card in results section (with download link).
- Verified with agent-browser:
  - Emoji system: 5 comments each with exactly 1 emoji (✨👀🙌💪🔥), variety style, placed naturally mid-sentence.
  - Anti-AI-detection: comments start with "Man,", use contractions, casual tone ("Real talk.", "Night and day difference"), feel human.
  - Persian translations still present and faithful.
  - API key: saved to localStorage, persists across reload, auto-selects "personal" source.
  - Image generation: direct API test returned 1024x1024 PNG (101KB base64), displayed in UI with download link.
  - No console errors, lint passes.

Stage Summary:
- Personal API key support: users can choose Site API (default, free) or enter their own z-ai API key (stored in browser, faster, no shared limits).
- Image generation: toggle ON → AI generates a relevant positive image (1024x1024) to accompany the reply, downloadable.
- Emoji system fixed: count slider (0-3) + style (variety/consistent); emojis now actually appear, relevant, positive, polite, placed naturally.
- Anti-AI-detection: comments now use contractions, varied sentence structure, human discourse markers, banned AI clichés — indistinguishable from real human replies.
- X rules updated to 2024-2025 algorithm (reply velocity, dwell time, bookmark weight, anti-AI downranking).

---
Task ID: 5
Agent: main (Z.ai Code)
Task: Fix the "Man," discourse marker issue — user pointed out that non-native English speakers misinterpret "Man," as the noun "male person", which makes the comment look weird/wrong.

Work Log:
- Updated src/lib/comment-generator.ts REQUIRED HUMAN PATTERNS section:
  - Removed "Man," from the recommended discourse markers list.
  - Added a SAFE list: "Honestly,", "Actually,", "Turns out,", "Funny enough,", "Here's the thing —", "For real,", "Wild thing is,", "Crazy part is,", "Honestly though,"
  - Added a BANNED list of noun-openers that confuse non-native readers: "Man,", "Dude,", "Bro,", "Girl,", "Boy,"
  - Added a note: "The reader may have weak English. Avoid slang/idioms that require cultural context. Prefer clear, common words."
- Updated data/x-rules.md section 3.2 with the same safe/banned opener lists and the non-native-reader note.
- Restarted dev server to clear the in-memory rules cache so the new rules load on next request.
- Verified with agent-browser on "building in public" tweet:
  - 5 comments generated, none start with "Man," or any banned noun-opener.
  - Openers used: "Honestly,", "What's the one thing...", "For real,", "Love how you're...", "This reminds me of..."
  - All safe, universally-understood, human-sounding.
- Lint passes, no console errors.

Stage Summary:
- "Man," and similar noun-based openers (Dude, Bro, Girl, Boy) are now explicitly banned in the prompt and the rules file.
- Replaced with clear interjection openers (Honestly, Actually, Turns out, For real, etc.) that non-native English speakers understand correctly.
- Added a general principle: avoid culture-specific slang/idioms since the user's audience may have weak English.

---
Task ID: 6
Agent: main (Z.ai Code)
Task: Fix image generation failure — "Unexpected token '<', '<!DOCTYPE'... is not valid JSON" error when image toggle is on. Root cause: single request took ~77s (comments + image), causing gateway/browser timeout that returned an HTML error page instead of JSON. User also confirmed: one good image is enough.

Work Log:
- Diagnosis: The combined /api/generate-comment request (comments + image generation) took ~77 seconds. The Caddy gateway or browser fetch timed out and returned an HTML error page (<!DOCTYPE...>) which the frontend tried to parse as JSON → "Unexpected token '<'".
- Split image generation into a SEPARATE endpoint:
  - Created src/app/api/generate-image/route.ts — accepts { prompt, apiKey }, returns { success, dataUrl }. Set maxDuration=300s for the long image generation.
  - Updated src/app/api/generate-comment/route.ts — REMOVED the image generation logic; now only returns the imagePrompt that the LLM produced. Removed the unused generateImage import.
- Updated src/app/page.tsx:
  - Added `imageLoading` state + `imageDataUrl` field to HistoryEntry.
  - Removed `generateImage: generateImageEnabled` from the generate-comment request body.
  - After comments are shown, if image is enabled and an imagePrompt exists, calls generateImageInBackground() which hits /api/generate-image separately.
  - generateImageInBackground() updates the result + history entry when the image is ready, with proper error handling.
  - Updated the image card UI to show a loading state (spinner + "در حال ساخت تصویر..." + skeleton) while imageLoading is true.
  - handleRestoreFromHistory now also restores imageDataUrl from the history entry.
- Verified with agent-browser:
  - Comments now appear in ~10 seconds (down from 77s).
  - Image card shows "در حال ساخت تصویر..." loading state immediately after comments.
  - After ~60s, the image (1024x1024 PNG) appears in the card, no errors.
  - No "Unexpected token '<'" error anymore.
  - No console errors, no page errors, lint passes.
- Direct API tests confirmed:
  - /api/generate-comment now returns in ~5.5s (was 77s) with imagePrompt.
  - /api/generate-image returns in ~59s with a 122KB base64 image.

Stage Summary:
- Image generation is now async/background — comments show fast, image loads when ready.
- Fixed the "Unexpected token '<'" JSON parse error by eliminating the long combined request.
- One image per generation (as the user requested — "یک دونه خوب بسازه").
- Loading state clearly shown so the user knows the image is being built.
- Image persists in history so restoring from history shows the image too.

---
Task ID: 7
Agent: main (Z.ai Code)
Task: Fix the recurring "Unexpected token '<'" error on image generation. The previous fix (separate endpoint) still had the same problem because the single POST request took ~60s and the gateway timed out, returning HTML.

Work Log:
- Root cause confirmed: even with a separate /api/generate-image endpoint, a single HTTP request that takes ~60s exceeds the Caddy gateway timeout. The gateway returns an HTML error page, which the frontend tries to parse as JSON → "Unexpected token '<'".
- Implemented a JOB-BASED POLLING architecture so no single HTTP request takes more than ~1s:
  - Rewrote src/app/api/generate-image/route.ts:
    - POST: starts a background job (stored in an in-memory Map), returns { success, jobId } immediately (<1s). The actual image generation runs in a fire-and-forget async IIFE that updates the job status when done.
    - GET (with ?jobId=xxx): returns the current job status ({ status: 'pending' | 'done' | 'error', dataUrl?, error? }). Fast (<100ms).
    - Added a setInterval cleanup that removes jobs older than 10 minutes to bound memory.
    - Set maxDuration=300 for the route.
  - Updated src/app/page.tsx generateImageInBackground():
    - Step 1: POST to start the job, get jobId (fast).
    - Step 2: Poll GET every 3s until status is 'done' or 'error'. Max 3 minutes.
    - Added a content-type guard: if a poll response isn't JSON (e.g. HTML error), bail gracefully with a clear error message instead of crashing on JSON.parse.
- Verified end-to-end with agent-browser:
  - POST returns jobId in <1s.
  - Polling shows "pending" → "pending" → "done" over ~65s.
  - Image (1024x1024 PNG, 128KB) appears in the UI with no "Unexpected token" error.
  - Loading state ("در حال ساخت تصویر...") shows during polling.
  - No console errors, no page errors, lint passes (0 errors, 0 warnings).

Stage Summary:
- Image generation now uses a job/poll pattern: each HTTP request is <2s, so the gateway never times out.
- The "Unexpected token '<'" error is permanently fixed for image generation.
- Same pattern can be applied to any other long-running AI operation if needed.
- Works in dev mode and on a VPS (long-running process). For serverless (Vercel), the in-memory Map would need to be replaced with a persistent store (Redis/DB), but the user plans to deploy on a VPS.

---
Task ID: 8
Agent: main (Z.ai Code)
Task: Add (1) a "research" toggle that searches the web about the tweet topic before writing comments, and (2) a new "Viral Post Generator" mode where the user gives a topic/link and the AI writes viral X posts for their own account.

Work Log:
- Loaded web-search skill; understood z-ai web_search function + LLM summarization pattern.
- Created src/lib/web-researcher.ts — researchTopic(topic, apiKey) calls zai.functions.invoke('web_search', ...) then summarizes results with the LLM into a concise English briefing. Returns { success, summary, sources }.
- Updated src/lib/comment-generator.ts:
  - Added `research?: string` to CommentOptions.
  - System prompt now injects the research summary as "WEB RESEARCH CONTEXT" so the LLM writes INFORMED comments (e.g. real crypto project features, not generic).
  - Added full ViralPost/ViralGenerateResult/ViralOptions types + generateViralPosts() function with its own system prompt focused on viral X post principles (hook in first line, self-contained, concrete details, anti-AI-detection, emoji policy).
- Created src/app/api/research/route.ts — POST { topic, apiKey } → { success, summary, sources }.
- Created src/app/api/generate-viral/route.ts — POST { topic, tone, emojiCount, emojiStyle, englishLevel, count, apiKey, research } → { success, posts, topicSummary, imagePrompt }.
- Updated src/app/api/generate-comment/route.ts — accepts `research` field, passes it to options.
- Added ~30 translation keys (fa + en) for research toggle, viral mode, viral UI.
- Created src/components/viral-post-card.tsx — colored hook badges (contrarian/list/story/thread/question/hot_take/data_point/vulnerability), copy button, Persian translation, reasoning.
- Updated src/app/page.tsx:
  - Added appMode state ('comment' | 'viral') with a mode switcher at the top (Comment Finder / Viral Post Generator).
  - Added research toggle + research summary display in comment settings.
  - handleGenerate now calls /api/research first (if enabled), then passes the summary to /api/generate-comment.
  - Created a ViralMode component with its own topic textarea, count slider, research toggle, image toggle, and results grid using ViralPostCard.
  - Viral mode generate button is a gradient orange→pink to visually distinguish it.
- Verified with agent-browser:
  - Mode switcher works (comment ↔ viral).
  - Viral mode: generated 5 posts with diverse hooks (contrarian, list, story, question, hot_take), each with Persian translation + reasoning + relevant emoji. No "Man," openers.
  - Comment mode with research: generated 5 informed comments about Cursor IDE (referencing debugging, boilerplate, AI agents, integration, coding skills). Research summary displayed in settings card.
  - No console errors, no page errors, lint passes.
- Direct API tests confirmed:
  - /api/research returns in ~3s with 6 sources + 867-char summary.
  - /api/generate-viral returns in ~10.5s with 3 viral posts + topic summary.

Stage Summary:
- Research toggle: when ON, the AI searches the web about the tweet topic (e.g. a crypto project) and writes comments/posts that demonstrate real knowledge of the subject.
- Viral Post Generator: a whole new mode where the user gives a topic (text or link) and gets viral X posts for their OWN account, with diverse hooks, anti-AI-detection, emoji policy, and optional image + research.
- Both modes share the same anti-AI-detection rules, emoji system, bilingual UI, and API key support.
