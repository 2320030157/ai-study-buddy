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
            console.log('🔴 Missing credentials');
            return null;
          }

          const normalizedEmail = credentials.email.toLowerCase().trim();
          console.log('🔍 Looking for user with email:', normalizedEmail);
          
          // Find user with exact email match
          const user = await User.findOne({ 
            email: normalizedEmail 
          }).select('+password');

          if (!user) {
            console.log('🔴 No user found with email:', normalizedEmail);
            return null;
          }

          console.log('🟢 User found:', { 
            id: user._id, 
            email: user.email,
            hasPassword: !!user.password
          });

          // Verify password is present
          if (!user.password) {
            console.log('🔴 User has no password stored');
            return null;
          }

          // Try both trimmed and untrimmed password
          const password = credentials.password;
          const trimmedPassword = credentials.password.trim();

          console.log('Attempting password comparison with:', {
            originalLength: password.length,
            trimmedLength: trimmedPassword.length,
            storedHashLength: user.password.length
          });

          // Try multiple comparison methods
          const attempts = [
            await bcrypt.compare(password, user.password),
            await bcrypt.compare(trimmedPassword, user.password),
            await user.comparePassword(password),
            await user.comparePassword(trimmedPassword)
          ];

          console.log('Password comparison attempts:', {
            originalBcrypt: attempts[0],
            trimmedBcrypt: attempts[1],
            originalCompare: attempts[2],
            trimmedCompare: attempts[3]
          });

          const isValid = attempts.some(result => result === true);

          if (!isValid) {
            console.log('🔴 All password comparison attempts failed');
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
      if (account?.provider === 'credentials' && user) {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
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
  debug: true
}; 