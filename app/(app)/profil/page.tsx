import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { BADGES } from '@/lib/game/gameData'
import { WELTEN, isWeltForModule } from '@/lib/game/weltenData'
import { getWeltMastery, getOverallMastery } from '@/lib/game/masteryData'
import ProfileEditForm from './ProfileEditForm'
import MasteryBadge from '@/components/ui/MasteryBadge'
import ProgressBar from '@/components/ui/ProgressBar'

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [user, completed, badges, weakRows] = await Promise.all([
    queryOne<{ email: string; name: string; avatar: string; school_module: string; xp: number; stars: number; streak_days: number }>(
      'SELECT email, name, avatar, school_module, xp, stars, streak_days FROM sebo.users WHERE id=$1', [userId]),
    query<{ mission_id: string }>('SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1', [userId]),
    query<{ badge_id: string }>('SELECT badge_id FROM sebo.user_badges WHERE user_id=$1', [userId]),
    query<{ mission_id: string; count: number }>('SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1', [userId]),
  ])

  if (!user) redirect('/login')

  const xp = user.xp
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const earnedBadges = BADGES.filter(b => badges.some(ub => ub.badge_id === b.id))

  const profile = {
    completedMissions: completed.map(r => r.mission_id),
    weakGames: Object.fromEntries(weakRows.map(r => [r.mission_id, r.count])),
  }
  const overall = getOverallMastery(profile)
  const weltMasteries = WELTEN
    .filter(w => isWeltForModule(w, user.school_module))
    .map(w => ({ welt: w, mastery: getWeltMastery(w, profile) }))
    .filter(wm => wm.mastery.plays > 0)

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl p-6 text-white shadow-lg mb-6 text-center">
        <div className="text-6xl mb-3">{user.avatar || '🐬'}</div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-white/80 text-sm">{user.email}</p>
        <div className="flex justify-center gap-3 mt-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">⚡ {xp} XP</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">⭐ {user.stars}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">🔥 {user.streak_days} Tage</span>
        </div>
      </div>

      {/* Level */}
      <section className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Level {level}</h2>
          <span className="text-sm text-gray-500">{xpInLevel} / 100 XP</span>
        </div>
        <ProgressBar value={xpInLevel} max={100} color="primary" />
      </section>

      {/* Gesamt-Mastery */}
      <section className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <h2 className="font-bold mb-3">🏆 Gesamt-Rang</h2>
        <MasteryBadge rank={overall.rank} size="lg" />
        <p className="text-xs text-gray-400 mt-2">
          {overall.plays} Missionen über {overall.weltCount} {overall.weltCount === 1 ? 'Welt' : 'Welten'}
        </p>
      </section>

      {/* Welt-Mastery */}
      {weltMasteries.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3">🌊 Pro Welt</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {weltMasteries.map(({ welt, mastery }) => (
              <div key={welt.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{welt.icon}</span>
                  <span className="font-semibold">{welt.title}</span>
                </div>
                <MasteryBadge rank={mastery.rank} nextRank={mastery.nextRank} progress={mastery.progress} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold mb-3">🎖️ Deine Badges</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {earnedBadges.map(b => (
              <div key={b.id} className="text-center p-3 bg-white rounded-xl border border-yellow-300 shadow-sm">
                <div className="text-3xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold">{b.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit-Form (Client) */}
      <ProfileEditForm
        initialName={user.name}
        initialAvatar={user.avatar}
        initialModule={user.school_module}
      />
    </main>
  )
}
