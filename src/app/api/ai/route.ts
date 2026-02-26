import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { AIAnalysisResult } from '@/lib/types';

// 📚 LEARN: Next.js App Router API routes use the Web Request/Response API.
// This route acts as a proxy between the browser and OpenRouter, keeping the API key server-side.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, postUrl } = body as {
      prompt: string;
      model: string;
      postUrl?: string;
    };

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and model' },
        { status: 400 }
      );
    }

    // 📚 LEARN: API keys should come from environment variables, never from the client.
    // The client sends the prompt; the server adds the secret key.
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local', retryable: false },
        { status: 500 }
      );
    }

    const rawResponse = await callOpenRouter(prompt, model, apiKey);

    // 📚 LEARN: AI responses are unpredictable. We try to parse JSON from the response,
    // but wrap it in try-catch because the model might return malformed JSON.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: AIAnalysisResult | any[];
    try {
      // Try to extract JSON — could be an object {} or an array []
      const objectMatch = rawResponse.match(/\{[\s\S]*\}/);
      const arrayMatch = rawResponse.match(/\[[\s\S]*\]/);
      const jsonMatch = objectMatch || arrayMatch;
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      result = JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback for tag analysis
      result = {
        tags: ['untagged'],
        mood: 'neutral',
        confidence: 0.3,
      };
    }

    return NextResponse.json({ result, postUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimit = message.includes('429') || message.includes('rate');

    return NextResponse.json(
      { error: message, retryable: isRateLimit },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
