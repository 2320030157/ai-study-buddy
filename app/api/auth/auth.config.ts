import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User, IUser } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';

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
          // Single database connection with optimized timeout
          const connection = await Promise.race([
            connectDB(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 5000)
            )
          ]);

          // Single query to get user
          const user = await Promise.race([
            User.findOne({ email: credentials.email.toLowerCase() }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User lookup timeout')), 3000)
            )
          ]);

          if (!user) {
            console.log('No user found with email:', credentials.email);
            return null;
          }

          const isPasswordValid = await Promise.race([
            (user as IUser).comparePassword(credentials.password),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Password verification timeout')), 3000)
            )
          ]);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          const userDoc = user.toObject();
          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            name: userDoc.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          // Return null instead of throwing to prevent 500 errors
          return null;
        }
      },
    }),
  ],
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