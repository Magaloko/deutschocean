import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import styles from './DashboardPage.module.css'

const GAME_ROUTES = {
  farbenJaeger:         '/app/spiel/farben-jaeger',
  tierGeraeusche:       '/app/spiel/tier-geraeusche',
  memorySpiel:          '/app/spiel/memory',
  wasFehlt:             '/app/spiel/was-fehlt',
  falscherGegenstand:   '/app/spiel/falscher-gegenstand',
  emotionenSpiel:       '/app/spiel/emotionen',
  fehlerDetektiv:       '/app/spiel/fehler-detektiv',
  personenbeschreibung: '/app/spiel/personenbeschreibung',
  diktat:               '/app/spiel/diktat',
  silbenPuzzle:         '/app/spiel/silben-puzzle',
  buchstabenChaos:      '/app/spiel/buchstaben-chaos',
  nomenFinder:          '/app/spiel/nomen-finder',
  satzBuilder:          '/app/spiel/satz-builder',
}

const LEVEL_META = {
  0: { label: 'Für Kleine',  emoji: '🧒', color: '#ec4899' },
  1: { label: 'Anfänger',    emoji: '📚', color: '#4f46e5' },
  2: { label: 'Profi',       emoji: '🏆', color: '#f97316' },
}

function getTagesaufgabe(completed) {
  const uncompleted = MISSIONS.filter((m) => !completed.includes(m.id) && GAME_ROUTES[m.type])
  if (!uncompleted.length) return null
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return uncompleted[dayOfYear % uncompleted.length]
}

export default function DashboardPage() {
  const { profile } = useAuth()

  const xp        = profile?.xp ?? 0
  const stars     = profile?.stars ?? 0
  const badges    = profile?.unlockedBadges ?? []
  const completed = profile?.completedMissions ?? []
  const name      = profile?.name || 'Spieler'
  const level     = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const xpToNext  = 100 - xpInLevel

  const featured = getTagesaufgabe(completed)

  return (
    <div className={`${styles.page} fade-in`}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroWave}>🌊</div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Hallo, {name}! 👋</h1>
          <p className={styles.heroSub}>
            {xp === 0
              ? 'Wähle ein Spiel und leg los!'
              : xpInLevel < 50
                ? `Noch ${xpToNext} XP bis Level ${level + 1}!`
                : `Du bist auf Level ${level} — weiter so!`}
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{xp}</span>
            <span className={styles.heroStatLabel}>⚡ XP</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{stars}</span>
            <span className={styles.heroStatLabel}>⭐ Sterne</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{completed.length}</span>
            <span className={styles.heroStatLabel}>🏅 Spiele</span>
          </div>
        </div>
        <div className={styles.xpBarWrap}>
          <span className={styles.xpBarLabel}>Lvl {level}</span>
          <div style={{ flex: 1 }}>
            <ProgressBar value={xpInLevel} max={100} color="purple" />
          </div>
          <span className={styles.xpBarLabel}>Lvl {level + 1}</span>
        </div>
      </div>

      {/* ── Tagesaufgabe ── */}
      {featured && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredBadge}>⭐ Tagesaufgabe</div>
          <Link
            to={GAME_ROUTES[featured.type]}
            className={styles.featuredCard}
            style={{ '--accent': featured.color }}
          >
            <div className={styles.featuredIcon}>{featured.icon}</div>
            <div className={styles.featuredInfo}>
              <div className={styles.featuredTitle}>{featured.title}</div>
              <div className={styles.featuredDesc}>{featured.description}</div>
              <div className={styles.featuredMeta}>
                <Badge color="purple">+{featured.xp} XP</Badge>
                <span>{'⭐'.repeat(featured.stars)}</span>
              </div>
              <div className={styles.featuredPlayBtn}>▶ JETZT SPIELEN</div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Spiele nach Level ── */}
      {[0, 1, 2].map((lvl) => {
        const missions = MISSIONS.filter((m) => m.level === lvl)
        if (!missions.length) return null
        const meta = LEVEL_META[lvl]
        const doneCount = missions.filter((m) => completed.includes(m.id)).length
        return (
          <section key={lvl}>
            <div className={styles.levelHeader}>
              <div className={styles.levelPill} style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                <span>{meta.emoji}</span>
                <span style={{ color: meta.color, fontWeight: 800 }}>{meta.label}</span>
              </div>
              <span className={styles.levelProgress}>{doneCount}/{missions.length} erledigt</span>
            </div>

            <div className={styles.gameGrid}>
              {missions.map((m) => {
                const done  = completed.includes(m.id)
                const route = GAME_ROUTES[m.type]
                if (!route) return null
                return (
                  <Link key={m.id} to={route} className={styles.gameLink}>
                    <div
                      className={`${styles.gameCard} ${done ? styles.gameCardDone : ''}`}
                      style={{ '--accent': m.color }}
                    >
                      <div className={styles.gameIconBig}>{m.icon}</div>
                      <div className={styles.gameTitle}>{m.title}</div>
                      <div className={styles.gameCardMeta}>
                        <span className={styles.gameStars}>{'⭐'.repeat(m.stars)}</span>
                        <span className={styles.gameXp}>+{m.xp} XP</span>
                      </div>
                      <div className={`${styles.gamePlayBtn} ${done ? styles.gameDoneBtn : ''}`}>
                        {done ? '✓ Gespielt' : '▶ Spielen'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* ── Abzeichen ── */}
      {badges.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>🎖️ Deine Abzeichen</h2>
          <div className={styles.badgeGrid}>
            {BADGES.filter((b) => badges.includes(b.id)).map((b) => (
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
