import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // e.g. "2026-08"

  let query = supabaseAdmin
    .from('attendance')
    .select('*, users(username, avatar, discord_id)')
    .order('event_date', { ascending: false })

  if (session.user.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  if (month) {
    query = query.gte('event_date', `${month}-01`).lte('event_date', `${month}-31`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { user_id, event_date, status, note } = body

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .upsert({ user_id, event_date, status, note }, { onConflict: 'user_id,event_date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
