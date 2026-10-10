import ZAI from 'z-ai-web-dev-sdk';

/**
 * AI Client Helper
 *
 * Creates ZAI SDK instances from multiple sources (in priority order):
 * 1. Explicit apiKey passed in code (e.g. user's personal key from the UI)
 * 2. ZAI_API_KEY environment variable (set on Vercel/server)
 * 3. Default ZAI.create() — reads from /etc/.z-ai-config (sandbox only)
 *
 * The ZAI SDK's static `create()` method reads a config file from disk
 * (cwd / home / /etc). On Vercel/serverless where no config file exists,
 * we bypass `create()` and call the ZAI constructor directly with a config
 * object — the constructor does NOT touch the filesystem.
 */

export type ZaiInstance = Awaited<ReturnType<typeof ZAI.create>>;

// The public z-ai API base URL (used when a personal API key is provided).
const ZAI_PUBLIC_BASE_URL = 'https://api.z.ai/api/paas/v4';

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
 *
 * - If an API key is available (explicit or env), construct the instance
 *   directly via `new ZAI(config)` — this bypasses the config-file loading
 *   that `ZAI.create()` does, so it works on Vercel/serverless.
 * - Otherwise, fall back to `ZAI.create()` which reads the config file
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
    // Build the config and use the constructor directly (no filesystem access).
    const config: ZaiConfig = {
      baseUrl: ZAI_PUBLIC_BASE_URL,
      apiKey: resolved,
    };
    instance = new (ZAI as unknown as new (config: ZaiConfig) => ZaiInstance)(config);
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
