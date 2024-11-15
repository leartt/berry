import { NextResponse } from 'next/server';
const API_TOKEN = process.env.CLOUDFLARE_WORKERS_AI_API_TOKEN;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  const { chatHistory } = body;
  const data = {
    messages: chatHistory,
    stream: true,
    max_tokens: 512,
  };

  const streamResponse = await fetch(
    'https://api.cloudflare.com/client/v4/accounts/6f18d21305ae09c53dfd2d5fe51753fa/ai/run/@cf/meta/llama-3.1-8b-instruct',
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return streamResponse;
}

export async function GET(req: Request) {
  // const body = await req.json();
  // const { chatHistory } = body;
  const data = {
    messages: [
      { role: 'system', content: "You're a helpful assistant" },
      { role: 'user', content: 'whats the largest city in Germany?' },
    ],
    stream: true,
  };

  const streamResponse = await fetch(
    'https://api.cloudflare.com/client/v4/accounts/6f18d21305ae09c53dfd2d5fe51753fa/ai/run/@cf/meta/llama-3.1-8b-instruct',
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return streamResponse;
}
