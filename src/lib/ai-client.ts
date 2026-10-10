import ZAI from 'z-ai-web-dev-sdk';

/**
 * AI Client Helper
 *
 * Creates ZAI SDK instances from multiple sources (in priority order):
 * 1. Explicit apiKey passed in code (e.g. user's personal key from the UI)
 * 2. ZAI_API_KEY environment variable (set on Vercel/server)
 * 3. Default ZAI.create() — reads from /etc/.z-ai-config (sandbox only)
 *
 * This is what makes the app work both in the sandbox AND on a real
 * deployment (Vercel, VPS, etc.) without code changes.
 *
 * The ZAI SDK's create() accepts a config object shaped like:
 *   { baseUrl: string, apiKey: string, chatId?, userId?, token? }
 * On z-ai the public API base URL is https://api.z.ai/v1
 */

export type ZaiInstance = Awaited<ReturnType<typeof ZAI.create>>;

// The public z-ai API base URL (used when a personal API key is provided).
const ZAI_PUBLIC_BASE_URL = 'https://api.z.ai/v1';

// Cache instances per source-key so we don't re-create on every request.
const instanceCache = new Map<string, ZaiInstance>();

interface ZaiConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

/**
 * Resolve an API key from the available sources.
 * Priority: explicit > ZAI_API_KEY env > undefined (let SDK use config file).
 */
function resolveApiKey(explicit?: string): string | undefined {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  const envKey = process.env.ZAI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return undefined;
}

/**
 * Get a ZAI SDK instance.
 * - If an API key is available (explicit or env), create the instance with it
 *   using the public z-ai API base URL.
 * - Otherwise, fall back to the default ZAI.create() which reads the config file
 *   (works in the sandbox where /etc/.z-ai-config exists).
 */
export async function getZaiInstance(explicitApiKey?: string): Promise<ZaiInstance> {
  const resolved = resolveApiKey(explicitApiKey);
  const cacheKey = resolved || '__default_config__';

  const cached = instanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let instance: ZaiInstance;

  if (resolved) {
    // Build a config object with the public base URL + the user's API key.
    const config: ZaiConfig = {
      baseUrl: ZAI_PUBLIC_BASE_URL,
      apiKey: resolved,
    };
    try {
      instance = await (ZAI as unknown as {
        create: (opts: ZaiConfig) => Promise<ZaiInstance>;
      }).create(config);
    } catch {
      // If the SDK rejects the explicit config, fall back to default.
      // This will likely fail on Vercel (no config file), but at least we tried.
      instance = await ZAI.create();
    }
  } else {
    // Sandbox path — uses /etc/.z-ai-config automatically.
    instance = await ZAI.create();
  }

  instanceCache.set(cacheKey, instance);
  return instance;
}

/**
 * Clear the instance cache (useful if the user changes their API key).
 */
export function clearZaiCache(): void {
  instanceCache.clear();
}
