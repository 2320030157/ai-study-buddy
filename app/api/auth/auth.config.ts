import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error('Please enter both email and password');
        }

        try {
          console.log('Debug: Starting authentication process');
          console.log('Debug: MONGODB_URI exists:', !!process.env.MONGODB_URI);
          console.log('Debug: NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
          
          console.log('Attempting to connect to MongoDB...');
          await connectDB();
          console.log('MongoDB connected successfully');
          console.log('Debug: MongoDB connection state:', mongoose.connection.readyState);

          // Find user and explicitly include password
          console.log('Debug: Looking up user:', credentials.email.toLowerCase());
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');

          if (!user) {
            console.log('No user found with email:', credentials.email);
            return null;
          }

          console.log('Debug: User found, comparing password');
          // Direct password comparison
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Authentication successful');
          console.log('Debug: Returning user data');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error details:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            mongooseConnection: mongoose.connection.readyState
          });
          return null;
        }
      },
    }),
  ],
  debug: true, // Enable debug mode
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 