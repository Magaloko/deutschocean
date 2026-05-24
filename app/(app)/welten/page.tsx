import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { WELTEN, isWeltForModule } from '@/lib/game/weltenData'
import { getWeltMastery } from '@/lib/game/masteryData'
import MasteryBadge from '@/components/ui/MasteryBadge'

export default async function WeltenPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [user, completed, weakRows] = await Promise.all([
    queryOne<{ school_module: string }>('SELECT school_module FROM sebo.users WHERE id=$1', [session.user.id]),
    query<{ mission_id: string }>('SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1', [session.user.id]),
    query<{ mission_id: string; count: number }>('SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1', [session.user.id]),
  ])

  const schoolModule = user?.school_module ?? 'volksschule'
  const profile = {
    completedMissions: completed.map(r => r.mission_id),
    weakGames: Object.fromEntries(weakRows.map(r => [r.mission_id, r.count])),
  }
  const visibleWelten = WELTEN.filter(w => isWeltForModule(w, schoolModule))

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">🌊 Welten</h1>
      <p className="text-gray-500 mb-6">Wähle deine Welt und tauche ein!</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleWelten.map(welt => {
          const mastery = getWeltMastery(welt, profile)
          return (
            <Link key={welt.id} href={`/welten/${welt.id}`}
              className="group rounded-3xl p-5 text-white shadow-md hover:shadow-xl transition-all"
              style={{ background: welt.gradient }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{welt.icon}</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
                  {mastery.plays}/{mastery.totalMissions}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1">{welt.title}</h2>
              <p className="text-sm text-white/80 mb-3">{welt.subtitle}</p>
              <div className="bg-white/90 rounded-xl p-2">
                <MasteryBadge rank={mastery.rank} nextRank={mastery.nextRank} progress={mastery.progress} size="sm" />
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
