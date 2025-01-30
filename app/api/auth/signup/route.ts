import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // Connect to DB with timeout
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);

    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists with timeout
    const existingUser = await Promise.race([
      User.findOne({ email: email.toLowerCase() }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password with timeout
    const hashedPassword = await Promise.race([
      bcrypt.hash(password, 12),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Password hashing timeout')), 5000)
      )
    ]);

    // Create new user with timeout
    const user = await Promise.race([
      User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        studyPreferences: {
          subjects: [],
          dailyGoal: 30,
          reminderTime: '09:00',
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User creation timeout')), 5000)
      )
    ]);

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 