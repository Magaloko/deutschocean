import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Button from '../../components/ui/Button.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import styles from './DashboardPage.module.css'

const GAME_ROUTES = {
  fehlerDetektiv:       '/app/spiel/fehler-detektiv',
  personenbeschreibung: '/app/spiel/personenbeschreibung',
  diktat:               '/app/spiel/diktat',
  silbenPuzzle:         '/app/spiel/silben-puzzle',
  buchstabenChaos:      '/app/spiel/buchstaben-chaos',
  nomenFinder:          '/app/spiel/nomen-finder',
}

export default function DashboardPage() {
  const { user, profile } = useAuth()

  const xp            = profile?.xp ?? 0
  const stars         = profile?.stars ?? 0
  const badges        = profile?.unlockedBadges ?? []
  const completed     = profile?.completedMissions ?? []
  const nextLevelXP   = Math.ceil((xp + 1) / 100) * 100
  const xpToNextLevel = nextLevelXP - xp
  const level         = Math.floor(xp / 100) + 1

  const todayMissions = MISSIONS.slice(0, 3)

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Willkommens-Header */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.greeting}>
            Hallo, {user?.displayName || 'Lernprofi'}! 👋
          </h1>
          <p className={styles.sub}>Heute schon gelernt? Deine tägliche Mission wartet!</p>
        </div>
        <div className={styles.levelBadge}>
          <span className={styles.levelNum}>Lvl {level}</span>
        </div>
      </div>

      {/* Kennzahlen-Leiste */}
      <div className={styles.statsRow}>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statValue}>{stars}</div>
          <div className={styles.statLabel}>Sterne</div>
        </Card>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statValue}>{xp}</div>
          <div className={styles.statLabel}>XP gesamt</div>
        </Card>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statValue}>{completed.length}</div>
          <div className={styles.statLabel}>Missionen</div>
        </Card>
        <Card padding="md" className={styles.statCard}>
          <div className={styles.statIcon}>🎖️</div>
          <div className={styles.statValue}>{badges.length}</div>
          <div className={styles.statLabel}>Abzeichen</div>
        </Card>
      </div>

      {/* XP Fortschritt */}
      <Card padding="md">
        <div className={styles.xpHeader}>
          <span className={styles.xpLabel}>Level {level} Fortschritt</span>
          <span className={styles.xpHint}>Noch {xpToNextLevel} XP bis Level {level + 1}</span>
        </div>
        <ProgressBar value={xp % 100} max={100} color="purple" />
      </Card>

      {/* Tages-Missionen */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Heutige Missionen</h2>
          <Link to="/app/missionen">
            <Button variant="ghost" size="sm">Alle ansehen →</Button>
          </Link>
        </div>
        <div className={styles.missionGrid}>
          {todayMissions.map((m) => {
            const done = completed.includes(m.id)
            return (
              <Link key={m.id} to={GAME_ROUTES[m.type]} className={styles.missionLink}>
                <Card hoverable padding="md" className={`${styles.missionCard} ${done ? styles.done : ''}`}>
                  <div className={styles.missionIcon} style={{ background: `${m.color}20` }}>
                    {m.icon}
                  </div>
                  <div className={styles.missionInfo}>
                    <div className={styles.missionTitle}>{m.title}</div>
                    <div className={styles.missionDesc}>{m.description}</div>
                    <div className={styles.missionRewards}>
                      <Badge color="purple">+{m.xp} XP</Badge>
                      <Badge color="yellow">{'⭐'.repeat(m.stars)}</Badge>
                      {done && <Badge color="green">Erledigt!</Badge>}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Abzeichen */}
      {badges.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Deine Abzeichen</h2>
          <div className={styles.badgeGrid}>
            {BADGES.filter((b) => badges.includes(b.id)).map((b) => (
              <Card key={b.id} padding="sm" className={styles.badgeCard}>
                <div className={styles.badgeIcon}>{b.icon}</div>
                <div className={styles.badgeName}>{b.label}</div>
                <div className={styles.badgeDesc}>{b.description}</div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
