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
          console.log('Credentials received:', {
            email: credentials?.email,
            passwordLength: credentials?.password?.length
          });
          
          await connectDB();
          console.log('🟢 Connected to MongoDB successfully');

          if (!credentials?.email || !credentials?.password) {
            console.log('🔴 Missing credentials:', { 
              hasEmail: !!credentials?.email, 
              hasPassword: !!credentials?.password 
            });
            return null;
          }

          const normalizedEmail = credentials.email.toLowerCase().trim();
          console.log('🔍 Looking for user with normalized email:', normalizedEmail);
          
          // First try exact match
          let user = await User.findOne({ 
            email: normalizedEmail 
          }).select('+password');

          // If no exact match, try case-insensitive
          if (!user) {
            console.log('No exact match, trying case-insensitive search');
            user = await User.findOne({
              email: new RegExp('^' + normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
            }).select('+password');
          }

          if (!user) {
            console.log('🔴 No user found with email:', normalizedEmail);
            // List all users for debugging
            const allUsers = await User.find({}).select('email');
            console.log('Available users:', allUsers.map(u => u.email));
            return null;
          }

          console.log('🟢 User found:', { 
            id: user._id, 
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password?.length
          });

          // Verify password is present
          if (!user.password) {
            console.log('🔴 User has no password stored');
            return null;
          }

          // Log password details before comparison
          console.log('Password details:', {
            inputPasswordLength: credentials.password.length,
            storedPasswordLength: user.password.length,
            storedPasswordStart: user.password.substring(0, 10) + '...'
          });

          // Use direct bcrypt compare for debugging
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔐 Password comparison result:', {
            inputPasswordLength: credentials.password.length,
            storedPasswordLength: user.password.length,
            isValid: isValid
          });

          if (!isValid) {
            console.log('🔴 Password comparison failed for user:', user.email);
            return null;
          }

          console.log('✅ Authentication successful for user:', user.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error: any) {
          console.error('🔴 Authentication error:', {
            message: error.message,
            stack: error.stack,
            type: error.constructor.name
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
        provider: account?.provider,
        email: user?.email 
      });
      
      if (account?.provider === 'credentials') {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      console.log('🎟 JWT callback:', { 
        hasUser: !!user,
        hasAccount: !!account,
        tokenEmail: token?.email
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
        hasUser: !!session?.user,
        sessionEmail: session?.user?.email
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