import ZAI from 'z-ai-web-dev-sdk';
import { getAiInstance, type AiProvider } from './ai-client';

/**
 * Image Generator - uses z-ai-web-dev-sdk images.generations.create
 * to generate a relevant image from a prompt.
 * Returns a base64 data URL that the frontend can display directly.
 *
 * NOTE: Image generation is only supported with the z-ai provider.
 * OpenRouter does not have image generation — callers should check the
 * provider before requesting an image.
 */

export interface ImageResult {
  success: boolean;
  dataUrl?: string; // base64 data URL
  prompt: string;
  error?: string;
}

interface ImageOptions {
  apiKey?: string;
  provider?: AiProvider;
  model?: string;
}

async function getAI(opts: ImageOptions) {
  return getAiInstance({ provider: opts.provider, apiKey: opts.apiKey, model: opts.model });
}

/**
 * Generate an image from a prompt and return it as a base64 data URL.
 * Size defaults to 1024x1024 (square, ideal for social replies).
 *
 * Only works with the z-ai provider. OpenRouter will return an error.
 */
export async function generateImage(
  prompt: string,
  options?: { apiKey?: string; provider?: AiProvider; model?: string },
  size: string = '1024x1024'
): Promise<ImageResult> {
  if (!prompt || prompt.trim().length < 3) {
    return {
      success: false,
      prompt,
      error: 'Prompt too short.',
    };
  }

  const allowedSizes = [
    '1024x1024',
    '768x1344',
    '864x1152',
    '1344x768',
    '1152x864',
    '1440x720',
    '720x1440',
  ];
  const safeSize = allowedSizes.includes(size) ? size : '1024x1024';

  try {
    const zai = await getAI(options || {});
    const response = (await zai.images.generations.create({
      prompt: prompt.trim(),
      size: safeSize as '1024x1024',
    })) as { data?: Array<{ base64?: string }> };

    const base64 = response.data?.[0]?.base64;
    if (!base64) {
      return {
        success: false,
        prompt,
        error: 'Image generation returned no data.',
      };
    }

    return {
      success: true,
      dataUrl: `data:image/png;base64,${base64}`,
      prompt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      prompt,
      error: message,
    };
  }
}
