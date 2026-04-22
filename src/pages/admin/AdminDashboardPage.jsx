import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllUsers, fetchRecentUsers, computeStats, formatRelative } from '../../lib/adminData.js'
import styles from './AdminDashboardPage.module.css'

export default function AdminDashboardPage() {
  const [users, setUsers]       = useState([])
  const [recent, setRecent]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [all, r] = await Promise.all([fetchAllUsers(), fetchRecentUsers(15)])
        if (cancelled) return
        setUsers(all)
        setRecent(r)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('[admin-dashboard] load error:', err)
        setError(err?.code || err?.message || 'Unbekannter Fehler')
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.empty}>Lade Daten…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Dashboard</h1>
        <div className={styles.errorBox}>
          <strong>Fehler beim Laden der User:</strong> {error}
          <p className={styles.errorHint}>
            Stelle sicher, dass die Firestore-Rules Admin-Lesezugriff auf <code>/users</code> erlauben
            und dass deine E-Mail in <code>src/lib/admins.js</code> steht.
          </p>
        </div>
      </div>
    )
  }

  const stats = computeStats(users)

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Dashboard</h1>
        <span className={styles.subtle}>Aktualisiert {new Date().toLocaleTimeString('de-AT')}</span>
      </div>

      {/* KPI-Karten */}
      <section className={styles.kpiGrid}>
        <KPI label="User gesamt"         value={stats.totalUsers}                accent="#4f46e5" />
        <KPI label="Registriert"          value={stats.registered}               accent="#10b981" />
        <KPI label="Anonym (Gast)"        value={stats.anonymous}                accent="#f59e0b" />
        <KPI label="Aktiv heute"          value={stats.activeToday}              accent="#ef4444" />
        <KPI label="Aktiv diese Woche"    value={stats.activeThisWeek}           accent="#ec4899" />
        <KPI label="Missionen gespielt"   value={stats.totalCompletedMissions}   accent="#8b5cf6" />
        <KPI label="XP gesamt"            value={stats.totalXp.toLocaleString('de-AT')} accent="#06b6d4" />
        <KPI label="Abzeichen verliehen"  value={stats.badgeCount}               accent="#f97316" />
        <KPI label="Tipps genutzt"        value={stats.totalHintsUsed}           accent="#64748b" />
        <KPI label="Längste Streak"       value={`${stats.longestStreak} Tage`}  accent="#dc2626" />
      </section>

      {/* Verteilung nach Schulstufe */}
      <section className={styles.splitSection}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Schulstufen-Verteilung</h2>
          <ModuleBar label="Kindergarten"     count={stats.byModule.kindergarten} total={stats.totalUsers} color="#ec4899" />
          <ModuleBar label="Volksschule"      count={stats.byModule.volksschule}  total={stats.totalUsers} color="#4f46e5" />
          <ModuleBar label="Hauptschule/NMS"  count={stats.byModule.hauptschule}  total={stats.totalUsers} color="#f97316" />
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Top 10 nach XP</h2>
          {stats.topByXp.length === 0 && <p className={styles.empty}>Noch keine Spieler.</p>}
          {stats.topByXp.length > 0 && (
            <ol className={styles.topList}>
              {stats.topByXp.map((u, idx) => (
                <li key={u.id} className={styles.topRow}>
                  <span className={styles.topRank}>{idx + 1}</span>
                  <span className={styles.topAvatar}>{u.avatar || '🐬'}</span>
                  <span className={styles.topName}>
                    {u.name || 'Gast'}
                    {u.isAnonymous && <span className={styles.anonTag}>anonym</span>}
                  </span>
                  <span className={styles.topXp}>{Number(u.xp || 0)} XP</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Letzte Aktivität</h2>
          <Link to="/admin/users" className={styles.cardLink}>Alle User →</Link>
        </div>
        {recent.length === 0 && <p className={styles.empty}>Keine Aktivität.</p>}
        {recent.length > 0 && (
          <div className={styles.activityList}>
            {recent.map((u) => (
              <div key={u.id} className={styles.activityRow}>
                <span className={styles.avatar}>{u.avatar || '🐬'}</span>
                <div className={styles.activityInfo}>
                  <div className={styles.activityName}>
                    {u.name || 'Gast'}
                    {u.isAnonymous && <span className={styles.anonTag}>anonym</span>}
                  </div>
                  <div className={styles.activityMeta}>
                    {u.schoolModule || 'volksschule'} · {Number(u.xp || 0)} XP ·
                    {' '}{Array.isArray(u.completedMissions) ? u.completedMissions.length : 0} Missionen
                  </div>
                </div>
                <span className={styles.activityTime}>{formatRelative(u.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function KPI({ label, value, accent }) {
  return (
    <div className={styles.kpiCard} style={{ '--accent': accent }}>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
    </div>
  )
}

function ModuleBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className={styles.moduleRow}>
      <div className={styles.moduleLabel}>
        <span>{label}</span>
        <span className={styles.moduleCount}>{count} · {pct}%</span>
      </div>
      <div className={styles.moduleBar}>
        <div className={styles.moduleBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
