import { NextRequest, NextResponse } from 'next/server';
import {
  generateViralPosts,
  type ViralOptions,
  type ViralHook,
} from '@/lib/comment-generator';

export const runtime = 'nodejs';
export const maxDuration = 120;

const VALID_TONES = ['friendly', 'professional', 'casual', 'witty', 'expert'];
const VALID_LEVELS = ['simple', 'intermediate', 'advanced'];
const VALID_EMOJI_STYLES = ['variety', 'consistent'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      topic,
      tone = 'friendly',
      emojiCount = 1,
      emojiStyle = 'variety',
      englishLevel = 'simple',
      count = 5,
      apiKey,
      research,
    } = body as {
      topic?: string;
      tone?: string;
      emojiCount?: number;
      emojiStyle?: string;
      englishLevel?: string;
      count?: number;
      apiKey?: string;
      research?: string;
    };

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'موضوع خالی است.' },
        { status: 400 }
      );
    }

    const safeTone = VALID_TONES.includes(tone)
      ? (tone as ViralOptions['tone'])
      : 'friendly';
    const safeLevel = VALID_LEVELS.includes(englishLevel)
      ? (englishLevel as ViralOptions['englishLevel'])
      : 'simple';
    const safeEmojiStyle: 'variety' | 'consistent' = VALID_EMOJI_STYLES.includes(emojiStyle)
      ? (emojiStyle as 'variety' | 'consistent')
      : 'variety';
    const safeEmojiCount = Math.min(Math.max(Number(emojiCount) || 1, 0), 3);
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 8);
    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;
    const safeResearch =
      typeof research === 'string' && research.trim().length > 10 ? research.trim() : undefined;

    const options: ViralOptions = {
      topic: topic.trim(),
      tone: safeTone,
      emojiCount: safeEmojiCount,
      emojiStyle: safeEmojiStyle,
      englishLevel: safeLevel,
      count: safeCount,
      apiKey: safeApiKey,
      research: safeResearch,
    };

    const result = await generateViralPosts(topic.trim(), options);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تولید پست وایرال: ${message}` },
      { status: 500 }
    );
  }
}

// satisfy unused-import linter for ViralHook
export type { ViralHook };
