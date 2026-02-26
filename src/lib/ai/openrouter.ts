// 📚 LEARN: We proxy AI calls through our Next.js API route (/api/ai)
// This means the API key stays on the server and never appears in browser network requests.
// This is standard practice for any app handling secrets.

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export const MODELS = {
  vision: 'meta-llama/llama-4-maverick:free',
  text: 'meta-llama/llama-3.3-70b-instruct:free',
  fast: 'mistralai/mistral-small-3.1-24b-instruct:free',
} as const;

export type ModelKey = keyof typeof MODELS;

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

// 📚 LEARN: Client-side function that calls OUR API route (not OpenRouter directly).
// This is the function components will use.
export async function analyzePost(
  postUrl: string,
  caption?: string,
  model: string = MODELS.fast
): Promise<{ tags: string[]; suggestedCollection?: string; mood?: string; confidence: number }> {
  const prompt = buildTaggingPrompt(postUrl, caption);

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, postUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI analysis failed');
  }

  const data = await response.json();
  return data.result;
}

export async function suggestCollections(
  tagCounts: Record<string, number>
): Promise<Array<{ name: string; emoji: string; tags: string[] }>> {
  const prompt = buildCollectionSuggestionPrompt(tagCounts);

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: MODELS.fast }),
  });

  if (!response.ok) {
    throw new Error('Collection suggestion failed');
  }

  const data = await response.json();
  return data.result;
}
