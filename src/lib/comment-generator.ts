import ZAI from 'z-ai-web-dev-sdk';
import { getRules } from './rules-cache';

/**
 * Comment Generator - uses the LLM to suggest relevant English comments
 * for an X/Twitter post, based on the cached X rules and user preferences.
 */

export type Tone = 'friendly' | 'professional' | 'casual' | 'witty' | 'expert';
export type CommentLength = 'short' | 'medium' | 'long';
export type Angle =
  | 'mixed'
  | 'question'
  | 'agreement'
  | 'insight'
  | 'experience'
  | 'praise'
  | 'humor'
  | 'counterpoint';
export type EnglishLevel = 'simple' | 'intermediate' | 'advanced';
export type EmojiStyle = 'variety' | 'consistent';

export interface CommentOptions {
  tone: Tone;
  length: CommentLength;
  angle: Angle;
  emojiCount: number; // 0-3 emojis per comment
  emojiStyle: EmojiStyle; // 'variety' = different emojis per comment, 'consistent' = same emoji family
  includeQuestion: boolean;
  englishLevel: EnglishLevel;
  count: number;
  apiKey?: string; // optional personal API key
}

export interface CommentSuggestion {
  text: string;
  persianTranslation: string; // Persian translation so the user knows what it means
  angleLabel: string; // Persian label for display
  angleKey: string;
  reasoning: string; // Persian explanation of why this works
  wordCount: number;
}

export interface GenerateResult {
  comments: CommentSuggestion[];
  tweetSummary: string; // Persian summary of what the tweet is about
  imagePrompt?: string; // English prompt to generate a relevant image
  raw?: string;
}

// Cache ZAI instances per API key (default = no key)
const zaiInstances = new Map<string, Awaited<ReturnType<typeof ZAI.create>>>();

async function getZAI(apiKey?: string): Promise<Awaited<ReturnType<typeof ZAI.create>>> {
  const key = apiKey || '__default__';
  if (zaiInstances.has(key)) {
    return zaiInstances.get(key)!;
  }
  let instance: Awaited<ReturnType<typeof ZAI.create>>;
  if (apiKey && apiKey.trim().length > 0) {
    // Try to create with a custom API key.
    // The SDK accepts options via create(); we attempt both shapes for safety.
    try {
      instance = await (ZAI as unknown as { create: (opts?: unknown) => Promise<Awaited<ReturnType<typeof ZAI.create>>> }).create({ apiKey });
    } catch {
      try {
        instance = await (ZAI as unknown as { create: (opts?: unknown) => Promise<Awaited<ReturnType<typeof ZAI.create>>> }).create({ key: apiKey });
      } catch {
        instance = await ZAI.create();
      }
    }
  } else {
    instance = await ZAI.create();
  }
  zaiInstances.set(key, instance);
  return instance;
}

const TONE_LABELS: Record<Tone, string> = {
  friendly: 'صمیمی و دوستانه',
  professional: 'حرفه‌ای و رسمی',
  casual: 'عادی و روزمره',
  witty: 'باهوش و شوخ‌طبع',
  expert: 'متخصص و دانش‌محور',
};

const LENGTH_GUIDE: Record<CommentLength, string> = {
  short: '1-15 words, punchy',
  medium: '15-40 words, balanced',
  long: '40-80 words, insightful',
};

const ANGLE_GUIDE: Record<Angle, string> = {
  mixed:
    'a MIXED variety of angles (curious question, agreement+insight, personal experience, specific praise, light humor, expansion). Provide diverse options.',
  question:
    'curious OPEN-ENDED questions that spark discussion and invite the author to respond',
  agreement:
    'agreement PLUS an added insight or extra point that builds on the tweet',
  insight:
    'a fresh insight, data point, or perspective that adds value to the conversation',
  experience:
    'a short personal anecdote or experience relevant to the tweet topic',
  praise: 'SPECIFIC praise targeting a concrete point in the tweet (not generic)',
  humor: 'light, respectful humor or a witty observation RELATED to the tweet',
  counterpoint:
    'a RESPECTFUL counterpoint offering a different perspective, never aggressive',
};

