'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const statusConfig = {
  present: { label: 'มา', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  absent: { label: 'ไม่มา', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  leave: { label: 'ลา', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
}

export default function AttendancePage() {
  const { data: session } = useSession()
  const [records, setRecords] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStatus, setSelectedStatus] = useState('present')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = session?.user?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [attendRes, membersRes] = await Promise.all([
        fetch('/api/attendance'),
        isAdmin ? fetch('/api/members') : Promise.resolve(null),
      ])
      const { data: attendData } = await attendRes.json()
      setRecords(attendData || [])
      if (membersRes) {
        const { data: membersData } = await membersRes.json()
        setMembers((membersData || []).filter((m: any) => m.is_approved))
      }
    } catch { }
    setLoading(false)
  }

  useEffect(() => { if (session) fetchData() }, [session])

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) { toast.error('กรุณาเลือกสมาชิก'); return }
    setSubmitting(true)
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedUser, event_date: selectedDate, status: selectedStatus, note }),
    })
    if (res.ok) {
      toast.success('บันทึกสำเร็จ!')
      setNote('')
      fetchData()
    } else {
      toast.error('เกิดข้อผิดพลาด')
    }
    setSubmitting(false)
  }

  // Group records by date if admin
  const myRecords = isAdmin ? records : records.filter((r: any) => r.user_id === session?.user?.id)
  const stats = {
    present: myRecords.filter((r: any) => r.status === 'present').length,
    absent: myRecords.filter((r: any) => r.status === 'absent').length,
    leave: myRecords.filter((r: any) => r.status === 'leave').length,
  }

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">📅 บันทึกการมา/ไม่มา</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'มา', value: stats.present, colorClass: 'text-green-400', borderClass: 'border-green-500/30' },
            { label: 'ไม่มา', value: stats.absent, colorClass: 'text-red-400', borderClass: 'border-red-500/30' },
            { label: 'ลา', value: stats.leave, colorClass: 'text-yellow-400', borderClass: 'border-yellow-500/30' },
          ].map((s) => (
            <div key={s.label} className={`bg-[#1a1a2e] border ${s.borderClass} rounded-xl p-4 text-center`}>
              <div className={`text-3xl font-bold ${s.colorClass}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Admin: mark form */}
        {isAdmin && (
          <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">บันทึกการเข้าร่วม</h2>
            <form onSubmit={handleMark} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">สมาชิก</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- เลือกสมาชิก --</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">วันที่</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">สถานะ</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="present">✅ มา</option>
                  <option value="absent">❌ ไม่มา</option>
                  <option value="leave">🏖️ ลา</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition"
                >
                  {submitting ? 'บันทึก...' : '💾 บันทึก'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#2d2d4e]">
            <h2 className="text-white font-semibold">ประวัติการเข้าร่วม</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : myRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ยังไม่มีข้อมูล</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2d2d4e]">
                  {isAdmin && <th className="text-left p-4">สมาชิก</th>}
                  <th className="text-left p-4">วันที่</th>
                  <th className="text-left p-4">สถานะ</th>
                  <th className="text-left p-4">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map((r: any) => (
                  <tr key={r.id} className="border-b border-[#2d2d4e]/50 hover:bg-[#2d2d4e]/20 transition">
                    {isAdmin && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img src={r.users?.avatar || `https://ui-avatars.com/api/?name=${r.users?.username}`} className="w-7 h-7 rounded-full" alt="" />
                          <span className="text-white">{r.users?.username}</span>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-gray-300">{r.event_date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${statusConfig[r.status as keyof typeof statusConfig]?.color}`}>
                        {statusConfig[r.status as keyof typeof statusConfig]?.label}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{r.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}
