import { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { supabaseAdmin } from './supabase'

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'discord') return false
      const discordId = profile?.id as string
      const username = profile?.username as string
      const avatar = profile?.avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.png`
        : null

      // Upsert user in Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .upsert({
          discord_id: discordId,
          username: username || user.name || 'Unknown',
          avatar: avatar || user.image || null,
        }, { onConflict: 'discord_id', ignoreDuplicates: false })

      if (error) {
        console.error('Supabase upsert error:', error)
        return false
      }
      return true
    },

    async session({ session, token }) {
      if (token?.discordId) {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('discord_id', token.discordId as string)
          .single()

        if (userData) {
          session.user.id = userData.id
          session.user.discordId = userData.discord_id
          session.user.role = userData.role
          session.user.isApproved = userData.is_approved
          session.user.username = userData.username
        }
      }
      return session
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        token.discordId = profile.id
      }
      return token
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
