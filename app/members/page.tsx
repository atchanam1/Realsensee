'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isSuperAdmin = session?.user?.role === 'superadmin'
  const isAdminOrHigher = ['admin', 'superadmin'].includes(session?.user?.role || '')
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (session && !['admin', 'superadmin'].includes(session.user.role)) router.push('/dashboard')
  }, [session, router])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/members')
      const { data } = await res.json()
      setMembers(data || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  const handleApprove = async (id: string, isApproved: boolean) => {
    const res = await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: isApproved }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(isApproved ? 'อนุมัติสมาชิกแล้ว' : 'ยกเลิกสิทธิ์แล้ว')
      fetchMembers()
    } else {
      toast.error(data.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleRole = async (id: string, role: string) => {
    const res = await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('อัปเดต Role แล้ว')
      fetchMembers()
    } else {
      toast.error(data.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      toast.success('ลบสมาชิกแล้ว')
      setConfirmDelete(null)
      fetchMembers()
    } else {
      toast.error(data.error || 'เกิดข้อผิดพลาด')
    }
  }

  const canModify = (target: any) => {
    if (target.id === session?.user?.id) return false
    if (target.role === 'superadmin' && !isSuperAdmin) return false
    return true
  }

  const roleBadge = (role: string) => {
    if (role === 'superadmin') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">⭐ Superadmin</span>
    if (role === 'admin') return <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white">👑 Admin</span>
    return <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400">🎮 Member</span>
  }

  const approved = members.filter(m => m.is_approved)
  const pending = members.filter(m => !m.is_approved)

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">👥 จัดการสมาชิก</h1>
          <p className="text-gray-400 text-sm mt-1">อนุมัติ/ลบ/เปลี่ยน Role สมาชิก</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'ทั้งหมด', value: members.length, color: 'text-white' },
            { label: 'อนุมัติแล้ว', value: approved.length, color: 'text-green-400' },
            { label: 'รออนุมัติ', value: pending.length, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111111] border border-[#222] rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Members */}
        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-yellow-400 mb-3">⏳ รออนุมัติ ({pending.length})</h2>
            <div className="space-y-2">
              {pending.map((m: any) => (
                <div key={m.id} className="bg-[#111] border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=333&color=fff`} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <p className="text-white font-medium">{m.username}</p>
                      <p className="text-gray-600 text-xs">{m.discord_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(m.id, true)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl transition">✓ อนุมัติ</button>
                    <button onClick={() => setConfirmDelete(m.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl transition">✗ ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Members */}
        <div>
          <h2 className="text-base font-semibold text-white mb-3">สมาชิกทั้งหมด</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#222]">
                    <th className="text-left p-4">สมาชิก</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">สถานะ</th>
                    <th className="text-left p-4">วันที่สมัคร</th>
                    <th className="text-left p-4">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m: any) => {
                    const modifiable = canModify(m)
                    return (
                      <tr key={m.id} className={`border-b border-[#1a1a1a] hover:bg-white/5 transition ${m.role === 'superadmin' ? 'bg-yellow-500/5' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=333&color=fff`} className="w-9 h-9 rounded-full" alt="" />
                            <div>
                              <p className="text-white font-medium">{m.username}</p>
                              <p className="text-gray-600 text-xs">{m.discord_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {modifiable ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleRole(m.id, e.target.value)}
                              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                            >
                              <option value="member">🎮 Member</option>
                              <option value="admin">👑 Admin</option>
                              {isSuperAdmin && <option value="superadmin">⭐ Superadmin</option>}
                            </select>
                          ) : (
                            roleBadge(m.role)
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => modifiable && handleApprove(m.id, !m.is_approved)}
                            disabled={!modifiable}
                            className={`px-2 py-1 rounded-full text-xs transition ${
                              m.is_approved
                                ? 'bg-green-500/20 text-green-300 hover:bg-red-500/20 hover:text-red-300 disabled:hover:bg-green-500/20 disabled:hover:text-green-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            } disabled:cursor-default`}
                          >
                            {m.is_approved ? '✅ อนุมัติแล้ว' : '⏳ รออนุมัติ'}
                          </button>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">
                          {new Date(m.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="p-4">
                          {modifiable && (
                            <button onClick={() => setConfirmDelete(m.id)} className="text-red-400 hover:text-red-300 text-sm transition">
                              🗑️ ลบ
                            </button>
                          )}
                          {!modifiable && m.role === 'superadmin' && !isSuperAdmin && (
                            <span className="text-yellow-600 text-xs">🔒 Protected</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-2">⚠️ ยืนยันการลบ</h3>
              <p className="text-gray-400 text-sm mb-6">ลบสมาชิกนี้? ไม่สามารถย้อนกลับได้</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-[#222] hover:bg-[#333] text-white py-2.5 rounded-xl transition">ยกเลิก</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition">ลบ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  )
}
