import { query } from '@/lib/db/client'

interface AdminUser {
  id: string; email: string; name: string; avatar: string
  school_module: string; xp: number; stars: number; streak_days: number
  last_active: string | null; created_at: string; is_admin: boolean
  completed_count: number; badge_count: number
}

export default async function AdminUsersPage() {
  const users = await query<AdminUser>(`
    SELECT u.id, u.email, u.name, u.avatar, u.school_module, u.xp, u.stars, u.streak_days,
           u.last_active, u.created_at, u.is_admin,
           (SELECT COUNT(*) FROM sebo.completed_missions WHERE user_id=u.id)::int as completed_count,
           (SELECT COUNT(*) FROM sebo.user_badges WHERE user_id=u.id)::int as badge_count
    FROM sebo.users u ORDER BY u.created_at DESC LIMIT 200
  `)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">Users</h1>
      <p className="text-gray-500 mb-6">{users.length} insgesamt</p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Name / Email</th>
              <th className="px-4 py-3">Modul</th>
              <th className="px-4 py-3 text-right">XP</th>
              <th className="px-4 py-3 text-right">🔥</th>
              <th className="px-4 py-3 text-right">Done</th>
              <th className="px-4 py-3 text-right">🎖</th>
              <th className="px-4 py-3">Aktiv</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-2xl">{u.avatar || '🐬'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold flex items-center gap-1">
                    {u.name}
                    {u.is_admin && <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Admin</span>}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-xs">{u.school_module}</td>
                <td className="px-4 py-3 text-right font-semibold text-yellow-600">{u.xp}</td>
                <td className="px-4 py-3 text-right">{u.streak_days}</td>
                <td className="px-4 py-3 text-right">{u.completed_count}</td>
                <td className="px-4 py-3 text-right">{u.badge_count}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {u.last_active ? new Date(u.last_active).toLocaleDateString('de-DE') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
