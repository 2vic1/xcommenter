import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/image-generator';

export const runtime = 'nodejs';
// Allow long-running background jobs
export const maxDuration = 300;

/**
 * Image generation can take ~60s, which exceeds the gateway/browser timeout
 * and causes HTML error pages to be returned instead of JSON.
 *
 * Solution: job-based polling.
 *  - POST /api/generate-image  → starts a background job, returns { jobId } immediately
 *  - GET  /api/generate-image?jobId=xxx  → returns the current job status
 *
 * The frontend polls GET every 3s until status is 'done' or 'error'.
 * Each HTTP request is < 2s, so no gateway timeout.
 */

interface ImageJob {
  id: string;
  status: 'pending' | 'done' | 'error';
  dataUrl?: string;
  error?: string;
  prompt: string;
  createdAt: number;
}

// In-memory job store. Works for dev server + VPS (long-running process).
// Not suitable for serverless (each invocation is a separate process).
const jobs = new Map<string, ImageJob>();

// Cleanup old jobs every 2 minutes (keep memory bounded)
const JOB_TTL_MS = 10 * 60 * 1000; // 10 minutes
if (!(globalThis as { __imageJobCleanupStarted?: boolean }).__imageJobCleanupStarted) {
  (globalThis as { __imageJobCleanupStarted?: boolean }).__imageJobCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
      if (now - job.createdAt > JOB_TTL_MS) {
        jobs.delete(id);
      }
    }
  }, 2 * 60 * 1000).unref?.();
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Start an image generation job in the background.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, apiKey, provider, model } = body as {
      prompt?: string;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Prompt too short.' },
        { status: 400 }
      );
    }

    if (provider === 'openrouter') {
      return NextResponse.json(
        {
          success: false,
          error:
            'تولید تصویر فقط با کلید z-ai کار می‌کند. لطفاً z-ai را انتخاب کنید یا تیک تصویر را خاموش کنید.',
        },
        { status: 400 }
      );
    }

    const safeApiKey =
      typeof apiKey === 'string' && apiKey.trim().length > 0 ? apiKey.trim() : undefined;
    const safeModel =
      typeof model === 'string' && model.trim().length > 0 ? model.trim() : undefined;

    const jobId = genId();
    const job: ImageJob = {
      id: jobId,
      status: 'pending',
      prompt: prompt.trim(),
      createdAt: Date.now(),
    };
    jobs.set(jobId, job);

    // Run the actual image generation in the background (do NOT await).
    // The process stays alive in dev mode / VPS, so this works.
    (async () => {
      try {
        const result = await generateImage(prompt.trim(), { apiKey: safeApiKey, provider: 'zai', model: safeModel });
        const current = jobs.get(jobId);
        if (!current) return; // job was cleaned up
        if (result.success && result.dataUrl) {
          jobs.set(jobId, { ...current, status: 'done', dataUrl: result.dataUrl });
        } else {
          jobs.set(jobId, { ...current, status: 'error', error: result.error || 'Image generation failed.' });
        }
      } catch (err) {
        const current = jobs.get(jobId);
        if (!current) return;
        const msg = err instanceof Error ? err.message : String(err);
        jobs.set(jobId, { ...current, status: 'error', error: msg });
      }
    })();

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در شروع تولید تصویر: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * Poll the status of an image generation job.
 * GET /api/generate-image?jobId=xxx
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'jobId parameter is required.' },
      { status: 400 }
    );
  }

  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { success: false, error: 'Job not found or expired.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    jobId: job.id,
    status: job.status,
    dataUrl: job.dataUrl,
    error: job.error,
  });
}
