import { NextResponse } from 'next/server';
import { getRules } from '@/lib/rules-cache';

export const runtime = 'nodejs';

/**
 * GET /api/rules
 * Returns the cached X/Twitter rules and user preferences.
 * Loads from disk on first call, then serves from memory.
 */
export async function GET() {
  try {
    const rules = await getRules();
    return NextResponse.json({
      success: true,
      xRules: rules.xRules,
      userPreferences: rules.userPreferences,
      loadedAt: rules.loadedAt,
      cached: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `خطا در بارگذاری قوانین: ${message}` },
      { status: 500 }
    );
  }
}
