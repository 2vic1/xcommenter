import ZAI from 'z-ai-web-dev-sdk';
import { getZaiInstance } from './ai-client';

/**
 * Fetch tweet content from an X/Twitter URL.
 *
 * Strategy (in order, first success wins):
 * 1. Twitter/X Syndication API  — public, no auth, returns clean JSON (used for embedded tweets).
 * 2. fxtwitter API              — public proxy that returns tweet JSON.
 * 3. vxtwitter / fixupx oEmbed  — public proxy fallback.
 * 4. z-ai page_reader           — last resort (often blocked by X login wall).
 *
 * X/Twitter blocks direct scraping (login walls + JS rendering), so we rely on
 * the public syndication endpoints which are how embedded tweets work.
 */

export interface TweetContent {
  url: string;
  title: string;
  text: string;
  author?: string;
  authorName?: string;
  fetchedAt: string;
  success: boolean;
  error?: string;
  method?: string;
}

// Reuse the shared AI client helper (page_reader fallback only — syndication/fxtwitter don't need it).
async function getZAI() {
  return getZaiInstance();
}

/**
 * Normalize an X/Twitter URL.
 * Accepts x.com and twitter.com URLs, with or without tracking params.
 */
export function normalizeTweetUrl(url: string): string {
  let cleaned = url.trim();
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.replace('twitter.com', 'x.com');
  // Remove trailing slash
  cleaned = cleaned.replace(/\/$/, '');
  if (!cleaned.startsWith('http')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export function isValidTweetUrl(url: string): boolean {
  const pattern = /^https?:\/\/(x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/i;
  return pattern.test(normalizeTweetUrl(url));
}

export function extractAuthor(url: string): string | undefined {
  const match = normalizeTweetUrl(url).match(
    /x\.com\/([A-Za-z0-9_]+)\/status\//i
  );
  return match ? match[1] : undefined;
}

/**
 * Extract the numeric tweet ID from a tweet URL.
 */
export function extractTweetId(url: string): string | null {
  const match = normalizeTweetUrl(url).match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

const FETCH_TIMEOUT = 8000;

function timeoutSignal(ms: number): AbortSignal {
  // AbortSignal.timeout is available in Node 18+ and modern browsers.
  try {
    return AbortSignal.timeout(ms);
  } catch {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }
}

/**
 * Method 1: Twitter/X Syndication API.
 * This is the public endpoint used for embedded tweets. Returns clean JSON,
 * no authentication required. Most reliable method.
 */
async function fetchViaSyndication(
  tweetId: string
): Promise<TweetContent | null> {
  try {
    const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`;
    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
      signal: timeoutSignal(FETCH_TIMEOUT),
      redirect: 'follow',
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      text?: string;
      user?: { screen_name?: string; name?: string };
      quoted_tweet?: { text?: string; user?: { screen_name?: string } };
      in_reply_to_screen_name?: string;
      lang?: string;
    };

    let text = (data.text || '').trim();
    const screenName = data.user?.screen_name;
    const userName = data.user?.name;

    if (!text) return null;

    // Append quoted tweet text if present (gives the AI more context)
    if (data.quoted_tweet?.text) {
      text += `\n\n[Quoted tweet by @${data.quoted_tweet.user?.screen_name || 'unknown'}]: ${data.quoted_tweet.text}`;
    }

    return {
      url: `https://x.com/${screenName || 'i'}/status/${tweetId}`,
      title: text.slice(0, 120),
      text,
      author: screenName,
      authorName: userName,
      fetchedAt: new Date().toISOString(),
      success: true,
      method: 'syndication',
    };
  } catch {
    return null;
  }
}

/**
 * Method 2: fxtwitter API (public proxy that returns tweet JSON).
 */
async function fetchViaFxtwitter(
  tweetId: string
): Promise<TweetContent | null> {
  try {
    const endpoint = `https://api.fxtwitter.com/status/${tweetId}`;
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: timeoutSignal(FETCH_TIMEOUT),
      redirect: 'follow',
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      tweet?: {
        text?: string;
        author?: { screen_name?: string; name?: string };
        quote?: { text?: string; author?: { screen_name?: string } };
      };
    };

    const tweet = data.tweet;
    if (!tweet) return null;
    let text = (tweet.text || '').trim();
    const screenName = tweet.author?.screen_name;
    const userName = tweet.author?.name;
    if (!text) return null;

    if (tweet.quote?.text) {
      text += `\n\n[Quoted tweet by @${tweet.quote.author?.screen_name || 'unknown'}]: ${tweet.quote.text}`;
    }

    return {
      url: `https://x.com/${screenName || 'i'}/status/${tweetId}`,
      title: text.slice(0, 120),
      text,
      author: screenName,
      authorName: userName,
      fetchedAt: new Date().toISOString(),
      success: true,
      method: 'fxtwitter',
    };
  } catch {
    return null;
  }
}

/**
 * Method 3 (last resort): z-ai page_reader.
 * Often fails on X due to login walls, but kept as a fallback for non-X URLs
 * or edge cases.
 */
async function fetchViaPageReader(url: string): Promise<TweetContent | null> {
  try {
    const zai = await getZAI();
    const result = await zai.functions.invoke('page_reader', { url });
    const data = (
      result as { data?: { title?: string; html?: string; text?: string } }
    ).data;
    const html = data?.html || '';
    const title = data?.title || '';
    if (!html && !title) return null;

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

    const cleaned = cleanTweetText(text, title);
    if (!cleaned || cleaned.length < 5) return null;

    return {
      url,
      title,
      text: cleaned,
      author: extractAuthor(url),
      fetchedAt: new Date().toISOString(),
      success: true,
      method: 'page_reader',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch the tweet content. Tries multiple methods until one succeeds.
 */
export async function fetchTweet(url: string): Promise<TweetContent> {
  const normalized = normalizeTweetUrl(url);
  const author = extractAuthor(normalized);
  const tweetId = extractTweetId(normalized);

  // Try the reliable JSON-based methods first
  if (tweetId) {
    const syndication = await fetchViaSyndication(tweetId);
    if (syndication) return syndication;

    const fxtwitter = await fetchViaFxtwitter(tweetId);
    if (fxtwitter) return fxtwitter;
  }

  // Last resort: page_reader
  const pageReader = await fetchViaPageReader(normalized);
  if (pageReader) return pageReader;

  // All methods failed
  return {
    url: normalized,
    title: '',
    text: '',
    author,
    fetchedAt: new Date().toISOString(),
    success: false,
    error:
      'محتوای توییت به‌صورت خودکار استخراج نشد (ایکس دسترسی ربات‌ها را محدود می‌کند). لطفاً متن توییت را مستقیماً کپی و در تب «متن توییت» وارد کنید.',
  };
}

function cleanTweetText(rawText: string, title: string): string {
  let text = rawText;
  const noisePatterns = [
    /Sign in\s+/gi,
    /Log in\s+/gi,
    /Create account\s+/gi,
    /Home\s+Explore\s+/gi,
    /Notifications\s+/gi,
    /Messages\s+/gi,
    /Bookmark\s+/gi,
    /Profile\s+/gi,
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
  if (text.length > 1500) text = text.slice(0, 1500);
  return text;
}
