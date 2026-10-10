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

export interface CommentOptions {
  tone: Tone;
  length: CommentLength;
  angle: Angle;
  emojis: boolean;
  includeQuestion: boolean;
  englishLevel: EnglishLevel;
  count: number;
}

export interface CommentSuggestion {
  text: string;
  angleLabel: string; // Persian label for display
  angleKey: string;
  reasoning: string; // Persian explanation of why this works
  wordCount: number;
}

export interface GenerateResult {
  comments: CommentSuggestion[];
  tweetSummary: string; // Persian summary of what the tweet is about
  raw?: string;
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
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
  const zai = await getZAI();

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

function buildSystemPrompt(
  xRules: string,
  userPreferences: string,
  options: CommentOptions
): string {
  return `You are an expert X (Twitter) engagement strategist and native-level English communicator.

Your job: given a tweet's content, suggest ${options.count} high-quality ENGLISH reply comments that maximize genuine engagement while STRICTLY following X's platform rules.

=== X / TWITTER PLATFORM RULES (MUST follow) ===
${xRules}

=== USER PREFERENCES ===
${userPreferences}

=== CURRENT REQUEST SETTINGS ===
- Tone: ${options.tone} (${TONE_LABELS[options.tone]})
- Length: ${options.length} -> ${LENGTH_GUIDE[options.length]}
- Angle focus: ${ANGLE_GUIDE[options.angle]}
- Emojis allowed: ${options.emojis ? 'YES, use 1-2 relevant emojis max' : 'NO emojis'}
- Include a question: ${options.includeQuestion ? 'prefer comments that ask a question' : 'not required'}
- English level: ${ENGLISH_LEVEL_GUIDE[options.englishLevel]}

=== STRICT OUTPUT RULES ===
1. Respond with ONLY a valid JSON object. No markdown fences, no extra text before/after.
2. The JSON must have this exact shape:
{
  "tweetSummary": "یک خلاصه کوتاه فارسی از اینکه توییت درباره چیست",
  "comments": [
    {
      "angleKey": "question|agreement|insight|experience|praise|humor|counterpoint|expansion|resource",
      "text": "the English comment text",
      "reasoning": "توضیح فارسی کوتاه که چرا این کامنت تعامل خوبی می‌گیرد"
    }
  ]
}
3. Produce exactly ${options.count} comments. Make each one DISTINCT in angle and wording.
4. Each comment text must be in ENGLISH, ready to copy-paste, with no quotes around it.
5. NEVER start a comment with "Great", "This is", "Amazing", "Love this", "Wow", or generic praise — these are flagged as low-quality.
6. Comments must be DIRECTLY relevant to the tweet's actual content. Reference specifics.
7. Do NOT include @mentions of the author. Do NOT add hashtags unless highly relevant.
8. If emojis are allowed, use at most 1-2 per comment, placed naturally.
9. Keep comments within the requested length range.
10. The "reasoning" must be in PERSIAN and explain the engagement logic.
11. The "tweetSummary" must be in PERSIAN.

Remember: quality over quantity. Each comment should feel human, genuine, and conversational.`;
}

function buildUserPrompt(tweetContent: string, options: CommentOptions): string {
  return `Here is the tweet I want to reply to:

"""
${tweetContent}
"""

Now generate ${options.count} English comment suggestions following all rules and settings. Remember to return ONLY the JSON object.`;
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
    comments?: Array<{
      angleKey?: string;
      text?: string;
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
    raw,
  };
}
