import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!session.user.isAdmin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-bold flex items-center gap-2">
            🛠 DeutschOcean Admin
          </Link>
          <nav className="flex gap-1 text-sm">
            <Link href="/admin"        className="px-3 py-1.5 rounded-lg hover:bg-white/10">Dashboard</Link>
            <Link href="/admin/users"  className="px-3 py-1.5 rounded-lg hover:bg-white/10">Users</Link>
            <Link href="/admin/blog"   className="px-3 py-1.5 rounded-lg hover:bg-white/10">Blog</Link>
            <Link href="/dashboard"    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">← App</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
