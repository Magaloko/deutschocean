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
  fahrzeugLenker:       '/app/spiel/fahrzeug-lenker',
  tierWissen:           '/app/spiel/tier-wissen',
  emojiGeschichte:      '/app/spiel/emoji-geschichte',
  emojiBaukasten:       '/app/spiel/emoji-baukasten',
}

// Welche Level-Abschnitte sind pro Modul sichtbar?
const MODULE_LEVELS = {
  kindergarten: [0],
  volksschule:  [0, 1, 2],
  hauptschule:  [0, 1, 2],
}

// Labels je Modul anpassen
const LEVEL_META = {
  kindergarten: {
    0: { label: 'Meine Spiele', emoji: '🧒', color: '#ec4899' },
  },
  volksschule: {
    0: { label: 'Für Kleine',   emoji: '🧒', color: '#ec4899' },
    1: { label: 'Anfänger',     emoji: '📚', color: '#4f46e5' },
    2: { label: 'Profi',        emoji: '🏆', color: '#f97316' },
  },
  hauptschule: {
    0: { label: 'Aufwärmen',    emoji: '🎯', color: '#ec4899' },
    1: { label: 'Grundstufe',   emoji: '📚', color: '#4f46e5' },
    2: { label: 'Mittelstufe',  emoji: '🏆', color: '#f97316' },
  },
}

const MODULE_META = {
  kindergarten: { emoji: '🧒', label: 'Kindergarten',    color: '#ec4899' },
  volksschule:  { emoji: '📚', label: 'Volksschule',      color: '#4f46e5' },
  hauptschule:  { emoji: '🎓', label: 'Hauptschule/NMS',  color: '#f97316' },
}

// Deduplicate: one entry per game type per level category
function getUniqueGames(level, completed) {
  const seen = new Set()
  const unique = []
  for (const m of MISSIONS) {
    if (m.level !== level || !GAME_ROUTES[m.type]) continue
    if (seen.has(m.type)) continue
    seen.add(m.type)
    const variants = MISSIONS.filter((v) => v.level === level && v.type === m.type)
    const completedCount = variants.filter((v) => completed.includes(v.id)).length
    unique.push({ ...m, variants, completedCount })
  }
  return unique
}

function getTagesaufgabe(completed) {
  const all = []
  for (const m of MISSIONS) {
    if (!GAME_ROUTES[m.type]) continue
    const alreadySeen = all.find((g) => g.type === m.type)
    if (!alreadySeen) all.push(m)
  }
  const uncompleted = all.filter((m) => !completed.includes(m.id))
  if (!uncompleted.length) return null
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return uncompleted[dayOfYear % uncompleted.length]
}

export default function DashboardPage() {
  const { profile } = useAuth()

  const xp           = profile?.xp ?? 0
  const stars        = profile?.stars ?? 0
  const badges       = profile?.unlockedBadges ?? []
  const completed    = profile?.completedMissions ?? []
  const name         = profile?.name || 'Spieler'
  const schoolModule = profile?.schoolModule || 'volksschule'
  const level        = Math.floor(xp / 100) + 1
  const xpInLevel    = xp % 100
  const xpToNext     = 100 - xpInLevel

  const allowedLevels = MODULE_LEVELS[schoolModule] ?? [0, 1, 2]
  const levelMeta     = LEVEL_META[schoolModule] ?? LEVEL_META.volksschule
  const moduleMeta    = MODULE_META[schoolModule]

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
          <div className={styles.modulePill} style={{ background: `${moduleMeta.color}20`, color: moduleMeta.color }}>
            {moduleMeta.emoji} {moduleMeta.label}
          </div>
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
            <span className={styles.heroStatLabel}>🏅 Gespielt</span>
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
              </div>
              <div className={styles.featuredPlayBtn}>▶ JETZT SPIELEN</div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Spiele nach Kategorie ── */}
      {allowedLevels.map((lvl) => {
        const games = getUniqueGames(lvl, completed)
        if (!games.length) return null
        const meta = levelMeta[lvl] ?? { label: `Level ${lvl}`, emoji: '📖', color: '#6b7280' }
        const totalVariants = games.reduce((s, g) => s + g.variants.length, 0)
        const doneVariants  = games.reduce((s, g) => s + g.completedCount, 0)
        return (
          <section key={lvl}>
            <div className={styles.levelHeader}>
              <div className={styles.levelPill} style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                <span>{meta.emoji}</span>
                <span style={{ color: meta.color, fontWeight: 800 }}>{meta.label}</span>
              </div>
              <span className={styles.levelProgress}>{doneVariants}/{totalVariants} erledigt</span>
            </div>

            <div className={styles.gameGrid}>
              {games.map((g) => {
                const route = GAME_ROUTES[g.type]
                const anyDone = g.completedCount > 0
                const allDone = g.completedCount >= g.variants.length
                return (
                  <Link key={g.type} to={route} className={styles.gameLink}>
                    <div
                      className={`${styles.gameCard} ${allDone ? styles.gameCardDone : anyDone ? styles.gameCardPartial : ''}`}
                      style={{ '--accent': g.color }}
                    >
                      <div className={styles.gameIconBig}>{g.icon}</div>
                      <div className={styles.gameTitle}>{g.title}</div>

                      {/* Schwierigkeits-Punkte wenn mehrere Varianten */}
                      {g.variants.length > 1 && (
                        <div className={styles.diffDots}>
                          {g.variants.map((v, i) => (
                            <div
                              key={v.id}
                              className={`${styles.diffDot} ${completed.includes(v.id) ? styles.diffDotDone : ''}`}
                              title={`Level ${i + 1}: ${completed.includes(v.id) ? 'gespielt' : 'offen'}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className={styles.gameCardMeta}>
                        <span className={styles.gameXp}>+{g.xp} XP</span>
                      </div>
                      <div className={`${styles.gamePlayBtn} ${allDone ? styles.gameDoneBtn : anyDone ? styles.gamePartialBtn : ''}`}>
                        {allDone ? '✓ Alle gespielt' : anyDone ? `${g.completedCount}/${g.variants.length} gespielt` : '▶ Spielen'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* ── Hauptschule: Kommt bald ── */}
      {schoolModule === 'hauptschule' && (
        <section>
          <div className={styles.levelHeader}>
            <div className={styles.levelPill} style={{ background: '#f5f3ff', border: '2px solid #c4b5fd' }}>
              <span>🚀</span>
              <span style={{ color: '#7c3aed', fontWeight: 800 }}>Oberstufe</span>
            </div>
            <span className={styles.levelProgress}>Kommt bald</span>
          </div>
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonEmoji}>🏗️</span>
            <p className={styles.comingSoonText}>
              Aufsatz-Trainer, Grammatik-Analyse und mehr — in Kürze verfügbar!
            </p>
          </div>
        </section>
      )}

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
