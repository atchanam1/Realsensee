'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session.user.isApproved) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === 'authenticated' && !session.user.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-white mb-2">รอการอนุมัติ</h2>
          <p className="text-gray-400 text-sm mb-4">
            บัญชีของคุณ <span className="text-white font-semibold">{session.user.username}</span><br />
            กำลังรอการอนุมัติจาก Admin
          </p>
          <img src={session.user.image || ''} alt="avatar" className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white/20" />
          <button onClick={() => signIn('discord')} className="text-xs text-gray-600 hover:text-gray-300 transition">
            เข้าสู่ระบบด้วยบัญชีอื่น
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808]">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-28 h-28 bg-white rounded-2xl p-2 mx-auto mb-4 shadow-lg">
          <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Gang System</h1>
        <p className="text-gray-500 text-sm mb-8">ระบบจัดการแก๊ง</p>

        <button
          onClick={() => signIn('discord')}
          className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
        >
          <svg width="22" height="22" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.44077 45.4204 0.52529C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.52529C25.5141 0.44359 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" fill="white"/>
          </svg>
          เข้าสู่ระบบด้วย Discord
        </button>

        <p className="text-gray-700 text-xs mt-6">เข้าสู่ระบบได้เฉพาะสมาชิกที่ได้รับอนุมัติ</p>
      </div>
    </div>
  )
}
