// src/pages/app/StatsPage.jsx
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import styles from './StatsPage.module.css'

const LEVEL_LABELS = { 0: 'Für Kleine', 1: 'Anfänger', 2: 'Profi' }

export default function StatsPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  if (!profile) return null

  const xp        = profile.xp       ?? 0
  const stars     = profile.stars    ?? 0
  const streak    = profile.streakDays ?? 0
  const completed = profile.completedMissions ?? []
  const badges    = profile.unlockedBadges    ?? []
  const weakGames = profile.weakGames          ?? {}

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

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
        <h1 className={styles.heading}>Mein Fortschritt</h1>
        <div />
      </div>

      {/* Hero stats row */}
      <div className={styles.heroRow}>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{xp}</div>
          <div className={styles.heroLabel}>⚡ XP gesamt</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{stars}</div>
          <div className={styles.heroLabel}>⭐ Sterne</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{streak}</div>
          <div className={styles.heroLabel}>🔥 Tage-Streak</div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroNum}>{totalPlayed}/{totalGames}</div>
          <div className={styles.heroLabel}>🎮 Spiele</div>
        </div>
      </div>

      {/* Level progress */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🏆 Level-Fortschritt</h2>
        <div className={styles.levelCard}>
          <div className={styles.levelRow}>
            <span className={styles.levelBig}>Level {level}</span>
            <span className={styles.levelSub}>Noch {100 - xpInLevel} XP bis Level {level + 1}</span>
          </div>
          <ProgressBar value={xpInLevel} max={100} color="purple" />
        </div>
        {nextBadge && (
          <div className={styles.nextBadge}>
            <span className={styles.nextBadgeIcon}>{nextBadge.icon}</span>
            <div>
              <div className={styles.nextBadgeLabel}>Nächstes Abzeichen: {nextBadge.label}</div>
              <div className={styles.nextBadgeSub}>Bei {nextBadge.xpRequired} XP ({Math.max(0, nextBadge.xpRequired - xp)} noch nötig)</div>
            </div>
          </div>
        )}
      </section>

      {/* Level stats bars */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📊 Aufgaben nach Schwierigkeit</h2>
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
          <h2 className={styles.sectionTitle}>🎮 Meistgespielte Spiele</h2>
          <div className={styles.gameList}>
            {gameStats.map((g) => (
              <div key={g.title} className={styles.gameRow}>
                <span className={styles.gameIcon}>{g.icon}</span>
                <div className={styles.gameInfo}>
                  <div className={styles.gameTitle}>
                    {g.title}
                    {g.weak && <span className={styles.weakTag}>⚠️ Üben</span>}
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
          <h2 className={styles.sectionTitle}>🎖️ Abzeichen ({earnedBadges.length}/{BADGES.length})</h2>
          <div className={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <div key={b.id} className={styles.badgeCard}>
                <div className={styles.badgeIcon}>{b.icon}</div>
                <div className={styles.badgeName}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
