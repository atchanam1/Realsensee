'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const ITEMS = [
  { type: 'wood', label: 'ไม้', icon: '🪵', color: 'from-amber-600/20 to-amber-800/20 border-amber-500/30 hover:border-amber-400' },
  { type: 'iron', label: 'เหล็ก', icon: '⚙️', color: 'from-gray-600/20 to-gray-800/20 border-gray-500/30 hover:border-gray-400' },
  { type: 'mine', label: 'เหมือง', icon: '⛏️', color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400' },
]

export default function ItemsPage() {
  const [members, setMembers] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [membersRes, itemsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/items'),
      ])
      const { data: membersData } = await membersRes.json()
      const { data: itemsData } = await itemsRes.json()
      setMembers((membersData || []).filter((m: any) => m.is_approved))
      setHistory(itemsData || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSend = async () => {
    if (!selectedUser) { toast.error('กรุณาเลือกผู้รับ'); return }
    if (!selectedItem) { toast.error('กรุณาเลือกของที่ส่ง'); return }
    setSending(true)
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_user_id: selectedUser, item_type: selectedItem }),
    })
    if (res.ok) {
      const item = ITEMS.find(i => i.type === selectedItem)
      toast.success(`ส่ง${item?.label} 100 ชิ้น สำเร็จ!`)
      setSelectedUser('')
      setSelectedItem('')
      fetchData()
    } else {
      toast.error('เกิดข้อผิดพลาด')
    }
    setSending(false)
  }

  const itemMap = Object.fromEntries(ITEMS.map(i => [i.type, i]))

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">📦 ส่งของ</h1>
          <p className="text-gray-400 text-sm mt-1">ส่งของให้สมาชิกในแก๊ง ครั้งละ 100 ชิ้น</p>
        </div>

        {/* Send Form */}
        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl p-6 mb-6">
          {/* Select Receiver */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">เลือกผู้รับ</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="">-- เลือกสมาชิก --</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.username}</option>
              ))}
            </select>
          </div>

          {/* Select Item */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">เลือกของ (100 ชิ้น)</label>
            <div className="grid grid-cols-3 gap-4">
              {ITEMS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedItem(item.type)}
                  className={`bg-gradient-to-br ${item.color} border-2 rounded-xl p-5 text-center transition-all duration-200 hover:scale-105 ${
                    selectedItem === item.type ? 'ring-2 ring-white/40 scale-105' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <div className="text-white font-semibold">{item.label}</div>
                  <div className="text-gray-400 text-xs mt-1">100 ชิ้น</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !selectedUser || !selectedItem}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังส่ง...
              </span>
            ) : '🚀 ส่งของ'}
          </button>
        </div>

        {/* History */}
        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#2d2d4e]">
            <h2 className="text-white font-semibold">ประวัติการส่งของ</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">ยังไม่มีประวัติ</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2d2d4e]">
                  <th className="text-left p-4">ผู้ส่ง</th>
                  <th className="text-left p-4">ผู้รับ</th>
                  <th className="text-left p-4">ของ</th>
                  <th className="text-left p-4">จำนวน</th>
                  <th className="text-left p-4">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h: any) => (
                  <tr key={h.id} className="border-b border-[#2d2d4e]/50 hover:bg-[#2d2d4e]/20 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={h.from_user?.avatar || `https://ui-avatars.com/api/?name=${h.from_user?.username}`} className="w-7 h-7 rounded-full" alt="" />
                        <span className="text-white">{h.from_user?.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={h.to_user?.avatar || `https://ui-avatars.com/api/?name=${h.to_user?.username}`} className="w-7 h-7 rounded-full" alt="" />
                        <span className="text-white">{h.to_user?.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1">
                        {itemMap[h.item_type]?.icon} {itemMap[h.item_type]?.label}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">x{h.quantity}</td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(h.sent_at).toLocaleString('th-TH')}
                    </td>
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
