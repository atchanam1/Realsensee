'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function GangHistoryPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ user_id: '', event_type: 'join', note: '', event_date: new Date().toISOString().slice(0, 16) })
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = session?.user?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [eventsRes, membersRes] = await Promise.all([
        fetch('/api/gang-events'),
        isAdmin ? fetch('/api/members') : Promise.resolve(null),
      ])
      const { data: eventsData } = await eventsRes.json()
      setEvents(eventsData || [])
      if (membersRes) {
        const { data: membersData } = await membersRes.json()
        setMembers(membersData || [])
      }
    } catch { }
    setLoading(false)
  }

  useEffect(() => { if (session) fetchData() }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_id) { toast.error('กรุณาเลือกสมาชิก'); return }
    setSubmitting(true)
    const res = await fetch('/api/gang-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('บันทึกสำเร็จ!')
      setForm({ user_id: '', event_type: 'join', note: '', event_date: new Date().toISOString().slice(0, 16) })
      fetchData()
    } else {
      toast.error('เกิดข้อผิดพลาด')
    }
    setSubmitting(false)
  }

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">🏃 ประวัติเข้า-ออกแก๊ง</h1>
          <p className="text-gray-400 text-sm mt-1">บันทึกการเข้าร่วมและออกจากแก๊ง</p>
        </div>

        {isAdmin && (
          <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">บันทึกเหตุการณ์</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">สมาชิก</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- เลือกสมาชิก --</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">เหตุการณ์</label>
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="join">🟢 เข้าแก๊ง</option>
                  <option value="leave">🔴 ออกแก๊ง</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">วันที่/เวลา</label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
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

        {/* Timeline */}
        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#2d2d4e]">
            <h2 className="text-white font-semibold">Timeline แก๊ง</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ยังไม่มีประวัติ</div>
          ) : (
            <div className="p-4 space-y-3">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-start gap-4 p-4 bg-[#0f0f1a] rounded-xl border border-[#2d2d4e]/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                    event.event_type === 'join' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {event.event_type === 'join' ? '🟢' : '🔴'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={event.users?.avatar || `https://ui-avatars.com/api/?name=${event.users?.username}`}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-white font-medium">{event.users?.username}</span>
                      <span className={`text-sm ${event.event_type === 'join' ? 'text-green-400' : 'text-red-400'}`}>
                        {event.event_type === 'join' ? 'เข้าร่วมแก๊ง' : 'ออกจากแก๊ง'}
                      </span>
                    </div>
                    {event.note && <p className="text-gray-400 text-sm mt-1">{event.note}</p>}
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(event.event_date).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}
