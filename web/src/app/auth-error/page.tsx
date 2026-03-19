import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-red-500/10 bg-white/5 backdrop-blur-md text-center">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3 text-red-400">验证失败</h1>
        <p className="text-gray-400 mb-8">
          链接可能已经过期，或者验证信号丢失。别担心，这在数字世界很常见。
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-6 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}