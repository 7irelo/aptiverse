import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      id: string
      firstName: string
      lastName: string
      userName: string
      userType: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    accessToken: string
    firstName: string
    lastName: string
    userName: string
    userType: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    user: {
      id: string
      firstName: string
      lastName: string
      userName: string
      email: string
      userType: string
    }
  }
}