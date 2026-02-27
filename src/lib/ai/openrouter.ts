// 📚 LEARN: We proxy AI calls through our Next.js API route (/api/ai)
// The API key comes from the user's localStorage, sent to our API route,
// which then forwards it to OpenRouter. The key never leaves the user's control.

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Free models — tried in order. When one is rate-limited, we fall back to the next.
export const FREE_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen3-14b:free',
  'deepseek/deepseek-r1-0528:free',
] as const;

// Paid models — cheap, reliable fallbacks when all free models fail (BYOK)
export const PAID_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct',
  'google/gemma-3-12b-it',
] as const;

export const ALL_MODELS = [...FREE_MODELS, ...PAID_MODELS];

// 📚 LEARN: Prompt engineering is critical for AI features. A well-structured prompt
// with explicit output format instructions dramatically improves response quality.
export const buildTaggingPrompt = (url: string, caption?: string) => `
You are analyzing an Instagram saved post.

Post URL: ${url}
${caption ? `Caption: "${caption}"` : ''}

Return ONLY a valid JSON object with this exact structure, no other text:
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedCollection": "Collection Name",
  "mood": "one word mood",
  "confidence": 0.85
}

Rules for tags:
- 4-6 tags total
- Lowercase, hyphenated if multi-word (e.g., "dark-academia")
- Cover: content type, aesthetic, subject, use-case
- Examples: "recipe", "travel", "interior-design", "outfit-inspo", "architecture", "workout", "quote", "dark-moody", "minimalist", "colorful"
`;

export const buildCollectionSuggestionPrompt = (tagCounts: Record<string, number>) => `
Analyze these tags and their usage counts from a user's Instagram saved posts collection:

${Object.entries(tagCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 30)
  .map(([tag, count]) => `- "${tag}": ${count} posts`)
  .join('\n')}

Suggest 3-5 collection names that would help organize these posts. Each collection should group related tags.

Return ONLY a valid JSON array, no other text:
[
  { "name": "Collection Name", "emoji": "🍕", "tags": ["tag1", "tag2"] },
  { "name": "Another Collection", "emoji": "✈️", "tags": ["tag3", "tag4"] }
]
`;

export const buildSearchPrompt = (query: string, availableTags: string[]) => `
A user is searching their Instagram saved posts with this query: "${query}"

Available tags in their collection: ${availableTags.join(', ')}

Return ONLY a valid JSON object with tags that match the search intent:
{
  "matchingTags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"]
}
`;

// 📚 LEARN: This function makes the actual API call to OpenRouter.
// It's only called from the server-side API route (/api/ai/route.ts),
// never from the browser, to keep the API key secure.
export async function callOpenRouter(
  prompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Archivr',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenRouter response');
  }

  return content;
}

// Helpers to check for API key
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('archivr-openrouter-key') || null;
}

export function hasApiKey(): boolean {
  return !!getStoredApiKey();
}

// 📚 LEARN: Client-side function that calls OUR API route (not OpenRouter directly).
// It tries free models first, then falls back to paid models, reporting progress via callbacks.
export async function analyzePost(
  postUrl: string,
  caption?: string,
  onStatusUpdate?: (message: string, variant: 'ai' | 'info' | 'error') => void,
): Promise<{ tags: string[]; suggestedCollection?: string; mood?: string; confidence: number }> {
  const prompt = buildTaggingPrompt(postUrl, caption);
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Try free models first
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    try {
      const result = await callApiRoute(prompt, model, postUrl, apiKey);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const isRateLimit = message.includes('429') || message.includes('rate');
      if (isRateLimit && i < FREE_MODELS.length - 1) {
        // Silent fallback to next free model
        continue;
      }
      if (isRateLimit && i === FREE_MODELS.length - 1) {
        // All free models exhausted — try paid
        onStatusUpdate?.('Free models are rate-limited. Trying premium models...', 'info');
        break;
      }
      // Non-rate-limit error — could be auth issue
      if (message.includes('401') || message.includes('invalid') || message.includes('Unauthorized')) {
        throw new Error('INVALID_KEY');
      }
      throw err;
    }
  }

  // Try paid models (BYOK)
  for (let i = 0; i < PAID_MODELS.length; i++) {
    const model = PAID_MODELS[i];
    try {
      const result = await callApiRoute(prompt, model, postUrl, apiKey);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('402') || message.includes('insufficient') || message.includes('payment')) {
        throw new Error('NO_CREDITS');
      }
      if (message.includes('429') && i < PAID_MODELS.length - 1) {
        continue;
      }
      if (i === PAID_MODELS.length - 1) {
        throw new Error('ALL_MODELS_FAILED');
      }
    }
  }

  throw new Error('ALL_MODELS_FAILED');
}

async function callApiRoute(
  prompt: string,
  model: string,
  postUrl: string,
  apiKey: string,
): Promise<{ tags: string[]; suggestedCollection?: string; mood?: string; confidence: number }> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, postUrl, apiKey }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(error.error || `AI analysis failed (${response.status})`);
  }

  const data = await response.json();
  return data.result;
}

export async function suggestCollections(
  tagCounts: Record<string, number>
): Promise<Array<{ name: string; emoji: string; tags: string[] }>> {
  const prompt = buildCollectionSuggestionPrompt(tagCounts);
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Try free models first, then paid
  for (const model of ALL_MODELS) {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, apiKey }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || `Failed (${response.status})`);
      }

      const data = await response.json();
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const isRateLimit = message.includes('429') || message.includes('rate');
      if (isRateLimit) continue;
      throw err;
    }
  }

  throw new Error('ALL_MODELS_FAILED');
}
