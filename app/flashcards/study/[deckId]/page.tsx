'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FlashCard {
  front: string;
  back: string;
}

interface Deck {
  _id: string;
  title: string;
  description: string;
  cards: FlashCard[];
  progress: number;
}

export default function StudyDeckPage({ params }: { params: { deckId: string } }) {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(`/api/flashcards/${params.deckId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch deck');
        }
        const data = await response.json();
        setDeck(data);
        setProgress(data.progress || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching deck');
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [params.deckId]);

  const updateProgress = async (newProgress: number) => {
    if (!deck) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/flashcards/${deck._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      setProgress(newProgress);
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (deck && currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      const newProgress = Math.round(
        ((currentCardIndex + 1) / deck.cards.length) * 100
      );
      updateProgress(newProgress);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      const newProgress = Math.round(
        ((currentCardIndex - 1) / (deck?.cards.length || 1)) * 100
      );
      updateProgress(newProgress);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-red-600">
          {error || 'Deck not found'}
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{deck.title}</h1>
          <p className="text-gray-600 mt-2">{deck.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentCardIndex + 1} of {deck.cards.length} cards
            </span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 min-h-[300px] cursor-pointer perspective-1000"
          onClick={handleFlip}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            <div className="absolute w-full h-full backface-hidden">
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Question
                </h3>
                <p className="text-lg text-center text-gray-700">
                  {currentCard.front}
                </p>
              </div>
            </div>
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Answer
                </h3>
                <p className="text-lg text-center text-gray-700">
                  {currentCard.back}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0 || saving}
          >
            ← Previous
          </Button>
          <div className="space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/flashcards')}
              disabled={saving}
            >
              Exit
            </Button>
            <Button variant="default" onClick={handleFlip} disabled={saving}>
              Flip Card 🔄
            </Button>
          </div>
          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            onClick={handleNext}
            disabled={currentCardIndex === deck.cards.length - 1 || saving}
          >
            Next →
          </Button>
        </div>

        {saving && (
          <div className="text-center mt-4 text-sm text-gray-600">
            Saving progress...
          </div>
        )}
      </div>
    </div>
  );
} 
