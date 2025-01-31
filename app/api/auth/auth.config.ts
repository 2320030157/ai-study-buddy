import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User, IUser } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

interface UserWithPassword extends IUser {
  password: string;
  _id: Types.ObjectId;
}

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
          return null;
        }

        try {
          await connectDB();

          // Explicitly select password field for comparison
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password').lean() as UserWithPassword | null;

          if (!user || !user.password) {
            return null;
          }

          // Compare the provided password with the hashed password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Return user without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authentication error occurred');
          return null;
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
    maxAge: 24 * 60 * 60, // 24 hours
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
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}; 