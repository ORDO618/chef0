import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(customApiKey?: string | null): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}
