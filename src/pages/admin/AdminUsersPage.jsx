import React, { useEffect, useMemo, useState } from 'react'
import { fetchAllUsers, formatDate, formatRelative } from '../../lib/adminData.js'
import styles from './AdminUsersPage.module.css'

const MODULE_LABEL = {
  kindergarten: 'KiGa',
  volksschule:  'VS',
  hauptschule:  'NMS',
}

const SORTS = {
  xp:        { label: 'XP',      get: (u) => Number(u.xp || 0) },
  stars:     { label: 'Sterne',   get: (u) => Number(u.stars || 0) },
  missions:  { label: 'Spiele',   get: (u) => Array.isArray(u.completedMissions) ? u.completedMissions.length : 0 },
  streak:    { label: 'Streak',   get: (u) => Number(u.streakDays || 0) },
  updatedAt: { label: 'Aktiv',    get: (u) => String(u.updatedAt || '') },
  createdAt: { label: 'Erstellt', get: (u) => String(u.createdAt || '') },
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')       // all | registered | anonymous
  const [module, setModule] = useState('all')       // all | kindergarten | volksschule | hauptschule
  const [sort, setSort]     = useState('updatedAt') // key of SORTS
  const [dir, setDir]       = useState('desc')

  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const all = await fetchAllUsers()
        if (cancelled) return
        setUsers(all)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('[admin-users] load error:', err)
        setError(err?.code || err?.message || 'Unbekannter Fehler')
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    let list = users
    if (filter === 'registered') list = list.filter((u) => !u.isAnonymous)
    if (filter === 'anonymous')  list = list.filter((u) =>  u.isAnonymous)
    if (module !== 'all')        list = list.filter((u) => (u.schoolModule || 'volksschule') === module)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((u) => String(u.name || '').toLowerCase().includes(q) || String(u.uid || u.id || '').toLowerCase().includes(q))
    }
    const cfg = SORTS[sort]
    list = list.slice().sort((a, b) => {
      const av = cfg.get(a)
      const bv = cfg.get(b)
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, filter, module, search, sort, dir])

  function toggleSort(key) {
    if (sort === key) setDir(dir === 'asc' ? 'desc' : 'asc')
    else { setSort(key); setDir('desc') }
  }

  if (loading) return <div className={styles.page}><h1 className={styles.heading}>User</h1><p className={styles.empty}>Lade…</p></div>

  if (error) return (
    <div className={styles.page}>
      <h1 className={styles.heading}>User</h1>
      <div className={styles.errorBox}>
        <strong>Fehler:</strong> {error}
        <p className={styles.errorHint}>Firestore-Rules müssen Admin-Lesezugriff auf <code>/users</code> erlauben.</p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>User <span className={styles.count}>({filtered.length} / {users.length})</span></h1>
      </div>

      {/* Filter-Bar */}
      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="Suche nach Name oder UID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.select}>
          <option value="all">Alle</option>
          <option value="registered">Registriert</option>
          <option value="anonymous">Anonym</option>
        </select>
        <select value={module} onChange={(e) => setModule(e.target.value)} className={styles.select}>
          <option value="all">Alle Stufen</option>
          <option value="kindergarten">Kindergarten</option>
          <option value="volksschule">Volksschule</option>
          <option value="hauptschule">Hauptschule</option>
        </select>
      </div>

      {/* Tabelle */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Stufe</th>
              <SortTh label="XP"       active={sort === 'xp'}        dir={dir} onClick={() => toggleSort('xp')} />
              <SortTh label="Sterne"    active={sort === 'stars'}     dir={dir} onClick={() => toggleSort('stars')} />
              <SortTh label="Spiele"    active={sort === 'missions'}  dir={dir} onClick={() => toggleSort('missions')} />
              <SortTh label="Streak"    active={sort === 'streak'}    dir={dir} onClick={() => toggleSort('streak')} />
              <SortTh label="Aktiv"     active={sort === 'updatedAt'} dir={dir} onClick={() => toggleSort('updatedAt')} />
              <SortTh label="Erstellt"  active={sort === 'createdAt'} dir={dir} onClick={() => toggleSort('createdAt')} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className={styles.empty}>Keine Ergebnisse.</td></tr>
            )}
            {filtered.map((u) => {
              const missions = Array.isArray(u.completedMissions) ? u.completedMissions.length : 0
              return (
                <tr key={u.id} className={styles.row} onClick={() => setSelected(u)}>
                  <td className={styles.userCell}>
                    <span className={styles.avatar}>{u.avatar || '🐬'}</span>
                    <div className={styles.userText}>
                      <div className={styles.userName}>
                        {u.name || 'Gast'}
                        {u.isAnonymous && <span className={styles.anonTag}>anonym</span>}
                      </div>
                      <div className={styles.userUid}>{u.id.slice(0, 12)}…</div>
                    </div>
                  </td>
                  <td>{MODULE_LABEL[u.schoolModule || 'volksschule']}</td>
                  <td className={styles.num}>{Number(u.xp || 0)}</td>
                  <td className={styles.num}>{Number(u.stars || 0)}</td>
                  <td className={styles.num}>{missions}</td>
                  <td className={styles.num}>{Number(u.streakDays || 0)}</td>
                  <td className={styles.date}>{formatRelative(u.updatedAt)}</td>
                  <td className={styles.date}>{formatDate(u.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail-Drawer */}
      {selected && (
        <div className={styles.drawerBackdrop} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerAvatar}>{selected.avatar || '🐬'}</span>
              <div>
                <div className={styles.drawerName}>
                  {selected.name || 'Gast'}
                  {selected.isAnonymous && <span className={styles.anonTag}>anonym</span>}
                </div>
                <div className={styles.drawerUid}>{selected.id}</div>
              </div>
              <button className={styles.drawerClose} onClick={() => setSelected(null)} aria-label="Schließen">✕</button>
            </div>

            <div className={styles.drawerStats}>
              <Stat k="XP"        v={Number(selected.xp || 0)} />
              <Stat k="Sterne"     v={Number(selected.stars || 0)} />
              <Stat k="Missionen"  v={Array.isArray(selected.completedMissions) ? selected.completedMissions.length : 0} />
              <Stat k="Streak"     v={`${Number(selected.streakDays || 0)} T`} />
              <Stat k="Tipps"      v={Number(selected.totalHintsUsed || 0)} />
              <Stat k="Abzeichen"  v={Array.isArray(selected.unlockedBadges) ? selected.unlockedBadges.length : 0} />
            </div>

            <dl className={styles.meta}>
              <dt>Schulstufe</dt><dd>{selected.schoolModule || 'volksschule'}</dd>
              <dt>Account</dt><dd>{selected.isAnonymous ? 'Anonym (Gast)' : 'Registriert'}</dd>
              <dt>Erstellt</dt><dd>{formatDate(selected.createdAt)}</dd>
              <dt>Letzte Aktualisierung</dt><dd>{formatDate(selected.updatedAt)}</dd>
              <dt>Letzter Tag aktiv</dt><dd>{selected.lastActiveDate || '—'}</dd>
            </dl>

            {Array.isArray(selected.completedMissions) && selected.completedMissions.length > 0 && (
              <div className={styles.missionList}>
                <h3>Gespielte Missionen ({selected.completedMissions.length})</h3>
                <div className={styles.chipRow}>
                  {selected.completedMissions.slice(0, 40).map((m) => <span key={m} className={styles.chip}>{m}</span>)}
                  {selected.completedMissions.length > 40 && <span className={styles.chipMore}>+{selected.completedMissions.length - 40}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SortTh({ label, active, dir, onClick }) {
  return (
    <th onClick={onClick} className={`${styles.sortTh} ${active ? styles.sortActive : ''}`}>
      {label}{active && <span className={styles.sortArrow}>{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}
function Stat({ k, v }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statV}>{v}</div>
      <div className={styles.statK}>{k}</div>
    </div>
  )
}
