import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { queryOne, query } from '@/lib/db/client'
import type { SessionUser } from '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await queryOne<{
          id: string; email: string; name: string; avatar: string
          password_hash: string | null; is_admin: boolean; school_module: string
        }>(
          'SELECT id, email, name, avatar, password_hash, is_admin, school_module FROM sebo.users WHERE email = $1',
          [credentials.email]
        )

        if (!user || !user.password_hash) return null

        const valid = await compare(credentials.password as string, user.password_hash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isAdmin: user.is_admin,
          schoolModule: user.school_module,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Google-User beim ersten Login anlegen oder aktualisieren
        const existing = await queryOne<{ id: string }>(
          'SELECT id FROM sebo.users WHERE google_id = $1 OR email = $2',
          [account.providerAccountId, user.email]
        )

        if (!existing) {
          await query(
            `INSERT INTO sebo.users (email, name, google_id)
             VALUES ($1, $2, $3)`,
            [user.email, user.name ?? 'Neuling', account.providerAccountId]
          )
        } else {
          await query(
            'UPDATE sebo.users SET google_id = $1 WHERE id = $2',
            [account.providerAccountId, existing.id]
          )
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        // Erste Anmeldung: Profil aus DB holen und in Token schreiben
        const dbUser = await queryOne<SessionUser & { is_admin: boolean; school_module: string }>(
          'SELECT id, email, name, avatar, is_admin, school_module FROM sebo.users WHERE email = $1',
          [token.email]
        )
        if (dbUser) {
          token.id = dbUser.id
          token.avatar = dbUser.avatar
          token.isAdmin = dbUser.is_admin
          token.schoolModule = dbUser.school_module
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.avatar = token.avatar as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.schoolModule = token.schoolModule as string
      }
      return session
    },
  },
})
