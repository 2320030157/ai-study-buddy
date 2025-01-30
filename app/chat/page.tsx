'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendMessage, type Message } from '@/lib/ai';

// Define the suggestions array at the top level
const suggestions = [
  {
    emoji: '📚',
    text: 'Help me understand a difficult topic',
    prompt: 'Can you help me understand this topic in a fun and simple way?',
  },
  {
    emoji: '🎯',
    text: 'Create a study plan',
    prompt: 'Can you create a fun study plan for me?',
  },
  {
    emoji: '🎴',
    text: 'Make some flashcards',
    prompt: 'Can you create some fun flashcards for my topic?',
  },
  {
    emoji: '🎮',
    text: 'Learn through games',
    prompt: 'Can you suggest some educational games for my subject?',
  },
];

const quickPrompts = [
  {
    emoji: '🎨',
    label: 'Make Learning Fun',
    prompt: 'Can you explain this topic using fun examples and stories?',
  },
  {
    emoji: '🎯',
    label: 'Quick Quiz',
    prompt: 'Can you create a fun quiz about what I just learned?',
  },
  {
    emoji: '🌟',
    label: 'Fun Facts',
    prompt: 'Tell me some interesting fun facts about this topic!',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage([...messages, newMessage]);
      if (response.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (response.error) {
        console.error('Error:', response.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <div className="inline-block animate-bounce mb-4">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Your Study Buddy is Here!
          </h1>
          <p className="text-gray-600 mt-2">Ask me anything - I'm here to make learning fun! 🌟</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 h-[600px] flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-4xl animate-pulse">👋</div>
                <p className="text-gray-500">Hi there! Ready to learn something amazing?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion.prompt)}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors text-left"
                    >
                      <span className="text-2xl mb-2 block">{suggestion.emoji}</span>
                      <span className="text-sm text-gray-700">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🤖</span>
                        <span className="font-medium text-blue-600">Study Buddy</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl animate-bounce">🤔</span>
                      <p>Thinking of something awesome...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t border-purple-100 bg-white">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything! I'm here to help! 🌟"
                className="flex-1 rounded-xl border-2 border-purple-100 p-4 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 rounded-xl"
              >
                {isLoading ? '🤔' : '✨'} Send
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => setInput(prompt.prompt)}
              className="bg-white hover:bg-blue-50 border-2 border-blue-100 text-gray-700"
            >
              <span className="mr-2">{prompt.emoji}</span>
              {prompt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 