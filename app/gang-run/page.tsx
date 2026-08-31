'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function GangRunPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const [members, setMembers] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Form state (admin only)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [membersRes, runsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/gang-runs'),
      ])
      const { data: membersData } = await membersRes.json()
      const { data: runsData } = await runsRes.json()
      setMembers((membersData || []).filter((m: any) => m.is_approved))
      setHistory(runsData || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelectedUsers(members.map(m => m.id))
  }

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) { toast.error('กรุณาเลือกสมาชิกอย่างน้อย 1 คน'); return }
    setSubmitting(true)
    const res = await fetch('/api/gang-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: selectedUsers, run_date: runDate, note }),
    })
    if (res.ok) {
      toast.success(`บันทึก ${selectedUsers.length} คน สำเร็จ!`)
      setSelectedUsers([])
      setNote('')
      fetchData()
    } else {
      toast.error('เกิดข้อผิดพลาด')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/gang-runs?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('ลบแล้ว')
      setConfirmDelete(null)
      fetchData()
    }
  }

  // Group history by date
  const grouped = history.reduce((acc: any, item: any) => {
    const date = item.run_date
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  // Stats
  const totalRuns = Object.keys(grouped).length
  const myRuns = history.filter((h: any) => h.user_id === session?.user?.id).length

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">🏃 มารันแก๊ง</h1>
          <p className="text-gray-400 text-sm mt-1">บันทึกการมาร่วมรันแก๊ง</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'รอบทั้งหมด', value: totalRuns, color: 'text-white' },
            { label: 'ของฉัน', value: myRuns, color: 'text-white' },
            { label: 'คนวันล่าสุด', value: Object.values(grouped)[0] ? (Object.values(grouped)[0] as any[]).length : 0, color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="bg-[#111111] border border-[#222] rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Form */}
        {isAdmin && (
          <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">📋 บันทึกการรันแก๊ง</h2>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">วันที่รัน</label>
              <input
                type="date"
                value={runDate}
                onChange={e => setRunDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">หมายเหตุ (ไม่บังคับ)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="เช่น รอบเช้า / ครั้งที่ 1"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Members */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-400">เลือกสมาชิกที่มา ({selectedUsers.length}/{members.length})</label>
                <button onClick={handleSelectAll} className="text-xs text-gray-500 hover:text-white transition">
                  เลือกทั้งหมด
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {members.map((m: any) => {
                  const selected = selectedUsers.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleUser(m.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'bg-white border-white text-black'
                          : 'bg-[#1a1a1a] border-[#333] text-white hover:border-white/30'
                      }`}
                    >
                      <img
                        src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=333&color=fff`}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        alt=""
                      />
                      <span className={`text-sm font-medium truncate ${selected ? 'text-black' : 'text-white'}`}>
                        {m.username}
                      </span>
                      {selected && <span className="ml-auto text-black font-bold flex-shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || selectedUsers.length === 0}
              className="w-full bg-white hover:bg-gray-100 disabled:opacity-30 text-black font-bold py-3 rounded-xl transition hover:scale-105"
            >
              {submitting ? 'กำลังบันทึก...' : `✅ บันทึก ${selectedUsers.length > 0 ? `(${selectedUsers.length} คน)` : ''}`}
            </button>
          </div>
        )}

        {/* History grouped by date */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold">ประวัติการรัน</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-[#111] border border-[#222] rounded-2xl">
              ยังไม่มีประวัติ
            </div>
          ) : (
            Object.entries(grouped).map(([date, runs]: any) => (
              <div key={date} className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[#222] flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">
                      {new Date(date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">{runs.length} คน</span>
                  </div>
                  {runs[0]?.note && (
                    <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full">{runs[0].note}</span>
                  )}
                </div>
                <div className="p-4 flex flex-wrap gap-3">
                  {runs.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2">
                      <img
                        src={r.user?.avatar || `https://ui-avatars.com/api/?name=${r.user?.username}&background=333&color=fff`}
                        className="w-7 h-7 rounded-full"
                        alt=""
                      />
                      <span className="text-white text-sm">{r.user?.username}</span>
                      {isAdmin && (
                        <button
                          onClick={() => setConfirmDelete(r.id)}
                          className="text-red-400 hover:text-red-300 ml-1 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-2">ยืนยันลบ</h3>
              <p className="text-gray-400 text-sm mb-6">ลบรายการนี้?</p>
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
