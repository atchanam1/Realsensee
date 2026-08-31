'use client'
import { useSession } from 'next-auth/react'
import AuthWrapper from '@/components/AuthWrapper'
import { useEffect, useState } from 'react'

interface Stats {
  presentDays: number
  absentDays: number
  leaveDays: number
  pendingLeaves: number
  itemsSent: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ presentDays: 0, absentDays: 0, leaveDays: 0, pendingLeaves: 0, itemsSent: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [attendRes, leaveRes, itemsRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/leave'),
          fetch('/api/items'),
        ])
        const [attend, leaves, items] = await Promise.all([
          attendRes.json(), leaveRes.json(), itemsRes.json()
        ])
        const myAttend = attend.data?.filter((a: any) => a.user_id === session?.user?.id) || []
        const myLeaves = leaves.data?.filter((l: any) => l.user_id === session?.user?.id) || []
        const myItems = items.data?.filter((i: any) => i.from_user_id === session?.user?.id) || []
        setStats({
          presentDays: myAttend.filter((a: any) => a.status === 'present').length,
          absentDays: myAttend.filter((a: any) => a.status === 'absent').length,
          leaveDays: myAttend.filter((a: any) => a.status === 'leave').length,
          pendingLeaves: myLeaves.filter((l: any) => l.status === 'pending').length,
          itemsSent: myItems.length,
        })
      } catch (e) {}
    }
    if (session?.user?.id) fetchStats()
  }, [session])

  return (
    <AuthWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <img
              src={session?.user?.image || ''}
              alt="avatar"
              className="w-16 h-16 rounded-full border-2 border-purple-500 shadow-lg shadow-purple-500/20"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                สวัสดี, {session?.user?.username} 👋
              </h1>
              <p className="text-gray-400 text-sm">ยินดีต้อนรับสู่ระบบจัดการแก๊ง</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'วันที่มา', value: stats.presentDays, icon: '✅', color: 'text-green-400' },
            { label: 'วันที่ไม่มา', value: stats.absentDays, icon: '❌', color: 'text-red-400' },
            { label: 'วันที่ลา', value: stats.leaveDays, icon: '🏖️', color: 'text-yellow-400' },
            { label: 'รอการลา', value: stats.pendingLeaves, icon: '⏳', color: 'text-orange-400' },
            { label: 'ของที่ส่ง', value: stats.itemsSent, icon: '📦', color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-white mb-4">เมนูหลัก</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: '/leave', label: 'แจ้งลา', icon: '📝', desc: 'ส่งคำขอลางาน', color: 'from-purple-600/20 to-purple-800/20 border-purple-500/30' },
            { href: '/leave/history', label: 'ประวัติการลา', icon: '📋', desc: 'ดูประวัติการลาทั้งหมด', color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30' },
            { href: '/attendance', label: 'การมาร่วม', icon: '📅', desc: 'บันทึกการมา/ไม่มา', color: 'from-green-600/20 to-green-800/20 border-green-500/30' },
            { href: '/gang-history', label: 'ประวัติแก๊ง', icon: '🏃', desc: 'ประวัติเข้า-ออกแก๊ง', color: 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30' },
            { href: '/items', label: 'ส่งของ', icon: '📦', desc: 'ส่งไม้/เหล็ก/เหมือง', color: 'from-orange-600/20 to-orange-800/20 border-orange-500/30' },
            ...(session?.user?.role === 'admin' ? [{ href: '/members', label: 'จัดการสมาชิก', icon: '👥', desc: 'เพิ่ม/ลบ/อนุมัติสมาชิก', color: 'from-red-600/20 to-red-800/20 border-red-500/30' }] : []),
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`bg-gradient-to-br ${item.color} border rounded-xl p-5 hover:scale-105 transition-all duration-200 cursor-pointer`}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-white font-semibold">{item.label}</div>
              <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </AuthWrapper>
  )
}
