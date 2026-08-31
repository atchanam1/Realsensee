'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', label: 'หน้าหลัก', icon: '🏠' },
  { href: '/leave', label: 'แจ้งลา', icon: '📝' },
  { href: '/leave/history', label: 'ประวัติการลา', icon: '📋' },
  { href: '/attendance', label: 'บันทึกการมา', icon: '📅' },
  { href: '/gang-history', label: 'ประวัติเข้า-ออกแก๊ง', icon: '🏃' },
  { href: '/items', label: 'ส่งของ', icon: '📦' },
]

const adminMenu = [
  { href: '/members', label: 'จัดการสมาชิก', icon: '👥' },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-[#1a1a2e] border-r border-[#2d2d4e] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2d2d4e]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <div>
            <h1 className="text-lg font-bold text-white">Gang System</h1>
            <p className="text-xs text-gray-500">ระบบจัดการแก๊ง</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-[#2d2d4e]">
        <div className="flex items-center gap-3">
          <img
            src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.username}`}
            alt="avatar"
            className="w-10 h-10 rounded-full border-2 border-purple-500"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.username}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              session?.user?.role === 'admin'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {session?.user?.role === 'admin' ? '👑 Admin' : '🎮 Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === item.href
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:bg-[#2d2d4e] hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {session?.user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs text-gray-600 uppercase tracking-wider px-3">Admin</p>
            </div>
            {adminMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:bg-[#2d2d4e] hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-[#2d2d4e]">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <span className="text-lg">🚪</span>
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
