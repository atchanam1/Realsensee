'use client'
import AuthWrapper from '@/components/AuthWrapper'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function LeavePage() {
  const [form, setForm] = useState({ reason: '', leave_date: '', return_date: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reason || !form.leave_date || !form.return_date) {
      toast.error('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('ส่งคำขอลาสำเร็จ!')
        setForm({ reason: '', leave_date: '', return_date: '' })
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthWrapper>
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📝 แจ้งลา
          </h1>
          <p className="text-gray-400 text-sm mt-1">กรอกข้อมูลการลาและรอการอนุมัติจาก Admin</p>
        </div>

        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">เหตุผลการลา</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="ระบุเหตุผลการลา..."
                rows={3}
                className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">วันที่เริ่มลา</label>
                <input
                  type="date"
                  value={form.leave_date}
                  onChange={(e) => setForm({ ...form, leave_date: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">วันที่กลับ</label>
                <input
                  type="date"
                  value={form.return_date}
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังส่ง...
                </span>
              ) : '📨 ส่งคำขอลา'}
            </button>
          </form>
        </div>

        <div className="mt-4 bg-[#1a1a2e] border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">⚠️ คำขอลาจะถูกส่งไปยัง Admin เพื่ออนุมัติ กรุณารอการยืนยัน</p>
        </div>
      </div>
    </AuthWrapper>
  )
}
