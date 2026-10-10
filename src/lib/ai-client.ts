import ZAI from 'z-ai-web-dev-sdk';

/**
 * AI Client Helper
 *
 * The z-ai-web-dev-sdk's static `create()` method ALWAYS reads a config file
 * from disk (cwd / home / /etc). It ignores any argument passed to it. This
 * makes it impossible to use on Vercel/serverless where no config file exists.
 *
 * Solution: bypass `create()` and call the ZAI constructor directly with a
 * config object. The constructor does NOT touch the filesystem.
 *
 * Additionally, the public z-ai API requires a `model` field in request bodies.
 * The sandbox's internal API doesn't. So we wrap the instance to inject a
 * default model into every chat/image request when one isn't already provided.
 *
 * Resolution order for the API key:
 * 1. Explicit apiKey passed in code (e.g. user's personal key from the UI)
 * 2. ZAI_API_KEY environment variable (set on Vercel/server)
 * 3. ZAI.create() — reads /etc/.z-ai-config (sandbox only)
 */

export type ZaiInstance = Awaited<ReturnType<typeof ZAI.create>>;

// The public z-ai API base URL (used when a personal API key is provided).
// Verified: https://api.z.ai/api/paas/v4/chat/completions → 401 (auth required)
const ZAI_PUBLIC_BASE_URL = 'https://api.z.ai/api/paas/v4';

// Default models for the public z-ai API.
// Chat: glm-4-flash is free and fast. Users can override per-call.
// Image: cogview-3-plus for image generation.
const DEFAULT_CHAT_MODEL = 'glm-4-flash';
const DEFAULT_IMAGE_MODEL = 'cogview-3-plus';

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
 * Wrap a raw ZAI instance so that every chat.completions.create and
 * images.generations.create call automatically gets a default `model` field
 * if the caller didn't provide one. This is needed for the public z-ai API.
 *
 * In the sandbox, the internal API doesn't require a model, but adding one
 * doesn't hurt (the internal API ignores it).
 */
function wrapInstance(raw: ZaiInstance): ZaiInstance {
  const chatCreate = raw.chat.completions.create.bind(raw.chat.completions);
  const imageCreate = raw.images.generations.create.bind(raw.images.generations);

  (raw.chat.completions as { create: unknown }).create = (body: Record<string, unknown>) => {
    if (!body.model) {
      body.model = DEFAULT_CHAT_MODEL;
    }
    return chatCreate(body);
  };

  (raw.images.generations as { create: unknown }).create = (body: Record<string, unknown>) => {
    if (!body.model) {
      body.model = DEFAULT_IMAGE_MODEL;
    }
    return imageCreate(body);
  };

  return raw;
}

/**
 * Get a ZAI SDK instance.
 *
 * - If an API key is available (explicit or env), construct the instance
 *   directly via `new ZAI(config)` — bypasses config-file loading.
 * - Otherwise, fall back to `ZAI.create()` which reads the config file
 *   (works in the sandbox where /etc/.z-ai-config exists).
 *
 * In both cases, the instance is wrapped so a default model is injected
 * into every chat/image request.
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

  // Wrap so a default model is injected into every API call.
  instance = wrapInstance(instance);

  instanceCache.set(cacheKey, instance);
  return instance;
}

/**
 * Clear the instance cache (useful if the user changes their API key).
 */
export function clearZaiCache(): void {
  instanceCache.clear();
}
