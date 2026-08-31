import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      discordId: string
      name?: string | null
      email?: string | null
      image?: string | null
      username: string
      role: 'admin' | 'member'
      isApproved: boolean
    }
  }

  interface Profile {
    id: string
    username: string
    avatar: string
  }
}
