import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useRecommendedPosts } from '../../hooks/useRecommendedPosts.js'
import PostCard from '../../components/blog/PostCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import { isDueToday } from '../../lib/spacedRepetition.js'
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
  emotionenKarten:      '/app/spiel/emotionen-karten',
  fruechtZaehlen:       '/app/spiel/fruechtZaehlen',
  regelRaupe:           '/app/spiel/regel-raupe',
  wortFamilien:         '/app/spiel/wort-familien',
}

const MATHE_GAME_ROUTES = {
  zahlenstrahl:    '/app/mathe/zahlenstrahl',
  mehrWeniger:     '/app/mathe/mehr-weniger',
  minusRakete:     '/app/mathe/minus-rakete',
  zahlenfolge:     '/app/mathe/zahlenfolge',
  wuerfelRechnen:  '/app/mathe/wuerfel-rechnen',
  miniMarkt:       '/app/mathe/mini-markt',
  einmaleinsBlitz: '/app/mathe/einmaleins',
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

const MATHE_LEVEL_META = {
  kindergarten: {
    0: { label: 'Meine Mathe-Spiele', emoji: '🔢', color: '#6366f1' },
  },
  volksschule: {
    0: { label: 'Zahlen & Zählen',  emoji: '🔢', color: '#6366f1' },
    1: { label: 'Rechnen',           emoji: '➕', color: '#f97316' },
    2: { label: 'Profi-Rechnen',     emoji: '✖️', color: '#ef4444' },
  },
  hauptschule: {
    0: { label: 'Aufwärmen',         emoji: '🔢', color: '#6366f1' },
    1: { label: 'Grundrechnen',      emoji: '➕', color: '#f97316' },
    2: { label: 'Mittelstufe',       emoji: '✖️', color: '#ef4444' },
  },
}

const MATHE_TYPES = new Set([
  'zahlenstrahl','mehrWeniger','minusRakete',
  'zahlenfolge','wuerfelRechnen','miniMarkt','einmaleinsBlitz',
])

function getUniqueMatheGames(level, completed) {
  const seen = new Set()
  const unique = []
  for (const m of MISSIONS) {
    if (m.level !== level || !MATHE_TYPES.has(m.type)) continue
    if (seen.has(m.type)) continue
    seen.add(m.type)
    const variants = MISSIONS.filter((v) => v.level === level && v.type === m.type)
    const completedCount = variants.filter((v) => completed.includes(v.id)).length
    unique.push({ ...m, variants, completedCount })
  }
  return unique
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

// A level is unlocked if:
// - It's level 0 (always unlocked)
// - OR the previous level has at least 1 completed mission
function isLevelUnlocked(lvl, allLeveledGames) {
  if (lvl === 0) return true
  const prevGames = allLeveledGames[lvl - 1] ?? []
  return prevGames.some((g) => g.completedCount > 0)
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const weakGames = profile?.weakGames ?? {}

  const xp           = profile?.xp ?? 0
  const stars        = profile?.stars ?? 0
  const streakDays   = profile?.streakDays ?? 0
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

  const [activeTab, setActiveTab]   = useState('deutsch')
  const recommendedPosts            = useRecommendedPosts(profile)

  const spacedRepetition = profile?.spacedRepetition ?? {}

  // Missions due for review today
  const dueForReview = useMemo(() => {
    return MISSIONS.filter((m) => {
      const sr = spacedRepetition[m.id]
      return sr && isDueToday(sr.nextReview) && GAME_ROUTES[m.type]
    }).slice(0, 4)  // max 4 at a time
  }, [spacedRepetition])

  const featured      = useMemo(() => getTagesaufgabe(completed), [completed])
  const leveledGames  = useMemo(
    () => Object.fromEntries(allowedLevels.map((lvl) => [lvl, getUniqueGames(lvl, completed)])),
    [allowedLevels, completed],
  )
  const mathedLeveledGames = useMemo(
    () => Object.fromEntries(allowedLevels.map((lvl) => [lvl, getUniqueMatheGames(lvl, completed)])),
    [allowedLevels, completed],
  )

  return (
    <div className={`${styles.page} fade-in`}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroWave}>🌊</div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Hallo, {name}! 👋</h1>
          <p className={styles.heroSub}>
            {streakDays >= 3
              ? `🔥 ${streakDays} Tage in Folge — unaufhaltbar!`
              : xp === 0
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
          {streakDays > 0 && (
            <>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{streakDays}</span>
                <span className={styles.heroStatLabel}>🔥 Tage</span>
              </div>
            </>
          )}
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
              <button type="button" className={styles.featuredPlayBtn}>▶ JETZT SPIELEN</button>
            </div>
          </Link>
        </section>
      )}

      {/* ── Zum Wiederholen ── */}
      {dueForReview.length > 0 && (
        <section className={styles.reviewSection}>
          <div className={styles.reviewHeader}>
            <span className={styles.reviewLabel}>🔁 Heute wiederholen</span>
            <span className={styles.reviewCount}>{dueForReview.length} fällig</span>
          </div>
          <div className={styles.reviewGrid}>
            {dueForReview.map((m) => (
              <Link key={m.id} to={GAME_ROUTES[m.type]} className={styles.reviewCard}>
                <span className={styles.reviewIcon}>{m.icon}</span>
                <span className={styles.reviewTitle}>{m.title}</span>
                <span className={styles.reviewArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Artikel-Empfehlungen ── */}
      {recommendedPosts.length > 0 && (
        <section className={styles.recommendedSection}>
          <div className={styles.recommendedHeader}>
            <span className={styles.recommendedLabel}>📚 Für dich empfohlen</span>
            <Link to="/app/blog" className={styles.recommendedAll}>Alle Artikel →</Link>
          </div>
          <div className={styles.recommendedGrid}>
            {recommendedPosts.map(post => (
              <PostCard key={post.id} post={post} href={`/app/blog/${post.slug}`} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'deutsch' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('deutsch')}
        >📚 Deutsch</button>
        <button
          className={`${styles.tab} ${activeTab === 'mathe' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('mathe')}
        >🔢 Mathe</button>
      </div>

      {/* ── Deutsch Tab ── */}
      {activeTab === 'deutsch' && allowedLevels.map((lvl) => {
        const games = leveledGames[lvl]
        if (!games.length) return null
        const meta = levelMeta[lvl] ?? { label: `Level ${lvl}`, emoji: '📖', color: '#6b7280' }
        const totalVariants = games.reduce((s, g) => s + g.variants.length, 0)
        const doneVariants  = games.reduce((s, g) => s + g.completedCount, 0)
        const unlocked = isLevelUnlocked(lvl, leveledGames)
        return (
          <section key={lvl}>
            <div className={styles.levelHeader}>
              <div className={styles.levelPill} style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                <span>{meta.emoji}</span>
                <span style={{ color: meta.color, fontWeight: 800 }}>{meta.label}</span>
              </div>
              <span className={styles.levelProgress}>{doneVariants}/{totalVariants} erledigt</span>
              {!unlocked && <span className={styles.levelLockBadge}>🔒 Noch gesperrt</span>}
            </div>
            <ProgressBar value={doneVariants} max={totalVariants} color="green" />

            <div className={styles.gameGrid}>
              {games.map((g) => {
                if (!unlocked) {
                  return (
                    <div
                      key={g.type}
                      className={`${styles.gameLink} ${styles.gameLinkLocked}`}
                      aria-hidden="true"
                    >
                      <div className={`${styles.gameCard} ${styles.gameCardLocked}`} style={{ '--accent': g.color }}>
                        <div className={styles.lockOverlay}>
                          <span className={styles.lockIcon}>🔒</span>
                          <span className={styles.lockHint}>Vorherige Aufgaben lösen!</span>
                        </div>
                        <div className={styles.gameIconBig} style={{ opacity: 0.35 }}>{g.icon}</div>
                        <div className={styles.gameTitle} style={{ opacity: 0.35 }}>{g.title}</div>
                        <div className={styles.gameCardMeta} style={{ opacity: 0.35 }}>
                          <span className={styles.gameXp}>+{g.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                const route = GAME_ROUTES[g.type]
                const anyDone = g.completedCount > 0
                const allDone = g.completedCount >= g.variants.length
                return (
                  <Link key={g.type} to={route} className={styles.gameLink}>
                    <div
                      className={`${styles.gameCard} ${allDone ? styles.gameCardDone : anyDone ? styles.gameCardPartial : ''}`}
                      style={{ '--accent': g.color }}
                    >
                      {weakGames[g.id] >= 2 && (
                        <span className={styles.weakIndicator} title="Mehr üben!">⚠️</span>
                      )}
                      {(weakGames[g.id] ?? 0) > 0 && (
                        <span className={styles.difficultyBadge}>🟢 Leicht-Modus aktiv</span>
                      )}
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
                      <button type="button" className={`${styles.gamePlayBtn} ${allDone ? styles.gameDoneBtn : anyDone ? styles.gamePartialBtn : ''}`}>
                        {allDone ? '✓ Alle gespielt' : anyDone ? `${g.completedCount}/${g.variants.length} gespielt` : '▶ Spielen'}
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* ── Hauptschule: Kommt bald ── */}
      {activeTab === 'deutsch' && schoolModule === 'hauptschule' && (
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

      {/* ── Mathe Tab ── */}
      {activeTab === 'mathe' && (
        <>
          {allowedLevels.map((lvl) => {
            const games = mathedLeveledGames[lvl]
            if (!games.length) return null
            const meta = (MATHE_LEVEL_META[schoolModule] ?? MATHE_LEVEL_META.volksschule)[lvl]
                      ?? { label: `Level ${lvl}`, emoji: '🔢', color: '#6366f1' }
            const totalVariants = games.reduce((s, g) => s + g.variants.length, 0)
            const doneVariants  = games.reduce((s, g) => s + g.completedCount, 0)
            const unlocked = isLevelUnlocked(lvl, mathedLeveledGames)
            return (
              <section key={lvl}>
                <div className={styles.levelHeader}>
                  <div className={styles.levelPill} style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                    <span>{meta.emoji}</span>
                    <span style={{ color: meta.color, fontWeight: 800 }}>{meta.label}</span>
                  </div>
                  <span className={styles.levelProgress}>{doneVariants}/{totalVariants} erledigt</span>
                  {!unlocked && <span className={styles.levelLockBadge}>🔒 Noch gesperrt</span>}
                </div>
                <ProgressBar value={doneVariants} max={totalVariants} color="green" />
                <div className={styles.gameGrid}>
                  {games.map((g) => {
                    if (!unlocked) {
                      return (
                        <div
                          key={g.type}
                          className={`${styles.gameLink} ${styles.gameLinkLocked}`}
                          aria-hidden="true"
                        >
                          <div className={`${styles.gameCard} ${styles.gameCardLocked}`} style={{ '--accent': g.color }}>
                            <div className={styles.lockOverlay}>
                              <span className={styles.lockIcon}>🔒</span>
                              <span className={styles.lockHint}>Vorherige Aufgaben lösen!</span>
                            </div>
                            <div className={styles.gameIconBig} style={{ opacity: 0.35 }}>{g.icon}</div>
                            <div className={styles.gameTitle} style={{ opacity: 0.35 }}>{g.title}</div>
                            <div className={styles.gameCardMeta} style={{ opacity: 0.35 }}>
                              <span className={styles.gameXp}>+{g.xp} XP</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    const route = MATHE_GAME_ROUTES[g.type]
                    const anyDone = g.completedCount > 0
                    const allDone = g.completedCount >= g.variants.length
                    return (
                      <Link key={g.type} to={route} className={styles.gameLink}>
                        <div
                          className={`${styles.gameCard} ${allDone ? styles.gameCardDone : anyDone ? styles.gameCardPartial : ''}`}
                          style={{ '--accent': g.color }}
                        >
                          {weakGames[g.id] >= 2 && (
                            <span className={styles.weakIndicator} title="Mehr üben!">⚠️</span>
                          )}
                          {(weakGames[g.id] ?? 0) > 0 && (
                            <span className={styles.difficultyBadge}>🟢 Leicht-Modus aktiv</span>
                          )}
                          <div className={styles.gameIconBig}>{g.icon}</div>
                          <div className={styles.gameTitle}>{g.title}</div>
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
                          <button type="button" className={`${styles.gamePlayBtn} ${allDone ? styles.gameDoneBtn : anyDone ? styles.gamePartialBtn : ''}`}>
                            {allDone ? '✓ Alle gespielt' : anyDone ? `${g.completedCount}/${g.variants.length} gespielt` : '▶ Spielen'}
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
          {(!mathedLeveledGames[0]?.length && !mathedLeveledGames[1]?.length && !mathedLeveledGames[2]?.length) && (
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonEmoji}>⏳</span>
              <p className={styles.comingSoonText}>Mathe-Spiele werden gleich geladen…</p>
            </div>
          )}
        </>
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
