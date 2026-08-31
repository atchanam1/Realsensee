import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('items')
    .select('*, from_user:from_user_id(username, avatar), to_user:to_user_id(username, avatar)')
    .order('sent_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { to_user_id, item_type } = body

  const validItems = ['wood', 'iron', 'mine']
  if (!validItems.includes(item_type)) {
    return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('items')
    .insert({
      from_user_id: session.user.id,
      to_user_id,
      item_type,
      quantity: 100,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
