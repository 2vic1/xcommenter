import ZAI from 'z-ai-web-dev-sdk';

/**
 * Fetch tweet content from an X/Twitter URL using the page_reader function.
 * Returns the extracted text content of the tweet.
 *
 * Note: X/Twitter heavily restricts scraping. This may not always succeed
 * due to login walls / JS rendering. In that case the user can paste the
 * tweet text directly.
 */

export interface TweetContent {
  url: string;
  title: string;
  text: string;
  author?: string;
  fetchedAt: string;
  success: boolean;
  error?: string;
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * Normalize an X/Twitter URL.
 * Accepts x.com and twitter.com URLs, with or without tracking params.
 */
export function normalizeTweetUrl(url: string): string {
  let cleaned = url.trim();
  // Remove query params (tracking)
  cleaned = cleaned.split('?')[0];
  // Normalize twitter.com -> x.com
  cleaned = cleaned.replace('twitter.com', 'x.com');
  // Ensure https
  if (!cleaned.startsWith('http')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

/**
 * Validate that a URL looks like an X/Twitter status URL.
 */
export function isValidTweetUrl(url: string): boolean {
  const pattern = /^https?:\/\/(x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/i;
  return pattern.test(normalizeTweetUrl(url));
}

/**
 * Extract the author handle from a tweet URL.
 */
export function extractAuthor(url: string): string | undefined {
  const match = normalizeTweetUrl(url).match(
    /x\.com\/([A-Za-z0-9_]+)\/status\//i
  );
  return match ? match[1] : undefined;
}

/**
 * Fetch the tweet content using the page_reader function.
 */
export async function fetchTweet(url: string): Promise<TweetContent> {
  const normalized = normalizeTweetUrl(url);
  const author = extractAuthor(normalized);

  try {
    const zai = await getZAI();
    const result = await zai.functions.invoke('page_reader', {
      url: normalized,
    });

    const data = (result as { data?: { title?: string; html?: string; text?: string } }).data;
    const html = data?.html || '';
    const title = data?.title || '';

    // Strip HTML to plain text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    // Clean up the text - remove common navigation noise
    const cleanedText = cleanTweetText(text, title);

    if (!cleanedText || cleanedText.length < 5) {
      return {
        url: normalized,
        title,
        text: '',
        author,
        fetchedAt: new Date().toISOString(),
        success: false,
        error:
          'محتوای توییت به‌صورت خودکار استخراج نشد. لطفاً متن توییت را مستقیماً وارد کنید.',
      };
    }

    return {
      url: normalized,
      title,
      text: cleanedText,
      author,
      fetchedAt: new Date().toISOString(),
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      url: normalized,
      title: '',
      text: '',
      author,
      fetchedAt: new Date().toISOString(),
      success: false,
      error: `خطا در دریافت توییت: ${message}. می‌توانید متن توییت را مستقیماً وارد کنید.`,
    };
  }
}

/**
 * Clean up extracted tweet text by removing common navigation/boilerplate.
 */
function cleanTweetText(rawText: string, title: string): string {
  let text = rawText;

  // Remove common X/Twitter UI strings
  const noisePatterns = [
    /Sign in\s+/gi,
    /Log in\s+/gi,
    /Create account\s+/gi,
    /Home\s+Explore\s+/gi,
    /Notifications\s+/gi,
    /Messages\s+/gi,
    /Bookmark\s+/gi,
    /Profile\s+/gi,
    /More\s+/gi,
    /Reply\s+/gi,
    /Repost\s+/gi,
    /Like\s+/gi,
    /Share\s+/gi,
    /Views\s+/gi,
    /Show more replies\s+/gi,
    /Show more\s+/gi,
    /Follow\s+/gi,
    /Following\s+/gi,
    /Followers\s+/gi,
    /Joined\s+/gi,
  ];

  for (const pattern of noisePatterns) {
    text = text.replace(pattern, ' ');
  }

  text = text.replace(/\s+/g, ' ').trim();

  // If the title contains the tweet, prefer it
  if (title && title.length > 10 && title.length < 500) {
    // Keep title as a hint
  }

  // Truncate very long content (we only need the tweet text)
  if (text.length > 1500) {
    text = text.slice(0, 1500);
  }

  return text;
}
