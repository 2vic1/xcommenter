import ZAI from 'z-ai-web-dev-sdk';
import { createOpenRouterClient, type OpenRouterClient } from './openrouter-client';

/**
 * AI Client Helper — Multi-Provider
 *
 * Supports two providers:
 * 1. z-ai (default) — glm models, web search, image generation, page reader
 * 2. OpenRouter — ANY model (free or paid), OpenAI-compatible API
 *
 * The user picks a provider in the UI (or via env vars). The rest of the
 * codebase calls getAiInstance() and gets back an object with the same shape
 * (chat.completions.create, images.generations.create, functions.invoke)
 * regardless of provider.
 *
 * Resolution order for provider:
 * 1. Explicit provider passed in code
 * 2. AI_PROVIDER env var ('zai' | 'openrouter')
 * 3. Default: 'zai'
 */

export type AiProvider = 'zai' | 'openrouter';

// A unified type that both ZAI and OpenRouterClient satisfy.
export interface AiInstance {
  chat: {
    completions: {
      create: (body: Record<string, unknown>) => Promise<unknown>;
    };
  };
  images: {
    generations: {
      create: (body: Record<string, unknown>) => Promise<unknown>;
    };
  };
  functions: {
    invoke: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
}

export type ZaiInstance = Awaited<ReturnType<typeof ZAI.create>>;

// The public z-ai API base URL.
const ZAI_PUBLIC_BASE_URL = 'https://api.z.ai/api/paas/v4';

// Default models for the public z-ai API.
const DEFAULT_ZAI_CHAT_MODEL = process.env.ZAI_CHAT_MODEL || 'glm-4.5-flash';
const DEFAULT_ZAI_IMAGE_MODEL = process.env.ZAI_IMAGE_MODEL || 'cogview-3';

// Default OpenRouter model (free, fast, good quality).
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';

// Cache instances per source-key.
const instanceCache = new Map<string, AiInstance>();

interface ZaiConfig {
  baseUrl: string;
  apiKey: string;
  chatId?: string;
  userId?: string;
  token?: string;
}

export interface AiClientOptions {
  provider?: AiProvider;
  apiKey?: string;
  model?: string;
}

/**
 * Resolve the provider from options or env.
 */
function resolveProvider(explicit?: AiProvider): AiProvider {
  if (explicit === 'zai' || explicit === 'openrouter') {
    return explicit;
  }
  const envProvider = process.env.AI_PROVIDER as AiProvider | undefined;
  if (envProvider === 'zai' || envProvider === 'openrouter') {
    return envProvider;
  }
  return 'zai';
}

/**
 * Resolve an API key from the available sources.
 */
function resolveApiKey(provider: AiProvider, explicit?: string): string | undefined {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  if (provider === 'openrouter') {
    const envKey = process.env.OPENROUTER_API_KEY;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  } else {
    const envKey = process.env.ZAI_API_KEY;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  }
  return undefined;
}

/**
 * Resolve a model name for OpenRouter.
 */
function resolveOpenRouterModel(explicit?: string): string {
  if (explicit && explicit.trim().length > 0) return explicit.trim();
  return DEFAULT_OPENROUTER_MODEL;
}

/**
 * Wrap a raw ZAI instance so that every chat.completions.create and
 * images.generations.create call gets a default model (the public z-ai API
 * requires a model field). Only applied for the public API path.
 */
function wrapZaiInstance(raw: ZaiInstance): AiInstance {
  const chatCreate = raw.chat.completions.create.bind(raw.chat.completions);
  const imageCreate = raw.images.generations.create.bind(raw.images.generations);

  (raw.chat.completions as { create: unknown }).create = (body: Record<string, unknown>) => {
    if (!body.model) body.model = DEFAULT_ZAI_CHAT_MODEL;
    return chatCreate(body);
  };
  (raw.images.generations as { create: unknown }).create = (body: Record<string, unknown>) => {
    if (!body.model) body.model = DEFAULT_ZAI_IMAGE_MODEL;
    return imageCreate(body);
  };

  return raw as unknown as AiInstance;
}

/**
 * Get an AI instance for the chosen provider.
 *
 * Provider: zai (default)
 * - With API key: use `new ZAI(config)` + model injection wrapper
 * - Without API key: use `ZAI.create()` (reads /etc/.z-ai-config — sandbox only)
 *
 * Provider: openrouter
 * - Requires API key (from options or OPENROUTER_API_KEY env)
 * - Uses OpenRouterClient which mimics the ZAI interface
 * - Image generation and web research are NOT supported (will throw clear errors)
 */
export async function getAiInstance(options: AiClientOptions = {}): Promise<AiInstance> {
  const provider = resolveProvider(options.provider);
  const apiKey = resolveApiKey(provider, options.apiKey);
  const cacheKey = `${provider}:${apiKey || '__no_key__'}:${options.model || ''}`;

  const cached = instanceCache.get(cacheKey);
  if (cached) return cached;

  let instance: AiInstance;

  if (provider === 'openrouter') {
    if (!apiKey) {
      throw new Error(
        'OpenRouter API key is required. Set OPENROUTER_API_KEY env var or provide a key in the UI.'
      );
    }
    const model = resolveOpenRouterModel(options.model);
    const client = createOpenRouterClient({ apiKey, model });
    instance = client as unknown as AiInstance;
  } else {
    // z-ai provider
    if (apiKey) {
      const config: ZaiConfig = {
        baseUrl: ZAI_PUBLIC_BASE_URL,
        apiKey,
      };
      const raw = new (ZAI as unknown as new (config: ZaiConfig) => ZaiInstance)(config);
      instance = wrapZaiInstance(raw);
    } else {
      // Sandbox path — uses /etc/.z-ai-config automatically.
      const raw = await ZAI.create();
      instance = raw as unknown as AiInstance;
    }
  }

  instanceCache.set(cacheKey, instance);
  return instance;
}

/**
 * Clear the instance cache (useful if the user changes their API key).
 */
export function clearAiCache(): void {
  instanceCache.clear();
}

// Backward-compat alias for existing callers that use getZaiInstance.
export async function getZaiInstance(apiKey?: string): Promise<AiInstance> {
  return getAiInstance({ provider: 'zai', apiKey });
}
