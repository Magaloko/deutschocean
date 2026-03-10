import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FARBEN_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function FarbenJaeger() {
  const navigate = useNavigate()
  const { completeSession, saving, completedMissions } = useProgress()

  const [level,    setLevel]    = useState(null) // null | 1 | 2 | 3
  const [runden,   setRunden]   = useState([])

  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked,  setChecked]  = useState(false)
  const [lastOk,   setLastOk]   = useState(false)
  const [score,    setScore]    = useState(0)
  const [phase,    setPhase]    = useState('playing')

  const TOTAL = runden.length
  const runde = runden[idx]

  const L2_UNLOCKED = completedMissions.includes('farben-jaeger-1')
  const L3_UNLOCKED = completedMissions.includes('farben-jaeger-2')

  function startLevel(lvl) {
    const filtered = FARBEN_RUNDEN.filter(r => r.difficulty === lvl)
    setRunden(shuffle(filtered).slice(0, 6))
    setLevel(lvl)
    setIdx(0)
    setSelected(new Set())
    setChecked(false)
    setLastOk(false)
    setScore(0)
    setPhase('playing')
  }

  function toggleItem(itemId) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  function handleCheck() {
    const targets = new Set(runde.items.filter(i => i.isTarget).map(i => i.id))
    const perfect =
      [...selected].every(id => targets.has(id)) &&
      [...targets].every(id => selected.has(id))
    if (perfect) { setScore(s => s + 1); playCorrect() } else { playWrong() }
    setLastOk(perfect)
    setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx(i => i + 1)
      setSelected(new Set())
      setChecked(false)
      setLastOk(false)
    }
  }

  async function handleFinish() {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({ missionId: `farben-jaeger-${level}`, xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL ? '🎨' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score >= TOTAL ? 'Super Farbenjäger!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(stars)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Zurück</Button>
        </div>
      </div>
    )
  }

  // ── LEVEL-AUSWAHL ─────────────────────────────────────────────────────────
  if (!level) {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}>🎨</span>
            <h1 className={styles.gameTitle}>Farbenjäger</h1>
          </div>
          <div />
        </div>
        <p className={styles.vehicleSelectTitle}>Wähle dein Level! 🌟</p>
        <div className={styles.levelGrid}>
          <button className={`${styles.levelCard} ${styles.levelCard1}`} onClick={() => startLevel(1)}>
            <span className={styles.levelStars}>⭐</span>
            <strong className={styles.levelTitle}>Level 1</strong>
            <span className={styles.levelLabel}>Leicht</span>
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard2} ${!L2_UNLOCKED ? styles.levelCardLocked : ''}`}
            onClick={() => L2_UNLOCKED && startLevel(2)}
          >
            <span className={styles.levelStars}>{L2_UNLOCKED ? '⭐⭐' : '🔒'}</span>
            <strong className={styles.levelTitle}>Level 2</strong>
            <span className={styles.levelLabel}>Mittel</span>
            {!L2_UNLOCKED && <small className={styles.levelLockHint}>Level 1 erst abschließen!</small>}
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard3} ${!L3_UNLOCKED ? styles.levelCardLocked : ''}`}
            onClick={() => L3_UNLOCKED && startLevel(3)}
          >
            <span className={styles.levelStars}>{L3_UNLOCKED ? '⭐⭐⭐' : '🔒'}</span>
            <strong className={styles.levelTitle}>Level 3</strong>
            <span className={styles.levelLabel}>Schwer</span>
            {!L3_UNLOCKED && <small className={styles.levelLockHint}>Level 2 erst abschließen!</small>}
          </button>
        </div>
      </div>
    )
  }

  // ── SPIELFELD ─────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🎨</span>
          <h1 className={styles.gameTitle}>Farbenjäger</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <div className={styles.targetDisplay}>
          <div className={styles.colorSwatch} style={{ background: runde.targetHex }} />
          <span>Tippe alles <strong style={{ color: runde.targetHex }}>{runde.targetColor.toUpperCase()}</strong>!</span>
        </div>

        <div className={styles.kidsGrid}>
          {runde.items.map(item => {
            const isSel     = selected.has(item.id)
            const isCorrect = checked && item.isTarget
            const isWrong   = checked && !item.isTarget && isSel
            const isMissed  = checked && item.isTarget && !isSel
            return (
              <button
                key={item.id}
                className={[
                  styles.colorTile,
                  isSel     ? styles.colorTileSelected : '',
                  isCorrect ? styles.colorTileCorrect  : '',
                  isWrong   ? styles.colorTileWrong    : '',
                  isMissed  ? styles.colorTileMissed   : '',
                ].join(' ')}
                style={{ background: item.hex }}
                onClick={() => toggleItem(item.id)}
                disabled={checked}
              >
                {item.emoji}
              </button>
            )
          })}
        </div>

        {checked && (
          <div className={`${styles.resultBanner} ${lastOk ? styles.resultGreen : styles.resultRed}`}>
            {lastOk
              ? `✓ Super! Alle ${runde.targetColor}en Karten gefunden!`
              : `✗ Die ${runde.targetColor}en Karten: ${runde.items.filter(i => i.isTarget).map(i => i.emoji).join(' ')}`}
          </div>
        )}

        <div className={styles.actions}>
          {!checked ? (
            <Button onClick={handleCheck} size="lg">Überprüfen</Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          )}
        </div>
      </Card>

      <div className={styles.progressDots}>
        {runden.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
