import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db/client'
import { MISSIONS } from '@/lib/game/gameData'
import { GAME_ROUTES } from '@/lib/game/weltenData'

export default async function MissionenPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const completed = await query<{ mission_id: string }>(
    'SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1',
    [session.user.id]
  )
  const completedSet = new Set(completed.map(r => r.mission_id))

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">🗺️ Alle Missionen</h1>
      <p className="text-gray-500 mb-6">
        {completedSet.size} von {MISSIONS.length} abgeschlossen
      </p>

      <div className="grid gap-3">
        {MISSIONS.map(m => {
          const done = completedSet.has(m.id)
          const route = GAME_ROUTES[m.type] ?? '#'
          return (
            <Link key={m.id} href={route}
              className={`flex items-center gap-4 p-4 bg-white rounded-2xl border transition ${
                done ? 'border-green-300 bg-green-50/40' : 'border-gray-100 hover:border-blue-300 hover:shadow-sm'
              }`}>
              <span className="text-3xl flex-shrink-0">{m.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.title}</p>
                <p className="text-sm text-gray-500">{m.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full font-semibold">+{m.xp} XP</span>
                {done && <span className="text-green-600 font-bold">✓</span>}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
