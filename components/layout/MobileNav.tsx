'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Icon from '@/components/ui/Icon'

const ITEMS = [
  { href:'/dashboard', emoji:'🏠', label:'Spielen'  },
  { href:'/welten',    emoji:'🌊', label:'Welten'   },
  { href:'/chat',      emoji:'💬', label:'Ozzy'     },
  { href:'/profil',    emoji:'👤', label:'Profil'   },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 safe-area-pb sm:hidden">
      <div className="flex items-center justify-around h-16">
        {ITEMS.map(({ href, emoji, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
              {href === '/profil' && session?.user?.avatar
                ? <span className="text-2xl">{session.user.avatar}</span>
                : <Icon emoji={emoji} size={22} color={isActive ? '#4f46e5' : '#9ca3af'} />}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
