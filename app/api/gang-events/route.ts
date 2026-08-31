import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('gang_events')
    .select('*, users(username, avatar)')
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { user_id, event_type, note, event_date } = body

  // Update user's joined_gang_at if event_type is 'join'
  if (event_type === 'join') {
    await supabaseAdmin
      .from('users')
      .update({ joined_gang_at: event_date || new Date().toISOString() })
      .eq('id', user_id)
  }

  const { data, error } = await supabaseAdmin
    .from('gang_events')
    .insert({ user_id, event_type, note, event_date: event_date || new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
