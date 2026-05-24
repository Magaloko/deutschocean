import { query, queryOne } from '@/lib/db/client'

export default async function AdminDashboard() {
  const [counts, topUsers, recentSessions] = await Promise.all([
    queryOne<{
      total_users: number; active_today: number; active_week: number
      total_xp: number; total_missions: number; total_posts: number
    }>(`
      SELECT
        (SELECT COUNT(*) FROM sebo.users) AS total_users,
        (SELECT COUNT(*) FROM sebo.users WHERE last_active = CURRENT_DATE) AS active_today,
        (SELECT COUNT(*) FROM sebo.users WHERE last_active >= CURRENT_DATE - INTERVAL '7 days') AS active_week,
        (SELECT COALESCE(SUM(xp), 0) FROM sebo.users) AS total_xp,
        (SELECT COUNT(*) FROM sebo.completed_missions) AS total_missions,
        (SELECT COUNT(*) FROM sebo.posts WHERE published=true) AS total_posts
    `),
    query<{ id: string; name: string; avatar: string; xp: number; streak_days: number }>(
      `SELECT id, name, avatar, xp, streak_days FROM sebo.users
       ORDER BY xp DESC LIMIT 10`
    ),
    query<{ mission_id: string; n: number }>(
      `SELECT mission_id, COUNT(*)::int as n FROM sebo.game_sessions
       WHERE completed_at >= now() - INTERVAL '7 days'
       GROUP BY mission_id ORDER BY n DESC LIMIT 8`
    ),
  ])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <Tile label="Users"           value={counts?.total_users ?? 0}    icon="👤" />
        <Tile label="Heute aktiv"     value={counts?.active_today ?? 0}   icon="🔥" />
        <Tile label="Diese Woche"     value={counts?.active_week ?? 0}    icon="📅" />
        <Tile label="XP gesamt"       value={counts?.total_xp ?? 0}       icon="⚡" />
        <Tile label="Missionen done"  value={counts?.total_missions ?? 0} icon="🏆" />
        <Tile label="Blog-Posts"      value={counts?.total_posts ?? 0}    icon="📖" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold mb-3">🏆 Top 10 nach XP</h2>
          <table className="w-full text-sm">
            <tbody>
              {topUsers.map((u, i) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-gray-400 w-6">{i+1}</td>
                  <td className="py-2 text-xl w-10">{u.avatar || '🐬'}</td>
                  <td className="py-2 font-semibold">{u.name}</td>
                  <td className="py-2 text-right text-yellow-600 font-semibold">{u.xp} XP</td>
                  <td className="py-2 text-right text-orange-500">🔥 {u.streak_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Top Sessions */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold mb-3">🎮 Meistgespielte Missionen (7 Tage)</h2>
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div key={s.mission_id} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium">{s.mission_id}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{s.n}×</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Tile({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-bold">{value.toLocaleString('de-DE')}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
