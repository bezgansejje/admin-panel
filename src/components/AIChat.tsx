'use client';

import { useState } from 'react';
import axios from 'axios';

export function AIChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/chat', {
        message: input,
      });

      const botMessage = { 
        role: 'bot', 
        text: res.data.reply || 'Получен пустой ответ'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Не удалось отправить сообщение. Попробуйте позже.');
      const errorMessage = { 
        role: 'bot', 
        text: '❌ Извините, произошла ошибка. Пожалуйста, попробуйте позже.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        🤖 AI Помощник
        <span className="badge">Llama 3</span>
      </div>

      <div className="chat-box">
        {messages.length === 0 && (
          <div className="chat-empty">
            💬 Напишите сообщение, чтобы начать диалог
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
            {msg.text}
          </div>
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Напишите сообщение..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? '...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
}