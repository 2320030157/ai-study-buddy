import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User, IUser } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';

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
          throw new Error('Please enter both email and password');
        }

        try {
          console.log('Attempting to connect to MongoDB...');
          await connectDB();
          console.log('MongoDB connected successfully');

          // Single query to get user
          console.log('Looking up user:', credentials.email.toLowerCase());
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            console.log('No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('User found, verifying password...');
          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('Password verified successfully');
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
          
          // Throw specific error messages
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('An error occurred during authentication');
        }
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
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