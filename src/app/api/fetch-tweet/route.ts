import { NextRequest, NextResponse } from 'next/server';
import { fetchTweet, isValidTweetUrl } from '@/lib/tweet-fetcher';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'آدرس لینک توییت را وارد کنید.' },
        { status: 400 }
      );
    }

    if (!isValidTweetUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'لینک وارد شده معتبر نیست. لینک باید شبیه https://x.com/username/status/... باشد.',
        },
        { status: 400 }
      );
    }

    const result = await fetchTweet(url);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطای سرور: ${message}` },
      { status: 500 }
    );
  }
}
