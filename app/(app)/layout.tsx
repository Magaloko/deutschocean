import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import NavBar from '@/components/layout/NavBar'
import MobileNav from '@/components/layout/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="flex-1 pb-20 sm:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
