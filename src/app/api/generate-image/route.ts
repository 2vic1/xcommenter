import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/image-generator';

export const runtime = 'nodejs';
// Allow up to 5 minutes for image generation (it can be slow)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, apiKey } = body as { prompt?: string; apiKey?: string };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Prompt too short.' },
        { status: 400 }
      );
    }

    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;

    const result = await generateImage(prompt, safeApiKey);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Image generation failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dataUrl: result.dataUrl,
      prompt: result.prompt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در تولید تصویر: ${message}` },
      { status: 500 }
    );
  }
}
