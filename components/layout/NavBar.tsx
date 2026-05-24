'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Icon from '@/components/ui/Icon'

export default function NavBar() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span className="hidden sm:block">DeutschOcean</span>
        </Link>

        {/* Nav-Links */}
        <div className="flex items-center gap-1">
          {[
            { href:'/dashboard', emoji:'🏠', label:'Dashboard' },
            { href:'/stats',     emoji:'📊', label:'Stats'     },
            { href:'/chat',      emoji:'💬', label:'Chat'      },
            ...(isAdmin ? [{ href:'/admin', emoji:'🛠', label:'Admin' }] : []),
          ].map(({ href, emoji, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 transition">
              <Icon emoji={emoji} size={16} /><span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </div>

        {/* Rechts: XP + Avatar */}
        {session?.user && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
              <Icon emoji="⚡" size={14} />
            </span>
            <Link href="/profil" className="text-2xl" title={`${session.user.name} — Profil`}>
              {session.user.avatar || '🐬'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
