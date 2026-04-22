import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import Icon from '../../components/ui/Icon.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import MasteryBadge from '../../components/ui/MasteryBadge.jsx'
import NPCCard from '../../components/ui/NPCCard.jsx'
import { MISSIONS } from '../../lib/gameData.js'
import { GAME_ROUTES, getWeltById, isWeltForModule } from '../../lib/weltenData.js'
import { getWeltMastery } from '../../lib/masteryData.js'
import { playUnlock } from '../../lib/sounds.js'
import styles from './WeltPage.module.css'

// Persistenter Key pro Welt: merkt sich, welche Level beim letzten Besuch
// bereits freigeschaltet waren. Diff beim Mount → Animation für neu
// freigeschaltete Level.
const UNLOCK_MEMORY_KEY = (weltId) => `weltUnlocks:${weltId}`

// Level-Gate: das unterste in der Welt vorhandene Level ist immer offen.
// Höhere Level schalten frei, sobald das vorherige Level mindestens einmal
// gespielt wurde. Welten, die erst bei Level 1 starten, sind nicht grundlos
// gesperrt.
function isLevelUnlocked(lvl, groupedByLevel) {
  const levels = Object.keys(groupedByLevel).map(Number).sort((a, b) => a - b)
  if (lvl === levels[0]) return true
  const prevLvl = levels[levels.indexOf(lvl) - 1]
  const prev    = groupedByLevel[prevLvl] ?? []
  return prev.some((g) => g.completedCount > 0)
}

function groupMissionsByLevel(gameTypes, completed) {
  const byLevel = {}
  for (const m of MISSIONS) {
    if (!gameTypes.includes(m.type)) continue
    if (!byLevel[m.level]) byLevel[m.level] = new Map()
    const slot = byLevel[m.level]
    if (!slot.has(m.type)) slot.set(m.type, { ...m, variants: [], completedCount: 0 })
    const entry = slot.get(m.type)
    entry.variants.push(m)
    if (completed.includes(m.id)) entry.completedCount++
  }
  const out = {}
  for (const [lvl, map] of Object.entries(byLevel)) {
    out[lvl] = [...map.values()]
  }
  return out
}

const LEVEL_LABELS = {
  0: { label: 'Für Kleine',  emoji: '🧒' },
  1: { label: 'Anfänger',    emoji: '📚' },
  2: { label: 'Profi',       emoji: '🏆' },
}

