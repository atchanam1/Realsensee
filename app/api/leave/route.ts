import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const isAdminOrHigher = (role?: string) => ['admin', 'superadmin'].includes(role || '')

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const query = supabaseAdmin
    .from('leaves')
    .select('*, users(username, avatar)')
    .order('created_at', { ascending: false })

  // Admin/superadmin sees all, member sees own only
  if (!isAdminOrHigher(session.user.role)) {
    query.eq('user_id', session.user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { reason, leave_date, return_date } = body

  const { data, error } = await supabaseAdmin
    .from('leaves')
    .insert({ user_id: session.user.id, reason, leave_date, return_date, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdminOrHigher(session?.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, status } = body

  const { data, error } = await supabaseAdmin
    .from('leaves')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
