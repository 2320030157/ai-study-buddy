import { NextAuthOptions } from 'next-auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email' 
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        }
      },
      async authorize(credentials) {
        try {
          console.log('🔄 Starting authentication process...');
          
          await connectDB();
          console.log('🟢 Connected to MongoDB successfully');

          if (!credentials?.email || !credentials?.password) {
            console.log('🔴 Missing credentials:', { 
              hasEmail: !!credentials?.email, 
              hasPassword: !!credentials?.password 
            });
            throw new Error('Please provide both email and password');
          }

          console.log('🔍 Looking for user with email:', credentials.email.toLowerCase());
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');  // Explicitly select password field

          if (!user) {
            console.log('🔴 No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('🟢 User found:', { 
            id: user._id, 
            email: user.email,
            hasPassword: !!user.password 
          });

          console.log('🔐 Comparing passwords...');
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.log('🔴 Password comparison failed for user:', user.email);
            throw new Error('Invalid email or password');
          }

          console.log('🟢 Password matched successfully!');
          console.log('✅ Authentication successful for user:', user.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error: any) {
          console.error('🔴 Authentication error:', {
            message: error.message,
            stack: error.stack
          });
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('📝 SignIn callback:', { 
        userId: user?.id,
        provider: account?.provider 
      });
      
      if (account?.provider === 'credentials') {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      console.log('🎟 JWT callback:', { 
        hasUser: !!user,
        hasAccount: !!account
      });
      
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔑 Session callback:', { 
        hasToken: !!token,
        hasUser: !!session?.user 
      });
      
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // Always enable debug mode to catch issues
}; 