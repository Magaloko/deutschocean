import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { isDue } from '@/lib/learning/spacedRepetition'
import type { DashboardProfile } from '@/types'

async function getDashboardData(userId: string): Promise<DashboardProfile> {
  const [user, completed, badges, sr, weak] = await Promise.all([
    queryOne<DashboardProfile>(
      `SELECT id, email, name, avatar, school_module as "schoolModule", is_admin as "isAdmin",
              xp, stars, streak_days as "streakDays", last_active as "lastActive",
              total_hints as "totalHints", created_at as "createdAt"
       FROM sebo.users WHERE id=$1`,
      [userId]
    ),
    query<{ mission_id: string }>(
      'SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1',
      [userId]
    ),
    query<{ badge_id: string }>(
      'SELECT badge_id FROM sebo.user_badges WHERE user_id=$1',
      [userId]
    ),
    query<{ mission_id: string; interval: number; ease_factor: string; repetitions: number; next_due: string }>(
      'SELECT mission_id, interval, ease_factor, repetitions, next_due FROM sebo.spaced_repetition WHERE user_id=$1',
      [userId]
    ),
    query<{ mission_id: string; count: number }>(
      'SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1',
      [userId]
    ),
  ])

  if (!user) redirect('/login')

  return {
    ...user,
    completedMissions: completed.map(r => r.mission_id),
    unlockedBadges: badges.map(r => r.badge_id),
    spacedRepetition: sr.map(r => ({
      missionId: r.mission_id,
      interval: r.interval,
      easeFactor: Number(r.ease_factor),
      repetitions: r.repetitions,
      nextDue: r.next_due,
    })),
    weakGames: weak.map(r => ({ missionId: r.mission_id, count: r.count })),
    campaignProgress: [],
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await getDashboardData(session.user.id)
  const dueReviews = profile.spacedRepetition.filter(sr => isDue(sr.nextDue))

  const xpForNextLevel = Math.ceil((Math.floor(profile.xp / 500) + 1) * 500)
  const xpProgress = ((profile.xp % 500) / 500) * 100

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">
          Hallo, {profile.name}! 👋
        </h1>
        <div className="flex gap-6 mt-4 text-sm text-blue-700">
          <span>⭐ {profile.stars} Sterne</span>
          <span>🔥 {profile.streakDays} Tage Streak</span>
          <span>🏆 {profile.completedMissions.length} Missionen</span>
        </div>

        {/* XP Fortschrittsbalken */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{profile.xp} XP</span>
            <span>Nächstes Level: {xpForNextLevel} XP</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Wiederholungen fällig */}
      {dueReviews.length > 0 && (
        <section className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-semibold text-amber-800 mb-2">
            📚 {dueReviews.length} Wiederholung{dueReviews.length > 1 ? 'en' : ''} fällig
          </h2>
          <div className="flex flex-wrap gap-2">
            {dueReviews.slice(0, 4).map(sr => (
              <a
                key={sr.missionId}
                href={`/spiel/${sr.missionId}`}
                className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-sm hover:bg-amber-200 transition"
              >
                {sr.missionId}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Badges */}
      {profile.unlockedBadges.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">🎖 Deine Badges</h2>
          <div className="flex flex-wrap gap-2">
            {profile.unlockedBadges.map(badge => (
              <span
                key={badge}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Navigation zu Spielen */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">🎮 Spielen</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: '/welten', label: 'Welten', emoji: '🌊' },
            { href: '/missionen', label: 'Missionen', emoji: '🗺️' },
            { href: '/chat', label: 'Ozzy fragen', emoji: '🐋' },
            { href: '/profil', label: 'Mein Profil', emoji: '👤' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-medium text-gray-800">{item.label}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
