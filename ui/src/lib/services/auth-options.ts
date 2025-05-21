import { authApi } from '@/lib/services/api-client'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const data = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (data.token && data.user) {
            const tokenPayload = JSON.parse(
              Buffer.from(data.token.split('.')[1], 'base64').toString()
            );

            const role = tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            const user = {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName} ${data.user.lastName}`,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              userName: data.user.userName,
              userType: role || 'Student',
              accessToken: data.token,
              expiresAt: tokenPayload.exp,
            };

            return user as any;
          }

          return null;
        } catch (error: any) {
          if (error.response?.status === 401) {
            throw new Error('Invalid email or password');
          } else if (error.response?.status === 400) {
            throw new Error(error.response?.data?.message || 'Invalid request');
          } else if (error.response?.status >= 500) {
            throw new Error('Authentication service is temporarily unavailable');
          } else if (error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to authentication service');
          } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Authentication request timed out');
          } else {
            throw new Error('Authentication failed. Please try again.');
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.expiresAt = (user as any).expiresAt
        token.user = {
          id: user.id,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          userName: (user as any).userName,
          email: user.email!,
          userType: (user as any).userType,
        }
      }

      const now = Math.floor(Date.now() / 1000);
      if (token.expiresAt && now >= (token.expiresAt as number)) {
        return {} as any;
      }

      return token
    },
    async session({ session, token }) {
      if (!token.accessToken) {
        return {} as any;
      }

      session.accessToken = token.accessToken as string
      session.user = token.user as any
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60,
    updateAge: 60 * 60,
  },
}