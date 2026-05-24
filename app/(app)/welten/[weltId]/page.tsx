import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { getWeltById, GAME_ROUTES } from '@/lib/game/weltenData'
import { getWeltMastery } from '@/lib/game/masteryData'
import { MISSIONS } from '@/lib/game/gameData'
import NPCCard from '@/components/ui/NPCCard'
import MasteryBadge from '@/components/ui/MasteryBadge'

const LEVEL_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Für Kleine', emoji: '🧒' },
  1: { label: 'Anfänger',   emoji: '📚' },
  2: { label: 'Profi',      emoji: '🏆' },
}

export default async function WeltDetailPage({ params }: { params: Promise<{ weltId: string }> }) {
  const { weltId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const welt = getWeltById(weltId)
  if (!welt) notFound()

  const [user, completed, weakRows] = await Promise.all([
    queryOne<{ school_module: string }>('SELECT school_module FROM sebo.users WHERE id=$1', [session.user.id]),
    query<{ mission_id: string }>('SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1', [session.user.id]),
    query<{ mission_id: string; count: number }>('SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1', [session.user.id]),
  ])

  const profile = {
    completedMissions: completed.map(r => r.mission_id),
    weakGames: Object.fromEntries(weakRows.map(r => [r.mission_id, r.count])),
  }
  const mastery = getWeltMastery(welt, profile)

  // Missionen pro Level gruppieren
  const byLevel: Record<number, typeof MISSIONS> = {}
  for (const m of MISSIONS) {
    if (!welt.gameTypes.includes(m.type)) continue
    if (!byLevel[m.level]) byLevel[m.level] = []
    byLevel[m.level].push(m)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="rounded-3xl p-6 text-white mb-6 shadow-lg" style={{ background: welt.gradient }}>
        <Link href="/welten" className="text-white/80 text-sm hover:text-white">← Welten</Link>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-5xl">{welt.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{welt.title}</h1>
            <p className="text-white/90">{welt.subtitle}</p>
          </div>
        </div>
      </div>

      {/* NPC + Mastery */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <NPCCard npc={welt.npc} color={welt.color} />
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Dein Rang</p>
          <MasteryBadge rank={mastery.rank} nextRank={mastery.nextRank} progress={mastery.progress} />
          <p className="text-xs text-gray-400 mt-2">{mastery.plays} von {mastery.totalMissions} gespielt</p>
        </div>
      </div>

      {/* Missionen pro Level */}
      {Object.entries(byLevel).sort(([a],[b]) => Number(a) - Number(b)).map(([lvl, missions]) => {
        const meta = LEVEL_LABELS[Number(lvl)]
        return (
          <section key={lvl} className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">{meta?.emoji}</span> {meta?.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {missions.map(m => {
                const done = profile.completedMissions.includes(m.id)
                const route = GAME_ROUTES[m.type] ?? '#'
                return (
                  <Link key={m.id} href={route}
                    className={`flex items-center gap-3 p-4 bg-white rounded-2xl border transition ${done ? 'border-green-300 bg-green-50/50' : 'border-gray-100 hover:border-blue-300 hover:shadow-md'}`}>
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.description}</p>
                    </div>
                    {done && <span className="text-green-600 text-xl">✓</span>}
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </main>
  )
}
