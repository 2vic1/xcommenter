import { NextRequest, NextResponse } from 'next/server';
import {
  generateComments,
  type CommentOptions,
  type EmojiStyle,
} from '@/lib/comment-generator';
import { generateImage } from '@/lib/image-generator';

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
const VALID_EMOJI_STYLES = ['variety', 'consistent'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      tweetContent,
      tone = 'friendly',
      length = 'medium',
      angle = 'mixed',
      emojiCount = 1,
      emojiStyle = 'variety',
      includeQuestion = false,
      englishLevel = 'simple',
      count = 5,
      generateImage: shouldGenerateImage = false,
      apiKey,
    } = body as {
      tweetContent?: string;
      tone?: string;
      length?: string;
      angle?: string;
      emojiCount?: number;
      emojiStyle?: string;
      includeQuestion?: boolean;
      englishLevel?: string;
      count?: number;
      generateImage?: boolean;
      apiKey?: string;
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
    const safeEmojiStyle: EmojiStyle = VALID_EMOJI_STYLES.includes(emojiStyle)
      ? (emojiStyle as EmojiStyle)
      : 'variety';
    const safeEmojiCount = Math.min(Math.max(Number(emojiCount) || 1, 0), 3);
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 8);
    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;

    const options: CommentOptions = {
      tone: safeTone,
      length: safeLength,
      angle: safeAngle,
      emojiCount: safeEmojiCount,
      emojiStyle: safeEmojiStyle,
      includeQuestion: Boolean(includeQuestion),
      englishLevel: safeLevel,
      count: safeCount,
      apiKey: safeApiKey,
    };

    const result = await generateComments(tweetContent.trim(), options);

    // Optionally generate an image (only if the LLM returned an imagePrompt)
    let imageDataUrl: string | undefined;
    let imageError: string | undefined;
    if (shouldGenerateImage && result.imagePrompt && result.imagePrompt.trim().length > 3) {
      const img = await generateImage(result.imagePrompt, safeApiKey);
      if (img.success && img.dataUrl) {
        imageDataUrl = img.dataUrl;
      } else {
        imageError = img.error;
      }
    }

    return NextResponse.json({
      success: true,
      comments: result.comments,
      tweetSummary: result.tweetSummary,
      imagePrompt: result.imagePrompt,
      imageDataUrl,
      imageError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تولید کامنت: ${message}` },
      { status: 500 }
    );
  }
}
