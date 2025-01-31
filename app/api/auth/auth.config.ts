import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        try {
          await connectDB();

          // Find user by email (no lean, no select)
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Compare passwords
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error('Invalid password');
          }

          // Return only the necessary user data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
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
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}; 