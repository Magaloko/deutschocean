import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { NOMEN_SAETZE } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = NOMEN_SAETZE.length

export default function NomenFinder() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [tasks]   = useState(() => shuffle(NOMEN_SAETZE))
  const [idx, setIdx]         = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing')

  const task = tasks[idx]
  const nouns = new Set(task.nouns)

  function toggleWord(word) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  function handleCheck() {
    const allFound = task.nouns.every((n) => selected.has(n))
    const noFalse  = [...selected].every((w) => nouns.has(w))
    if (allFound && noFalse) setScore((s) => s + 1)
    setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx((i) => i + 1)
      setSelected(new Set())
      setChecked(false)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= 2 ? 2 : 1
    await completeSession({
      missionId: 'nomen-1',
      xpEarned: score * 5,
      stars,
      correct: score,
      total: TOTAL,
    })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🏹' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Alle Nomen gefunden!' : 'Weiter üben!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Sätze korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 2 ? 2 : 1)}</Badge>
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
          <span className={styles.gameEmoji}>🏹</span>
          <h1 className={styles.gameTitle}>Nomen-Jäger</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe alle <strong>Nomen</strong> (Hauptwörter) im Satz an!
          Nomen sind immer großgeschrieben.
        </p>

        <div className={styles.nomenHint}>
          <Badge color="blue">Tipp: Nomen = Person, Tier, Sache, Ort</Badge>
        </div>

        <div className={styles.tokenRow}>
          {task.words.map((word, i) => {
            const isNoun     = nouns.has(word)
            const isSelected = selected.has(word)
            let cls = styles.token
            if (checked) {
              cls += isNoun ? ` ${styles.tokenError}` : ` ${styles.tokenOk}`
            } else if (isSelected) {
              cls += ` ${styles.tokenSelected}`
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => toggleWord(word)}
                disabled={checked}
              >
                {word}
              </button>
            )
          })}
        </div>

        {checked && (
          <div className={`${styles.feedback} fade-in`}>
            <p className={styles.feedbackTitle}>Die Nomen im Satz:</p>
            <div className={styles.errorList}>
              {task.nouns.map((n) => (
                <div key={n} className={`${styles.errorItem} ${selected.has(n) ? styles.foundOk : styles.foundMiss}`}>
                  {selected.has(n) ? '✓' : '✗'} {n}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {!checked ? (
            <Button onClick={handleCheck} disabled={selected.size === 0} size="lg">
              Überprüfen
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          )}
        </div>
      </Card>

      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
