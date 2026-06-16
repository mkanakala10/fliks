import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Send, Film, User } from 'lucide-react';
import { semanticSearch } from '../config/api';
import PageShell from './PageShell';
import './FliksChatbot.css';

export default function FliksChatbot({ onViewMovie }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '🎬 Welcome to Fliks! Ask about Indian cinema, get recommendations, or describe the kind of film you\'re in the mood for. I search our Indian film database to give grounded answers.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildSearchContext = async (userMessage) => {
    try {
      const data = await semanticSearch(userMessage, 5);
      const hits = data.results || [];
      if (!hits.length) return { context: '', movies: [] };

      const lines = hits.map(
        (m, i) =>
          `${i + 1}. "${m.title}" (ID: ${m.csv_id})${m.language ? ` [${m.language}]` : ''}: ${(m.plot || '').slice(0, 200)}`
      );

      return {
        context: `\n\nGrounded Indian cinema matches from our semantic search database:\n${lines.join('\n')}\n\nWhen recommending films, prefer titles from this list. Mention specific titles by name.`,
        movies: hits,
      };
    } catch {
      return { context: '', movies: [] };
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const { context: searchContext, movies: searchHits } = await buildSearchContext(userMessage);

    if (!GEMINI_API_KEY) {
      if (searchHits.length > 0) {
        const fallback = searchHits
          .map((m) => `🎬 **${m.title}** — ${(m.plot || '').slice(0, 150)}…`)
          .join('\n\n');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Here are Indian films that match your query (from semantic search):\n\n${fallback}\n\n_Add VITE_GEMINI_API_KEY for full AI chat._`,
            movies: searchHits,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              '🎬 No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file. Start the backend for semantic search fallback.',
          },
        ]);
      }
      setIsLoading(false);
      return;
    }

    try {
      const systemPrompt = `You are Fliks, an enthusiastic expert on Indian cinema. Help users discover Hindi, Tamil, Telugu, Malayalam, and Kannada films. Be conversational and passionate. Use the grounded search results below when relevant — cite specific movie titles from that list when recommending.${searchContext}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
            movies: searchHits.length > 0 ? searchHits : undefined,
          },
        ]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (searchHits.length > 0) {
        const fallback = searchHits.map((m) => `• ${m.title}`).join('\n');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Gemini is unavailable, but here are matching Indian films:\n${fallback}`,
            movies: searchHits,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '🎬 Having technical difficulties. Make sure the backend and Gemini API key are configured.',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <PageShell>
    <div
      className="fliks-chatbot"
      style={{
        '--fliks-bg': theme.palette.background.default,
        '--fliks-surface': theme.palette.background.paper,
        '--fliks-surface-elevated': theme.palette.action.hover,
        '--fliks-text': theme.palette.text.primary,
        '--fliks-text-muted': theme.palette.text.secondary,
        '--fliks-on-primary': theme.palette.primary.contrastText,
        '--fliks-border': theme.palette.divider,
        '--fliks-hover': theme.palette.action.hover,
      }}
    >
      <div className="chat-page-intro">
        <h2>AI Assistant</h2>
        <p>Ask about Indian cinema or describe what you want to watch.</p>
      </div>

      <div className="chat-area">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`message-row ${message.role === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                <div className={`avatar ${message.role === 'user' ? 'user-avatar' : 'assistant-avatar'}`}>
                  {message.role === 'user' ? <User size={20} /> : <Film size={20} />}
                </div>
                <div className={`message-bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                  <p>{message.content}</p>
                </div>
              </div>

              {message.movies?.length > 0 && onViewMovie && (
                <div className="message-row assistant-row" style={{ marginTop: '-8px' }}>
                  <div className="avatar" style={{ visibility: 'hidden' }} />
                  <div className="message-bubble assistant-bubble" style={{ padding: '12px 16px' }}>
                    <p className="movie-chip-label">Tap a film for details:</p>
                    <div className="movie-chip-row">
                      {message.movies.map((m) => (
                        <button
                          key={m.csv_id}
                          type="button"
                          className="movie-chip"
                          onClick={() => onViewMovie(Number(m.csv_id))}
                        >
                          {m.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="message-row assistant-row">
              <div className="avatar assistant-avatar">
                <Film size={20} />
              </div>
              <div className="message-bubble assistant-bubble">
                <div className="typing-indicator">
                  <div className="reel"></div>
                  <div className="reel"></div>
                  <div className="reel"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Indian films or describe what you want to watch..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            <Send size={24} />
          </button>
        </div>
        <p className="tagline">
          Powered by Fliks — semantic search + Gemini
        </p>
      </div>
    </div>
    </PageShell>
  );
}
