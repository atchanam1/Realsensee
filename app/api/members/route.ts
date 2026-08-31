import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const isAdminOrHigher = (role?: string) => ['admin', 'superadmin'].includes(role || '')

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isApproved) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdminOrHigher(session?.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, is_approved, role } = body

  // Check if target user is superadmin — only superadmin can modify superadmin
  const { data: targetUser } = await supabaseAdmin.from('users').select('role').eq('id', id).single()
  if (targetUser?.role === 'superadmin' && session?.user?.role !== 'superadmin') {
    return NextResponse.json({ error: 'ไม่สามารถแก้ไขยศ Superadmin ได้' }, { status: 403 })
  }

  // Only superadmin can assign superadmin role
  if (role === 'superadmin' && session?.user?.role !== 'superadmin') {
    return NextResponse.json({ error: 'เฉพาะ Superadmin เท่านั้นที่กำหนดยศนี้ได้' }, { status: 403 })
  }

  const updateData: Record<string, unknown> = {}
  if (is_approved !== undefined) updateData.is_approved = is_approved
  if (role !== undefined) updateData.role = role

  const { data, error } = await supabaseAdmin
    .from('users').update(updateData).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdminOrHigher(session?.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // Check if target is superadmin — only superadmin can delete superadmin
  const { data: targetUser } = await supabaseAdmin.from('users').select('role').eq('id', id!).single()
  if (targetUser?.role === 'superadmin' && session?.user?.role !== 'superadmin') {
    return NextResponse.json({ error: 'ไม่สามารถลบ Superadmin ได้' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