const ENGLISH_LEVEL_GUIDE: Record<EnglishLevel, string> = {
  simple: 'use simple, everyday English (B1 level). Short common words. Easy to read.',
  intermediate:
    'use natural, conversational English (B2 level). Common idioms OK but not obscure.',
  advanced:
    'use sophisticated English (C1+ level). Rich vocabulary and natural phrasing.',
};

const ANGLE_LABELS_PERSIAN: Record<string, string> = {
  question: 'سوال کنجکاو',
  agreement: 'موافقت + بینش',
  insight: 'نکته ارزشمند',
  experience: 'تجربه شخصی',
  praise: 'تعریف خاص',
  humor: 'طنز ملایم',
  counterpoint: 'دیدگاه متفاوت',
  expansion: 'بسط دادن',
  resource: 'منبع مرتبط',
};

/**
 * Generate English comment suggestions for a tweet.
 */
export async function generateComments(
  tweetContent: string,
  options: CommentOptions
): Promise<GenerateResult> {
  const { xRules, userPreferences } = await getRules();
  const zai = await getZAI(options.apiKey);

  const systemPrompt = buildSystemPrompt(xRules, userPreferences, options);
  const userPrompt = buildUserPrompt(tweetContent, options);

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    thinking: { type: 'disabled' },
  });

  const raw = completion.choices[0]?.message?.content || '';
  const parsed = parseResponse(raw, options.count);

  return parsed;
}

function buildEmojiGuide(options: CommentOptions): string {
  const { emojiCount, emojiStyle } = options;
  if (emojiCount === 0) {
    return 'NO emojis at all. Do not include any emoji in any comment.';
  }
  const styleGuide =
    emojiStyle === 'consistent'
      ? `Use a CONSISTENT emoji family across all comments (e.g. if the topic is growth, use 🌱/📈/🌿 throughout — same vibe, same style). Pick one emoji family and stick with it.`
      : `Use VARIETY — each comment should have a DIFFERENT emoji that fits its specific angle. Do not repeat the same emoji across comments.`;
  return `Use EXACTLY ${emojiCount} emoji${emojiCount > 1 ? 's' : ''} per comment, placed naturally within the text (not all at the end). ${styleGuide} Emojis MUST be: relevant to the tweet topic, positive, polite, and never spammy. Avoid 🚀 unless the tweet is literally about rockets/launches. Prefer contextual emojis like ✨💡👀🙌🤝💪🎯📌🧵🔥📝 when they actually fit.`;
}

