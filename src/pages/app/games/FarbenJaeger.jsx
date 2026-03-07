import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FARBEN_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

export default function FarbenJaeger() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [runden]  = useState(() => shuffle(FARBEN_RUNDEN).slice(0, TOTAL))
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked]   = useState(false)
  const [lastOk, setLastOk]     = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing')

  const runde = runden[idx]

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
    if (perfect) setScore(s => s + 1)
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
    const stars = score === TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    await completeSession({ missionId: 'farben-jaeger-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🎨' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Super Farbenjäger!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 3 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app/missionen')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

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
            const isSel    = selected.has(item.id)
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
