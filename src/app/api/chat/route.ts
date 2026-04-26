import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Валидация входящих данных
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Неверный формат сообщения' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
            role: 'system',
            content: 'Ты полезный AI-ассистент. Отвечай на русском языке.'
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

    // Логируем только для отладки (уберите в production)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', JSON.stringify(data, null, 2));
    }

    if (!response.ok) {
      console.error('OpenRouter Error:', data);
      return NextResponse.json(
        { reply: 'Извините, сервис временно недоступен. Попробуйте позже.' },
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