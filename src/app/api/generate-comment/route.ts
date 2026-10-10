import { NextRequest, NextResponse } from 'next/server';
import {
  generateComments,
  type CommentOptions,
} from '@/lib/comment-generator';

export const runtime = 'nodejs';

const VALID_TONES = ['friendly', 'professional', 'casual', 'witty', 'expert'];
const VALID_LENGTHS = ['short', 'medium', 'long'];
const VALID_ANGLES = [
  'mixed',
  'question',
  'agreement',
  'insight',
  'experience',
  'praise',
  'humor',
  'counterpoint',
];
const VALID_LEVELS = ['simple', 'intermediate', 'advanced'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      tweetContent,
      tone = 'friendly',
      length = 'medium',
      angle = 'mixed',
      emojis = true,
      includeQuestion = false,
      englishLevel = 'simple',
      count = 5,
    } = body as {
      tweetContent?: string;
      tone?: string;
      length?: string;
      angle?: string;
      emojis?: boolean;
      includeQuestion?: boolean;
      englishLevel?: string;
      count?: number;
    };

    if (!tweetContent || typeof tweetContent !== 'string' || tweetContent.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'متن توییت خالی است.' },
        { status: 400 }
      );
    }

    // Validate & sanitize options
    const safeTone = VALID_TONES.includes(tone) ? (tone as CommentOptions['tone']) : 'friendly';
    const safeLength = VALID_LENGTHS.includes(length)
      ? (length as CommentOptions['length'])
      : 'medium';
    const safeAngle = VALID_ANGLES.includes(angle)
      ? (angle as CommentOptions['angle'])
      : 'mixed';
    const safeLevel = VALID_LEVELS.includes(englishLevel)
      ? (englishLevel as CommentOptions['englishLevel'])
      : 'simple';
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 8);

    const options: CommentOptions = {
      tone: safeTone,
      length: safeLength,
      angle: safeAngle,
      emojis: Boolean(emojis),
      includeQuestion: Boolean(includeQuestion),
      englishLevel: safeLevel,
      count: safeCount,
    };

    const result = await generateComments(tweetContent.trim(), options);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تولید کامنت: ${message}` },
      { status: 500 }
    );
  }
}
