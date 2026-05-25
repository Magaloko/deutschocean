// src/pages/app/StatsPage.jsx
import React, { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import { WELTEN, GAME_ROUTES, isWeltForModule } from '../../lib/weltenData.js'
import { getWeltMastery } from '../../lib/masteryData.js'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Icon from '../../components/ui/Icon.jsx'
import styles from './StatsPage.module.css'

const LEVEL_LABELS = { 0: 'Für Kleine', 1: 'Anfänger', 2: 'Profi' }

export default function StatsPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const xp        = profile?.xp       ?? 0
  const stars     = profile?.stars    ?? 0
  const streak    = profile?.streakDays ?? 0
  const completed = profile?.completedMissions ?? []
  const badges    = profile?.unlockedBadges    ?? []
  const weakGames   = profile?.weakGames          ?? {}
  const hintsUsed   = profile?.totalHintsUsed    ?? 0
  const schoolModule = profile?.schoolModule || 'volksschule'

  const level     = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const earnedBadges = BADGES.filter(b => badges.includes(b.id))
  const nextBadge    = BADGES.find(b => !badges.includes(b.id))

  // Stats per level
  const levelStats = useMemo(() => {
    return [0, 1, 2].map((lvl) => {
      const all  = MISSIONS.filter(m => m.level === lvl)
      const done = all.filter(m => completed.includes(m.id))
      return { lvl, label: LEVEL_LABELS[lvl], total: all.length, done: done.length }
    }).filter(s => s.total > 0)
  }, [completed])

  // Top 6 most-played game types
  const gameStats = useMemo(() => {
    const map = {}
    for (const m of MISSIONS) {
      if (!map[m.type]) map[m.type] = { title: m.title, icon: m.icon, color: m.color, done: 0, total: 0, weak: false }
      map[m.type].total++
      if (completed.includes(m.id)) map[m.type].done++
      // weakGames populated by Sprint 1 PR — reads from profile.weakGames (Firestore)
      if (weakGames[m.id]) map[m.type].weak = true
    }
    return Object.values(map)
      .filter(g => g.done > 0)
      .sort((a, b) => b.done - a.done)
      .slice(0, 6)
  }, [completed, weakGames])

  const totalGames = useMemo(() => {
    const types = new Set(MISSIONS.map(m => m.type))
    return types.size
  }, [])

  const totalPlayed = useMemo(() => {
    const played = new Set()
    for (const m of MISSIONS) if (completed.includes(m.id)) played.add(m.type)
    return played.size
  }, [completed])

  // ─── ELTERN-SICHT ─────────────────────────────────────────────────────────
  // Mastery pro Welt — sortiert nach Stärke. Stark = hoher Rang + niedriger
  // weak-Ratio. Schwach = hoher weak-Ratio bei vielen Plays.
  const weltInsights = useMemo(() => {
    return WELTEN
      .filter(w => isWeltForModule(w, schoolModule))
      .map(w => ({ welt: w, mastery: getWeltMastery(w, profile) }))
      .filter(wm => wm.mastery.plays > 0)
      .sort((a, b) => b.mastery.plays - a.mastery.plays)
  }, [profile, schoolModule])

  // Konkrete Schwächen: Missionen mit weakGames-Count ≥ 1, absteigend.
  // Wir zeigen die mit dem höchsten Count (am häufigsten unter 60% gelöst).
  const schwaechen = useMemo(() => {
    const out = []
    for (const [missionId, count] of Object.entries(weakGames)) {
      if (count < 1) continue
      const mission = MISSIONS.find(m => m.id === missionId)
      if (!mission) continue
      const route = GAME_ROUTES[mission.type]
      if (!route) continue
      const welt = WELTEN.find(w => w.gameTypes.includes(mission.type))
      out.push({ mission, count, route, welt })
    }
    return out.sort((a, b) => b.count - a.count).slice(0, 5)
  }, [weakGames])

  // Stärken: abgeschlossene Missionen, die NICHT in weakGames sind — also
  // ohne Schwächen-Markierung gemeistert.
  const staerken = useMemo(() => {
    const out = []
    for (const m of MISSIONS) {
      if (!completed.includes(m.id)) continue
      if ((weakGames[m.id] ?? 0) > 0) continue
      const route = GAME_ROUTES[m.type]
      if (!route) continue
      const welt = WELTEN.find(w => w.gameTypes.includes(m.type))
      out.push({ mission: m, route, welt })
    }
    // Nimm nur einen pro Typ damit es divers ist
    const seen = new Set()
    return out.filter(s => {
      if (seen.has(s.mission.type)) return false
      seen.add(s.mission.type)
      return true
    }).slice(0, 5)
  }, [completed, weakGames])

  if (!profile) return null

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app')} aria-label="Zurück">
          <Icon emoji="←" size={22} />
        </button>
        <h1 className={styles.heading}>Mein Fortschritt</h1>
        <div />
      </div>

      {/* Hero stats row */}
      <div className={styles.heroRow}>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{xp}</div>
          <div className={styles.heroLabel}><Icon emoji="⚡" size={14} /> XP gesamt</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{stars}</div>
          <div className={styles.heroLabel}><Icon emoji="⭐" size={14} /> Sterne</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{streak}</div>
          <div className={styles.heroLabel}><Icon emoji="🔥" size={14} /> Tage-Streak</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{totalPlayed}/{totalGames}</div>
          <div className={styles.heroLabel}><Icon emoji="🎮" size={14} /> Spiele</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{hintsUsed}</div>
          <div className={styles.heroLabel}><Icon emoji="💡" size={14} /> Tipps genutzt</div>
        </div>
      </div>

      {/* ─── ELTERN-SICHT: Stärken & Schwächen ─────────────────────────── */}
      {weltInsights.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🌊" size={22} /> Pro Themengebiet
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
            Wo ist das Kind sicher, wo braucht es noch Übung?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {weltInsights.map(({ welt, mastery }) => {
              const weakPct = Math.round(mastery.weakRatio * 100)
              const isStrong = mastery.plays >= 3 && mastery.weakRatio <= 0.25
              const isWeak   = mastery.weakRatio > 0.5
              const status = isStrong ? { emoji: '💪', color: '#10b981', label: 'Stark' }
                          : isWeak   ? { emoji: '🎯', color: '#ef4444', label: 'Noch üben' }
                          :            { emoji: '🌱', color: '#f59e0b', label: 'In Übung' }
              return (
                <Link
                  key={welt.id}
                  to={`/app/welt/${welt.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: '12px',
                    background: '#fff', border: '1px solid #e2e8f0',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{welt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{welt.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {mastery.plays} von {mastery.totalMissions} gespielt
                      {weakPct > 0 && ` · ${weakPct}% mussten wiederholt werden`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.25rem 0.5rem', borderRadius: '999px',
                    background: status.color + '15', color: status.color,
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <span>{status.emoji}</span> {status.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {schwaechen.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🎯" size={22} /> Heute üben
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
            Diese Aufgaben hat das Kind mehrmals unter 60% gelöst — beim Üben wachsen die Stärken am schnellsten.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {schwaechen.map(({ mission, count, route, welt }) => (
              <Link
                key={mission.id}
                to={route}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: '12px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{mission.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{mission.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {welt?.title} · {count}× wiederholungs-bedürftig
                  </div>
                </div>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {staerken.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="💪" size={22} /> Schon gemeistert
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
            Diese Aufgaben hat das Kind ohne Schwächen abgeschlossen — gut fürs Selbstvertrauen!
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {staerken.map(({ mission, route, welt }) => (
              <Link
                key={mission.id}
                to={route}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.7rem', borderRadius: '999px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  textDecoration: 'none', color: '#15803d',
                  fontSize: '0.85rem', fontWeight: 500,
                }}
              >
                <span>{mission.icon}</span> {mission.title}
                {welt && <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>· {welt.title}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Level progress */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon emoji="🏆" size={22} /> Level-Fortschritt
        </h2>
        <div className={styles.levelCard}>
          <div className={styles.levelRow}>
            <span className={styles.levelBig}>Level {level}</span>
            <span className={styles.levelSub}>Noch {100 - xpInLevel} XP bis Level {level + 1}</span>
          </div>
          <ProgressBar value={xpInLevel} max={100} color="purple" />
        </div>
        {nextBadge && (
          <div className={styles.nextBadge}>
            <span className={styles.nextBadgeIcon}>
              <Icon emoji={nextBadge.icon} size={28} color="#f59e0b" />
            </span>
            <div>
              <div className={styles.nextBadgeLabel}>Nächstes Abzeichen: {nextBadge.label}</div>
              <div className={styles.nextBadgeSub}>Bei {nextBadge.xpRequired} XP ({Math.max(0, nextBadge.xpRequired - xp)} noch nötig)</div>
            </div>
          </div>
        )}
      </section>

      {/* Level stats bars */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon emoji="📊" size={22} /> Aufgaben nach Schwierigkeit
        </h2>
        <div className={styles.barList}>
          {levelStats.map(({ lvl, label, total, done }) => (
            <div key={lvl} className={styles.barItem}>
              <div className={styles.barHeader}>
                <span className={styles.barLabel}>{label}</span>
                <span className={styles.barCount}>{done}/{total}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.round((done / total) * 100)}%`,
                    '--bar-color': done === total ? '#10b981' : '#4f46e5',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Most played games */}
      {gameStats.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🎮" size={22} /> Meistgespielte Spiele
          </h2>
          <div className={styles.gameList}>
            {gameStats.map((g) => (
              <div key={g.title} className={styles.gameRow}>
                <span className={styles.gameIcon}>
                  <Icon emoji={g.icon} size={26} color={g.color} />
                </span>
                <div className={styles.gameInfo}>
                  <div className={styles.gameTitle}>
                    {g.title}
                    {g.weak && (
                      <span className={styles.weakTag}>
                        <Icon emoji="⚠️" size={14} /> Üben
                      </span>
                    )}
                  </div>
                  <div className={styles.gameSubTrack}>
                    <div
                      className={styles.gameSubFill}
                      style={{ width: `${Math.round((g.done / g.total) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className={styles.gameDone}>{g.done}/{g.total}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🎖️" size={22} /> Abzeichen ({earnedBadges.length}/{BADGES.length})
          </h2>
          <div className={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <div key={b.id} className={styles.badgeCard}>
                <div className={styles.badgeIcon}>
                  <Icon emoji={b.icon} size={32} color="#f59e0b" />
                </div>
                <div className={styles.badgeName}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
