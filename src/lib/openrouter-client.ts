/**
 * OpenRouter Client
 *
 * OpenRouter is an OpenAI-compatible API that provides access to many models
 * (free and paid) from different providers (Google, Meta, Mistral, etc.).
 *
 * This client mimics the z-ai-web-dev-sdk interface (chat.completions.create,
 * images.generations.create, functions.invoke) so the rest of the codebase
 * doesn't need to change.
 *
 * Limitations:
 * - chat.completions.create → ✅ fully supported (OpenAI-compatible)
 * - images.generations.create → ❌ not supported (OpenRouter has no image gen)
 * - functions.invoke('web_search') → ❌ not supported (use a different approach)
 * - functions.invoke('page_reader') → ❌ not supported (syndication fallback handles tweet fetch)
 *
 * When the user picks OpenRouter, image generation and web research are
 * automatically disabled (the UI hides those toggles).
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message?: string; code?: number };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionBody {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown;
}

export class OpenRouterClient {
  private config: Required<OpenRouterConfig>;

  constructor(config: OpenRouterConfig) {
    this.config = {
      baseUrl: config.baseUrl || OPENROUTER_BASE_URL,
      apiKey: config.apiKey,
      model: config.model,
    };
  }

  chat = {
    completions: {
      create: async (body: ChatCompletionBody): Promise<ChatCompletionResponse> => {
        const requestBody = {
          ...body,
          model: body.model || this.config.model,
          // OpenRouter-specific headers are sent via HTTP-headers, not body.
        };

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': 'https://xcommenter.app',
            'X-Title': 'XCommenter',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenRouter API request failed with status ${response.status}: ${errorText}`
          );
        }

        return (await response.json()) as ChatCompletionResponse;
      },
    },
  };

  images = {
    generations: {
      create: async (): Promise<{ data: Array<{ base64?: string }> }> => {
        throw new Error(
          'Image generation is not supported on OpenRouter. Please use a z-ai API key for image generation, or disable the image toggle.'
        );
      },
    },
  };

  functions = {
    invoke: async (name: string): Promise<unknown> => {
      if (name === 'web_search') {
        throw new Error(
          'Web research is not supported on OpenRouter. Please use a z-ai API key for research, or disable the research toggle.'
        );
      }
      if (name === 'page_reader') {
        throw new Error(
          'Page reading is not supported on OpenRouter. The tweet fetcher will use the syndication API instead.'
        );
      }
      throw new Error(`Function ${name} is not supported on OpenRouter.`);
    },
  };
}

/**
 * Create an OpenRouter client instance.
 */
export function createOpenRouterClient(config: OpenRouterConfig): OpenRouterClient {
  return new OpenRouterClient(config);
}
