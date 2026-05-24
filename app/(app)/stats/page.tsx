import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { MISSIONS, BADGES } from '@/lib/game/gameData'
import ProgressBar from '@/components/ui/ProgressBar'

export default async function StatsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const [user, completed, badges, weak] = await Promise.all([
    queryOne<{ xp: number; stars: number; streak_days: number; total_hints: number }>(
      'SELECT xp, stars, streak_days, total_hints FROM sebo.users WHERE id=$1', [userId]),
    query<{ mission_id: string }>('SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1', [userId]),
    query<{ badge_id: string }>('SELECT badge_id FROM sebo.user_badges WHERE user_id=$1', [userId]),
    query<{ mission_id: string; count: number }>('SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1', [userId]),
  ])

  const xp        = user?.xp ?? 0
  const stars     = user?.stars ?? 0
  const streak    = user?.streak_days ?? 0
  const hints     = user?.total_hints ?? 0
  const completedSet = new Set(completed.map(r => r.mission_id))
  const badgeSet     = new Set(badges.map(r => r.badge_id))
  const weakSet      = new Set(weak.filter(w => w.count > 0).map(w => w.mission_id))
  const level     = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const earnedBadges = BADGES.filter(b => badgeSet.has(b.id))
  const nextBadge    = BADGES.find(b => !badgeSet.has(b.id))

  // Per-Level Stats
  const levelStats = [0, 1, 2].map(lvl => {
    const all = MISSIONS.filter(m => m.level === lvl)
    const done = all.filter(m => completedSet.has(m.id))
    return { lvl, total: all.length, done: done.length }
  }).filter(s => s.total > 0)

  // Top Game-Types
  const gameMap: Record<string, { title: string; icon: string; done: number; total: number; weak: boolean }> = {}
  for (const m of MISSIONS) {
    if (!gameMap[m.type]) gameMap[m.type] = { title: m.title, icon: m.icon, done: 0, total: 0, weak: false }
    gameMap[m.type].total++
    if (completedSet.has(m.id)) gameMap[m.type].done++
    if (weakSet.has(m.id)) gameMap[m.type].weak = true
  }
  const topGames = Object.values(gameMap).filter(g => g.done > 0).sort((a, b) => b.done - a.done).slice(0, 6)

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Mein Fortschritt</h1>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatTile color="yellow"  emoji="⚡" value={xp}     label="XP gesamt"   />
        <StatTile color="orange"  emoji="⭐" value={stars}  label="Sterne"      />
        <StatTile color="red"     emoji="🔥" value={streak} label="Tage Streak" />
        <StatTile color="indigo"  emoji="🧩" value={completedSet.size} label="Missionen" />
      </div>

      {/* Level-Progress */}
      <section className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Level {level}</h2>
          <span className="text-sm text-gray-500">{xpInLevel} / 100 XP</span>
        </div>
        <ProgressBar value={xpInLevel} max={100} color="primary" />
      </section>

      {/* Per-Level Stats */}
      {levelStats.length > 0 && (
        <section className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <h2 className="font-bold mb-4">Pro Schwierigkeit</h2>
          <div className="space-y-3">
            {levelStats.map(s => (
              <div key={s.lvl}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{['Für Kleine', 'Anfänger', 'Profi'][s.lvl]}</span>
                  <span className="text-gray-500">{s.done}/{s.total}</span>
                </div>
                <ProgressBar value={(s.done / s.total) * 100} color={s.lvl === 0 ? 'green' : s.lvl === 1 ? 'primary' : 'yellow'} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Games */}
      {topGames.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3">🎮 Meistgespielt</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {topGames.map(g => (
              <div key={g.title} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{g.title}</p>
                  <p className="text-xs text-gray-500">{g.done} von {g.total} Level</p>
                </div>
                {g.weak && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">üben!</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges */}
      <section>
        <h2 className="font-bold mb-3">🎖️ Badges ({earnedBadges.length}/{BADGES.length})</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {BADGES.map(b => {
            const earned = badgeSet.has(b.id)
            return (
              <div key={b.id}
                className={`text-center p-3 rounded-xl border ${earned ? 'bg-white border-yellow-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'}`}
                title={b.description}>
                <div className="text-3xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold">{b.label}</p>
              </div>
            )
          })}
        </div>
        {nextBadge && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            Nächstes Badge: <strong>{nextBadge.label}</strong> bei {nextBadge.xpRequired} XP
          </p>
        )}
      </section>

      <p className="text-xs text-gray-400 mt-6 text-center">{hints} Hinweise insgesamt benutzt</p>
    </main>
  )
}

function StatTile({ color, emoji, value, label }: { color: string; emoji: string; value: number; label: string }) {
  const bg: Record<string, string> = {
    yellow: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
    red:    'bg-red-50 text-red-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  }
  return (
    <div className={`rounded-2xl p-3 text-center ${bg[color]}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  )
}
