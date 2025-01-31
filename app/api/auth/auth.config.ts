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
            password: credentials?.password,
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
            storedPassword: user.password
          });

          let isValid = false;

          // First try direct string comparison
          if (credentials.password === user.password) {
            console.log('✅ Plain text password match');
            isValid = true;
          } 
          // If that fails and the stored password looks like a hash, try bcrypt
          else if (user.password.startsWith('$2')) {
            console.log('🔐 Trying bcrypt comparison...');
            try {
              isValid = await bcrypt.compare(credentials.password, user.password);
              console.log('✅ Bcrypt comparison result:', isValid);
            } catch (error) {
              console.error('Error in bcrypt compare:', error);
            }
          }
          
          console.log('🔐 Password comparison result:', {
            inputPassword: credentials.password,
            storedPassword: user.password,
            isValid: isValid
          });

          if (!isValid) {
            console.log('🔴 Password comparison failed');
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