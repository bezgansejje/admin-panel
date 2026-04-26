import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Неверный формат сообщения' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is missing');
      return NextResponse.json(
        { reply: 'API ключ не найден на сервере' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aquasense-panel.netlify.app',
        'X-Title': 'Lakes Admin',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content: 'Ты полезный AI-ассистент. Отвечай на русском языке.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Error:', data);
      return NextResponse.json(
        { reply: data?.error?.message || 'OpenRouter API ошибка' },
        { status: response.status }
      );
    }

    const reply = data.choices?.[0]?.message?.content || 'Не удалось получить ответ';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: 'Произошла внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}