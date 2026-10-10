import ZAI from 'z-ai-web-dev-sdk';
import { getZaiInstance } from './ai-client';

/**
 * Web Researcher - uses z-ai web_search function to gather real-time info
 * about a topic (e.g. a crypto project mentioned in a tweet), so the LLM can
 * write INFORMED comments and viral posts instead of generic ones.
 */

export interface ResearchResult {
  success: boolean;
  query: string;
  summary: string; // English summary of what was found
  sources: Array<{ title: string; url: string; snippet: string }>;
  error?: string;
}

// Reuse the shared AI client helper.
const getZAI = getZaiInstance;

/**
 * Search the web for information about a topic, then summarize the findings.
 * The summary is in English and ready to be injected into an LLM prompt.
 */
export async function researchTopic(
  topic: string,
  apiKey?: string,
  numResults = 6
): Promise<ResearchResult> {
  const cleanedTopic = topic.trim();
  if (cleanedTopic.length < 3) {
    return {
      success: false,
      query: cleanedTopic,
      summary: '',
      sources: [],
      error: 'Topic too short.',
    };
  }

  try {
    const zai = await getZAI(apiKey);

    // 1. Search the web
    const searchResponse = await zai.functions.invoke('web_search', {
      query: cleanedTopic,
      num: numResults,
      recency_days: 30,
    });

    type SearchItem = {
      url?: string;
      name?: string;
      snippet?: string;
      host_name?: string;
      date?: string;
    };
    const results = (searchResponse?.data ?? searchResponse ?? []) as SearchItem[];
    const items = Array.isArray(results) ? results : [];

    if (items.length === 0) {
      return {
        success: true,
        query: cleanedTopic,
        summary: 'No web results found. Proceeding without extra context.',
        sources: [],
      };
    }

    const sources = items
      .filter((it) => it.name || it.snippet)
      .slice(0, numResults)
      .map((it) => ({
        title: it.name || '(untitled)',
        url: it.url || '',
        snippet: it.snippet || '',
      }));

    // 2. Summarize findings with the LLM
    const contextBlock = sources
      .map((s, i) => `${i + 1}. ${s.title}\n   ${s.snippet}\n   Source: ${s.url}`)
      .join('\n\n');

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a research analyst. Summarize web search results about a topic into a concise, factual briefing. Output plain English, under 250 words. Focus on: what the topic/project is, key facts, recent developments, and any notable context. Do not add opinions.',
        },
        {
          role: 'user',
          content: `Topic: "${cleanedTopic}"\n\nWeb search results:\n${contextBlock}\n\nWrite a concise factual briefing about this topic.`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const summary = completion.choices[0]?.message?.content || '';

    return {
      success: true,
      query: cleanedTopic,
      summary: summary.trim(),
      sources,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      query: cleanedTopic,
      summary: '',
      sources: [],
      error: message,
    };
  }
}
