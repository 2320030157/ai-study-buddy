import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deck } from '@/models/Flashcard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';

// Get a specific deck
export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const deck = await Deck.findOne({
      _id: params.deckId,
      user: session.user.id,
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error: any) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching deck' },
      { status: 500 }
    );
  }
}

// Update a deck
export async function PUT(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
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

    const deck = await Deck.findOneAndUpdate(
      { _id: params.deckId, user: session.user.id },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error: any) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating deck' },
      { status: 500 }
    );
  }
}

// Delete a deck
export async function DELETE(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const deck = await Deck.findOneAndDelete({
      _id: params.deckId,
      user: session.user.id,
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting deck' },
      { status: 500 }
    );
  }
}

// Update deck progress
export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
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

    if (typeof data.progress !== 'number' || data.progress < 0 || data.progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    const deck = await Deck.findOneAndUpdate(
      { _id: params.deckId, user: session.user.id },
      {
        progress: data.progress,
        lastStudied: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error: any) {
    console.error('Error updating deck progress:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating deck progress' },
      { status: 500 }
    );
  }
} 