export default function WeltPage() {
  const { weltId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const welt = getWeltById(weltId)
  const completed = profile?.completedMissions ?? []
  const weakGames = profile?.weakGames ?? {}
  const schoolModule = profile?.schoolModule || 'volksschule'

  const groupedByLevel = useMemo(
    () => (welt ? groupMissionsByLevel(welt.gameTypes, completed) : {}),
    [welt, completed],
  )

  // Unlock-Detection: beim ersten Render vergleichen wir aktuell
  // freigeschaltete Level mit dem Stand aus localStorage. Neu freigeschaltete
  // Level werden als "newlyUnlocked" gemarkiert, animieren kurz und spielen
  // den Unlock-Sound.
  const [newlyUnlocked, setNewlyUnlocked] = useState(new Set())
  useEffect(() => {
    if (!welt) return
    const unlockedNow = Object.keys(groupedByLevel)
      .map(Number)
      .filter((lvl) => isLevelUnlocked(lvl, groupedByLevel))

    let stored = []
    try {
      const raw = localStorage.getItem(UNLOCK_MEMORY_KEY(welt.id))
      if (raw) stored = JSON.parse(raw)
    } catch { /* ignore corrupt storage */ }

    const storedSet = new Set(stored)
    const fresh = unlockedNow.filter((lvl) => !storedSet.has(lvl))

    // Initial-Besuch einer Welt: unlockedNow auf stored schreiben ohne Fanfare,
    // sonst würden ALLE verfügbaren Level als "neu" gefeiert.
    if (stored.length === 0) {
      localStorage.setItem(UNLOCK_MEMORY_KEY(welt.id), JSON.stringify(unlockedNow))
      return
    }

    if (fresh.length === 0) return

    setNewlyUnlocked(new Set(fresh))
    playUnlock()
    localStorage.setItem(UNLOCK_MEMORY_KEY(welt.id), JSON.stringify(unlockedNow))

    // Animation läuft 2 s, dann Markierung entfernen (rein kosmetisch)
    const t = setTimeout(() => setNewlyUnlocked(new Set()), 2200)
    return () => clearTimeout(t)
  }, [welt, groupedByLevel])

  if (!welt) return <Navigate to="/app" replace />
  if (!isWeltForModule(welt, schoolModule)) {
    return (
      <div className={styles.page}>
        <div className={styles.notAvailable}>
          <Icon emoji="🔒" size={48} color="#9ca3af" />
          <h1>Diese Welt ist für deine Schulstufe nicht verfügbar.</h1>
          <Link to="/app" className={styles.backLink}>
            <Icon emoji="←" size={16} /> Zurück zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  const levels = Object.keys(groupedByLevel).map(Number).sort((a, b) => a - b)
  const allGames     = levels.flatMap((lvl) => groupedByLevel[lvl])
  const totalVariants = allGames.reduce((sum, g) => sum + g.variants.length, 0)
  const doneVariants  = allGames.reduce((sum, g) => sum + g.completedCount, 0)
  const mastery = getWeltMastery(welt, profile)

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Hero-Streifen mit Weltfarbe */}
      <div className={styles.hero} style={{ background: welt.gradient }}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/app')}
          aria-label="Zurück zu den Welten"
        >
          <Icon emoji="←" size={22} color="#fff" />
        </button>
        <div className={styles.heroIcon}>
          <Icon emoji={welt.icon} size={72} color="#fff" />
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>{welt.title}</h1>
          <p className={styles.heroSub}>{welt.subtitle}</p>
          <div className={styles.heroStats}>
            <span>{doneVariants}/{totalVariants} Aufgaben</span>
            <span>·</span>
            <span>{allGames.length} Spiele</span>
          </div>
        </div>
      </div>

      <div className={styles.masteryRow}>
        <MasteryBadge mastery={mastery} size="lg" showProgress />
      </div>

      {welt.npc && (
        <NPCCard npc={welt.npc} color={welt.color} variant={mastery.plays === 0 ? 'greeting' : 'quote'} />
      )}

      <div className={styles.progressWrap}>
        <ProgressBar value={doneVariants} max={Math.max(totalVariants, 1)} color="green" />
      </div>

      {/* Level-Gruppen */}
      {levels.map((lvl) => {
        const games = groupedByLevel[lvl]
        const meta  = LEVEL_LABELS[lvl] ?? { label: `Level ${lvl}`, emoji: '📖' }
        const unlocked = isLevelUnlocked(lvl, groupedByLevel)
        const levelDone  = games.reduce((s, g) => s + g.completedCount, 0)
        const levelTotal = games.reduce((s, g) => s + g.variants.length, 0)

        const isNew = newlyUnlocked.has(lvl)

        return (
          <section key={lvl} className={`${styles.levelSection} ${isNew ? styles.levelNewlyUnlocked : ''}`}>
            <div className={styles.levelHeader}>
              <div className={styles.levelPill} style={{ background: `${welt.color}18`, borderColor: `${welt.color}40` }}>
                <Icon emoji={meta.emoji} size={16} color={welt.color} />
                <span style={{ color: welt.color, fontWeight: 800 }}>{meta.label}</span>
              </div>
              <span className={styles.levelProgress}>{levelDone}/{levelTotal} erledigt</span>
              {isNew && (
                <span className={styles.levelNewBadge} style={{ background: welt.color }}>
                  <Icon emoji="🔓" size={12} color="#fff" /> Neu freigeschaltet!
                </span>
              )}
              {!unlocked && (
                <span className={styles.levelLockBadge}>
                  <Icon emoji="🔒" size={14} /> Noch gesperrt
                </span>
              )}
            </div>

            <div className={styles.gameGrid}>
              {games.map((g) => {
                if (!unlocked) {
                  return (
                    <div key={g.type} className={`${styles.gameCard} ${styles.gameCardLocked}`} aria-hidden="true">
                      <div className={styles.lockOverlay}>
                        <Icon emoji="🔒" size={28} color="#6b7280" />
                        <span className={styles.lockHint}>Vorheriges Level!</span>
                      </div>
                      <div className={styles.gameIcon} style={{ opacity: 0.35 }}>
                        <Icon emoji={g.icon} size={40} color={g.color} />
                      </div>
                      <div className={styles.gameTitle} style={{ opacity: 0.35 }}>{g.title}</div>
                      <div className={styles.gameXp} style={{ opacity: 0.35 }}>+{g.xp} XP</div>
                    </div>
                  )
                }
                const route   = GAME_ROUTES[g.type]
                const anyDone = g.completedCount > 0
                const allDone = g.completedCount >= g.variants.length
                return (
                  <Link
                    key={g.type}
                    to={route}
                    className={`${styles.gameCard} ${allDone ? styles.gameCardDone : anyDone ? styles.gameCardPartial : ''}`}
                    style={{ '--accent': g.color }}
                  >
                    {weakGames[g.id] >= 2 && (
                      <span className={styles.weakIndicator} title="Mehr üben!">
                        <Icon emoji="⚠️" size={16} />
                      </span>
                    )}
                    <div className={styles.gameIcon}>
                      <Icon emoji={g.icon} size={40} color={g.color} />
                    </div>
                    <div className={styles.gameTitle}>{g.title}</div>
                    {g.variants.length > 1 && (
                      <div className={styles.diffDots}>
                        {g.variants.map((v) => (
                          <div
                            key={v.id}
                            className={`${styles.diffDot} ${completed.includes(v.id) ? styles.diffDotDone : ''}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className={styles.gameXp}>+{g.xp} XP</div>
                    <button type="button" className={styles.playBtn}>
                      {allDone
                        ? <><Icon emoji="✓" size={14} color="#fff" /> Alle gespielt</>
                        : anyDone
                          ? `${g.completedCount}/${g.variants.length}`
                          : <><Icon emoji="▶" size={14} color="#fff" /> Spielen</>}
                    </button>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {levels.length === 0 && (
        <div className={styles.empty}>
          <Icon emoji="⏳" size={48} color="#9ca3af" />
          <p>Noch keine Spiele in dieser Welt verfügbar.</p>
        </div>
      )}
    </div>
  )
}
