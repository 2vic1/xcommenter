import { NextRequest, NextResponse } from 'next/server';
import { researchTopic } from '@/lib/web-researcher';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/research
 * { topic: string, apiKey?: string, provider?: string, model?: string }
 * → { success, summary, sources, query }
 *
 * Searches the web for the topic and returns a concise factual briefing
 * that the frontend can pass back into generate-comment or generate-viral.
 *
 * NOTE: Web research is only supported with the z-ai provider.
 * If the user picked OpenRouter, this endpoint returns a clear error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, apiKey, provider, model } = body as {
      topic?: string;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'موضوع خیلی کوتاه است.' },
        { status: 400 }
      );
    }

    if (provider === 'openrouter') {
      return NextResponse.json(
        {
          success: false,
          error:
            'تحقیق وب فقط با کلید z-ai کار می‌کند. لطفاً z-ai را انتخاب کنید یا تیک تحقیق را خاموش کنید.',
        },
        { status: 400 }
      );
    }

    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;
    const safeModel =
      typeof model === 'string' && model.trim().length > 0 ? model.trim() : undefined;

    const result = await researchTopic(
      topic.trim(),
      { apiKey: safeApiKey, provider: 'zai', model: safeModel }
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تحقیق: ${message}` },
      { status: 500 }
    );
  }
}
