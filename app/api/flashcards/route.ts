import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deck } from '@/models/Flashcard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

// Create a new deck
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.subject || !data.cards || data.cards.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the deck
    const deck = await Deck.create({
      ...data,
      user: session.user.id, // Use the user's ID from the session
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error: any) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating deck' },
      { status: 500 }
    );
  }
}

// Get all decks for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const decks = await Deck.find({ user: session.user.id })
      .select('-cards.back') // Don't send card answers in the list view
      .sort({ updatedAt: -1 });

    return NextResponse.json(decks);
  } catch (error: any) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching decks' },
      { status: 500 }
    );
  }
} 