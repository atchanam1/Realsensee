'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const ITEMS = [
  { type: 'wood', label: 'ไม้', icon: '🪵' },
  { type: 'iron', label: 'เหล็ก', icon: '⚙️' },
  { type: 'mine', label: 'เหมือง', icon: '⛏️' },
]

export default function ItemsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const [members, setMembers] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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

  const toggleItem = (type: string) => {
    setSelectedItems(prev =>
      prev.includes(type) ? prev.filter(i => i !== type) : [...prev, type]
    )
  }

  const handleSend = async () => {
    if (!selectedUser) { toast.error('กรุณาเลือกผู้รับ'); return }
    if (selectedItems.length === 0) { toast.error('กรุณาเลือกของอย่างน้อย 1 อย่าง'); return }
    setSending(true)
    try {
      await Promise.all(
        selectedItems.map(item =>
          fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_user_id: selectedUser, item_type: item }),
          })
        )
      )
      const names = selectedItems.map(t => ITEMS.find(i => i.type === t)?.label).join(', ')
      toast.success(`ส่ง ${names} สำเร็จ!`)
      setSelectedUser('')
      setSelectedItems([])
      fetchData()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
    setSending(false)
  }

  const handleDeleteHistory = async (id: string) => {
    const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('ลบประวัติแล้ว')
      setConfirmDelete(null)
      fetchData()
    } else {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const itemMap = Object.fromEntries(ITEMS.map(i => [i.type, i]))

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">📦 ส่งของ</h1>
          <p className="text-gray-400 text-sm mt-1">เลือกได้หลายอย่างพร้อมกัน ครั้งละ 100 ชิ้น/อย่าง</p>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 mb-6">
          {/* Select Receiver */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">เลือกผู้รับ</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition"
            >
              <option value="">-- เลือกสมาชิก --</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.username}</option>
              ))}
            </select>
          </div>

          {/* Select Items — Multi Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              เลือกของ
              {selectedItems.length > 0 && (
                <span className="ml-2 text-white font-bold">({selectedItems.length} อย่าง)</span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {ITEMS.map((item) => {
                const selected = selectedItems.includes(item.type)
                return (
                  <button
                    key={item.type}
                    onClick={() => toggleItem(item.type)}
                    className={`relative border-2 rounded-xl p-5 text-center transition-all duration-200 hover:scale-105 ${
                      selected
                        ? 'bg-white border-white text-black scale-105 shadow-lg shadow-white/20'
                        : 'bg-[#1a1a1a] border-[#333] text-white hover:border-white/40'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className={`font-semibold ${selected ? 'text-black' : 'text-white'}`}>{item.label}</div>
                    <div className={`text-xs mt-1 ${selected ? 'text-gray-700' : 'text-gray-400'}`}>100 ชิ้น</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setSelectedItems(ITEMS.map(i => i.type))}
              className="mt-3 text-xs text-gray-500 hover:text-white transition"
            >
              + เลือกทั้งหมด
            </button>
          </div>

          {/* Summary */}
          {selectedItems.length > 0 && selectedUser && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-sm text-gray-300">
              ส่ง {selectedItems.map(t => `${itemMap[t].icon} ${itemMap[t].label} 100 ชิ้น`).join(' + ')}
              {' '}→ {members.find(m => m.id === selectedUser)?.username}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !selectedUser || selectedItems.length === 0}
            className="w-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                กำลังส่ง...
              </span>
            ) : `🚀 ส่งของ ${selectedItems.length > 0 ? `(${selectedItems.length} อย่าง)` : ''}`}
          </button>
        </div>

        {/* History */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#222222]">
            <h2 className="text-white font-semibold">ประวัติการส่งของ</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-600">ยังไม่มีประวัติ</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#222222]">
                  <th className="text-left p-4">ผู้ส่ง</th>
                  <th className="text-left p-4">ผู้รับ</th>
                  <th className="text-left p-4">ของ</th>
                  <th className="text-left p-4">จำนวน</th>
                  <th className="text-left p-4">เวลา</th>
                  {isAdmin && <th className="text-left p-4">จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {history.map((h: any) => (
                  <tr key={h.id} className="border-b border-[#1a1a1a] hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={h.from_user?.avatar || `https://ui-avatars.com/api/?name=${h.from_user?.username}&background=222&color=fff`} className="w-7 h-7 rounded-full" alt="" />
                        <span className="text-white">{h.from_user?.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={h.to_user?.avatar || `https://ui-avatars.com/api/?name=${h.to_user?.username}&background=222&color=fff`} className="w-7 h-7 rounded-full" alt="" />
                        <span className="text-white">{h.to_user?.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      {itemMap[h.item_type]?.icon} {itemMap[h.item_type]?.label}
                    </td>
                    <td className="p-4 text-gray-400">x{h.quantity}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(h.sent_at).toLocaleString('th-TH')}
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        <button
                          onClick={() => setConfirmDelete(h.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#333] rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-2">🗑️ ยืนยันลบประวัติ</h3>
            <p className="text-gray-400 text-sm mb-6">ลบรายการนี้ออกจากประวัติ?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-[#222] hover:bg-[#333] text-white py-2.5 rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteHistory(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  )
}
