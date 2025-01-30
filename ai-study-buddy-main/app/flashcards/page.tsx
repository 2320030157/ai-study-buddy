'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface Deck {
  _id: string;
  title: string;
  description: string;
  subject: string;
  cards: { front: string }[];
  progress: number;
  lastStudied: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchDecks = async () => {
        try {
          const response = await fetch('/api/flashcards');
          if (!response.ok) {
            throw new Error('Failed to fetch decks');
          }
          const data = await response.json();
          setDecks(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching decks');
          console.error('Error fetching decks:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchDecks();
    }
  }, [status, router]);

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      setDecks(decks.filter((deck) => deck._id !== deckId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting deck');
      console.error('Error deleting deck:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Flashcards 🎴</h1>
            <p className="text-gray-600">Review and create flashcard decks</p>
          </div>
          <Link href="/flashcards/create">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Create New Deck
            </Button>
          </Link>
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{deck.title}</h3>
                  <p className="text-gray-600 text-sm">{deck.description}</p>
                </div>
                <span className="text-2xl">📚</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Cards: {deck.cards.length}
                  </span>
                  <span className="text-gray-600">
                    {deck.lastStudied
                      ? `Last studied: ${new Date(
                          deck.lastStudied
                        ).toLocaleDateString()}`
                      : 'Not studied yet'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {deck.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                    <div
                      style={{ width: `${deck.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={() => router.push(`/flashcards/study/${deck._id}`)}
                  >
                    Study Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/flashcards/edit/${deck._id}`)}
                  >
                    Edit Cards ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDeck(deck._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Deck Card */}
          <Link href="/flashcards/create">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-dashed border-purple-200 flex flex-col items-center justify-center text-center h-full cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-200">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create New Deck
              </h3>
              <p className="text-gray-600">Start building your flashcard collection</p>
            </div>
          </Link>
        </div>

        {/* Empty State */}
        {decks.length === 0 && (
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Flashcard Decks Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first deck to start studying!
            </p>
            <Link href="/flashcards/create">
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Create Your First Deck
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 
