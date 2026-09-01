'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'รออนุมัติ', color: 'bg-yellow-500/20 text-yellow-300' },
  approved: { label: 'อนุมัติแล้ว', color: 'bg-green-500/20 text-green-300' },
  rejected: { label: 'ไม่อนุมัติ', color: 'bg-red-500/20 text-red-300' },
}

export default function LeaveHistoryPage() {
  const { data: session } = useSession()
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leave')
      const { data } = await res.json()
      // Filter own leaves if not admin
      if (['admin','superadmin'].includes(session?.user?.role || '')) {
        setLeaves(data || [])
      } else {
        setLeaves((data || []).filter((l: any) => l.user_id === session?.user?.id))
      }
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchLeaves() }, [session])

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch('/api/leave', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      toast.success(status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว')
      fetchLeaves()
    }
  }

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">📋 ประวัติการลา</h1>
            <p className="text-gray-400 text-sm mt-1">
              {['admin','superadmin'].includes(session?.user?.role || '') ? 'คำขอลาทั้งหมด' : 'ประวัติการลาของคุณ'}
            </p>
          </div>
          <a href="/leave" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            + แจ้งลาใหม่
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 text-gray-500">ไม่มีประวัติการลา</div>
        ) : (
          <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d2d4e] text-gray-400">
                  {['admin','superadmin'].includes(session?.user?.role || '') && <th className="text-left p-4">สมาชิก</th>}
                  <th className="text-left p-4">เหตุผล</th>
                  <th className="text-left p-4">วันที่ลา</th>
                  <th className="text-left p-4">วันที่กลับ</th>
                  <th className="text-left p-4">สถานะ</th>
                  {['admin','superadmin'].includes(session?.user?.role || '') && <th className="text-left p-4">จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave: any) => (
                  <tr key={leave.id} className="border-b border-[#2d2d4e]/50 hover:bg-[#2d2d4e]/20 transition">
                    {['admin','superadmin'].includes(session?.user?.role || '') && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={leave.users?.avatar || `https://ui-avatars.com/api/?name=${leave.users?.username}`}
                            className="w-7 h-7 rounded-full"
                            alt=""
                          />
                          <span className="text-white">{leave.users?.username}</span>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-gray-300 max-w-xs truncate">{leave.reason}</td>
                    <td className="p-4 text-gray-300">{leave.leave_date}</td>
                    <td className="p-4 text-gray-300">{leave.return_date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusMap[leave.status]?.color}`}>
                        {statusMap[leave.status]?.label}
                      </span>
                    </td>
                    {['admin','superadmin'].includes(session?.user?.role || '') && leave.status === 'pending' && (
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(leave.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            ✓ อนุมัติ
                          </button>
                          <button
                            onClick={() => handleStatus(leave.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            ✗ ปฏิเสธ
                          </button>
                        </div>
                      </td>
                    )}
                    {['admin','superadmin'].includes(session?.user?.role || '') && leave.status !== 'pending' && (
                      <td className="p-4 text-gray-600 text-xs">-</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthWrapper>
  )
}

