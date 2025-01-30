'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface FlashCard {
  id: string;
  front: string;
  back: string;
}

export default function CreateDeckPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([
    { id: '1', front: '', back: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const addCard = () => {
    setCards([
      ...cards,
      { id: (cards.length + 1).toString(), front: '', back: '' },
    ]);
  };

  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const removeCard = (id: string) => {
    if (cards.length > 1) {
      setCards(cards.filter((card) => card.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!subject.trim()) {
        throw new Error('Subject is required');
      }
      if (cards.some((card) => !card.front.trim() || !card.back.trim())) {
        throw new Error('All cards must have both front and back content');
      }

      // Format cards for API
      const formattedCards = cards.map(({ front, back }) => ({ front, back }));

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subject: subject.trim(),
          cards: formattedCards,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create deck');
      }

      router.push('/flashcards');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating deck');
      console.error('Error creating deck:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Flashcard Deck ✨</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Deck Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Deck Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCard}
                  disabled={loading}
                >
                  Add Card ➕
                </Button>
              </div>

              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-gray-50 rounded-xl p-6 space-y-4 relative"
                >
                  <div className="absolute top-4 right-4 text-sm text-gray-500">
                    Card {index + 1}
                  </div>

                  <div>
                    <label
                      htmlFor={`front-${card.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Front
                    </label>
                    <textarea
                      id={`front-${card.id}`}
                      value={card.front}
                      onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`back-${card.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Back
                    </label>
                    <textarea
                      id={`back-${card.id}`}
                      value={card.back}
                      onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  {cards.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCard(card.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={loading}
                    >
                      Remove Card 🗑️
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/flashcards')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Flashcard Deck'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
