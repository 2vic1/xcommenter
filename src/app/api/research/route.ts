import { NextRequest, NextResponse } from 'next/server';
import { researchTopic } from '@/lib/web-researcher';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/research
 * { topic: string, apiKey?: string }
 * → { success, summary, sources, query }
 *
 * Searches the web for the topic and returns a concise factual briefing
 * that the frontend can pass back into generate-comment or generate-viral.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, apiKey } = body as { topic?: string; apiKey?: string };

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'موضوع خیلی کوتاه است.' },
        { status: 400 }
      );
    }

    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;

    const result = await researchTopic(topic.trim(), safeApiKey);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تحقیق: ${message}` },
      { status: 500 }
    );
  }
}