function buildSystemPrompt(
  xRules: string,
  userPreferences: string,
  options: CommentOptions
): string {
  return `You are an expert X (Twitter) engagement strategist who writes like a real, native English-speaking human — NOT like an AI.

Your job: given a tweet's content, suggest ${options.count} high-quality ENGLISH reply comments that maximize genuine engagement, follow X's platform rules, and are INDISTINGUISHABLE from comments a real human would write.

=== X / TWITTER PLATFORM RULES & 2024-2025 ALGORITHM (MUST follow) ===
${xRules}

=== USER PREFERENCES ===
${userPreferences}

=== CURRENT REQUEST SETTINGS ===
- Tone: ${options.tone} (${TONE_LABELS[options.tone]})
- Length: ${options.length} -> ${LENGTH_GUIDE[options.length]}
- Angle focus: ${ANGLE_GUIDE[options.angle]}
- Emoji policy: ${buildEmojiGuide(options)}
- Include a question: ${options.includeQuestion ? 'prefer comments that ask a question' : 'not required'}
- English level: ${ENGLISH_LEVEL_GUIDE[options.englishLevel]}

=== ANTI-AI-DETECTION RULES (CRITICAL — X now downranks AI-detected comments) ===
You MUST write like a real human. Violating any of these = failure:

1. BANNED OPENINGS (never start a comment with these — they are AI clichés):
   "This is...", "This is exactly...", "This is such a...", "I appreciate...", "It's worth noting...", "What a great point...", "Love this perspective...", "Spot on!", "Couldn't agree more!", "Great insights!", "As someone who...", "Would love to hear your thoughts!"

2. BANNED PATTERNS:
   - Em-dashes (—) and semicolons (;) used in a "polished" way
   - Numbered or bulleted lists inside a comment
   - Perfect, formal grammar in every sentence
   - "robotically structured" sentences (subject + verb + object, every time)
   - Ending with "Would love to hear your thoughts!" or "Curious what you think!"

3. REQUIRED HUMAN PATTERNS:
   - Use contractions freely: I've, don't, can't, you're, that's, it's
   - Vary sentence length: mix short punchy fragments with longer sentences
   - Occasionally start lowercase (very rare, only when it fits the casual tone)
   - Use natural discourse markers: "Man,", "Honestly,", "Real talk,", "Tbh,", "Ngl,"
   - Allow ONE small human imperfection per comment (a sentence that ends abruptly, a casual "haha", a trailing "...", etc.)
   - Write how a real person tweets — not how an essay is structured
   - Vary opening words across the ${options.count} comments — do not start 2 comments the same way

=== STRICT OUTPUT RULES ===
1. Respond with ONLY a valid JSON object. No markdown fences, no extra text before/after.
2. The JSON must have this exact shape:
{
  "tweetSummary": "یک خلاصه کوتاه فارسی از اینکه توییت درباره چیست",
  "imagePrompt": "an English image-generation prompt describing a relevant, positive, on-topic image that could accompany a reply to this tweet (concrete visual description, style, mood). Keep it under 60 words.",
  "comments": [
    {
      "angleKey": "question|agreement|insight|experience|praise|humor|counterpoint|expansion|resource",
      "text": "the English comment text",
      "persianTranslation": "ترجمه فارسی دقیق و روان همان کامنت، تا کاربر بداند چه می‌گوید",
      "reasoning": "توضیح فارسی کوتاه که چرا این کامنت تعامل خوبی می‌گیرد"
    }
  ]
}
3. Produce exactly ${options.count} comments. Make each one DISTINCT in angle, wording, AND opening.
4. Each comment text must be in ENGLISH, ready to copy-paste, with no quotes around it.
5. Comments must be DIRECTLY relevant to the tweet's actual content. Reference specifics from the tweet.
6. Do NOT include @mentions of the author. Do NOT add hashtags unless highly relevant.
7. Follow the emoji policy above EXACTLY — count the emojis in each comment to make sure they match.
8. Keep comments within the requested length range.
9. The "persianTranslation" MUST be a faithful, natural Persian translation of the English "text" — same meaning, same tone. The user's English is weak and needs to understand exactly what they are posting.
10. The "reasoning" must be in PERSIAN and explain the engagement logic.
11. The "tweetSummary" must be in PERSIAN.
12. The "imagePrompt" must be in ENGLISH, describe a single relevant image (no text overlays), positive mood, suitable as a social media reply image.

Remember: every comment must pass the "real human" test. If a comment looks AI-written, rewrite it.`;
}

function buildUserPrompt(tweetContent: string, options: CommentOptions): string {
  return `Here is the tweet I want to reply to:

"""
${tweetContent}
"""

Now generate ${options.count} English comment suggestions following all rules, the anti-AI-detection guidelines, and the emoji policy. Remember to return ONLY the JSON object.`;
}

function parseResponse(raw: string, expectedCount: number): GenerateResult {
  // Try to extract JSON even if the model wrapped it in code fences
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find the first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsed: {
    tweetSummary?: string;
    imagePrompt?: string;
    comments?: Array<{
      angleKey?: string;
      text?: string;
      persianTranslation?: string;
      reasoning?: string;
    }>;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Last resort: return a fallback so the UI doesn't break
    return {
      comments: [],
      tweetSummary: '',
      imagePrompt: '',
      raw,
    };
  }

  const comments: CommentSuggestion[] = (parsed.comments || [])
    .filter((c) => c.text && c.text.trim().length > 0)
    .slice(0, expectedCount)
    .map((c, idx) => {
      const angleKey = (c.angleKey || 'insight').toLowerCase();
      const text = c.text!.trim();
      return {
        text,
        persianTranslation: (c.persianTranslation || '').trim(),
        angleKey,
        angleLabel:
          ANGLE_LABELS_PERSIAN[angleKey] ||
          ANGLE_LABELS_PERSIAN['insight'] ||
          'پیشنهاد',
        reasoning: c.reasoning || '',
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    });

  return {
    comments,
    tweetSummary: parsed.tweetSummary || '',
    imagePrompt: parsed.imagePrompt || '',
    raw,
  };
}
