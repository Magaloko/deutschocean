import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FEHLER_DETEKTIV_TASKS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const TOTAL = 3

export default function FehlerDetektiv() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [tasks]         = useState(() => shuffle(FEHLER_DETEKTIV_TASKS).slice(0, TOTAL))
  const [taskIdx, setTaskIdx] = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing') // playing | result

  const task = tasks[taskIdx]
  if (!task) return null

  const words = task.text.split(' ')
  const errorWords = new Set(task.errors.map((e) => e.word))

  function toggleWord(word) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  function handleCheck() {
    const correct = task.errors.every((e) => selected.has(e.word)) &&
      [...selected].every((w) => errorWords.has(w))
    if (correct) { setScore((s) => s + 1); playCorrect() } else { playWrong() }
    setChecked(true)
  }

  function handleNext() {
    if (taskIdx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setTaskIdx((i) => i + 1)
      setSelected(new Set())
      setChecked(false)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    await completeSession({
      missionId: 'fehler-detektiv-1',
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
        <div className={styles.resultEmoji}>{score === TOTAL ? '🏆' : score >= 2 ? '⭐' : '💪'}</div>
        <h1 className={styles.resultTitle}>
          {score === TOTAL ? 'Perfekt!' : score >= 2 ? 'Sehr gut!' : 'Weiter üben!'}
        </h1>
        <p className={styles.resultSub}>{score} von {TOTAL} Aufgaben richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 2 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">
            Ergebnis speichern
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/missionen')} size="lg">
            Andere Missionen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔍</span>
          <h1 className={styles.gameTitle}>Fehler-Detektiv</h1>
        </div>
        <Badge color="gray">{taskIdx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe auf die <strong>falsch geschriebenen Wörter</strong> im Satz.
        </p>

        {/* Wort-Tokens */}
        <div className={styles.tokenRow}>
          {words.map((word, i) => {
            const clean = word.replace(/[.,!?]$/, '')
            const punct = word.slice(clean.length)
            const isSelected = selected.has(clean)
            const isError    = errorWords.has(clean)
            let cls = styles.token
            if (checked) {
              cls += isError ? ` ${styles.tokenError}` : ` ${styles.tokenOk}`
            } else if (isSelected) {
              cls += ` ${styles.tokenSelected}`
            }
            return (
              <span key={i}>
                <button
                  className={cls}
                  onClick={() => toggleWord(clean)}
                  disabled={checked}
                >
                  {clean}
                </button>
                {punct}
              </span>
            )
          })}
        </div>

        {/* Feedback */}
        {checked && (
          <div className={`${styles.feedback} fade-in`}>
            <p className={styles.feedbackTitle}>Richtig geschrieben:</p>
            <p className={styles.corrected}>{task.corrected}</p>
            <div className={styles.errorList}>
              {task.errors.map((e) => (
                <div key={e.word} className={styles.errorItem}>
                  <span className={styles.errorWrong}>{e.word}</span>
                  <span className={styles.errorArrow}>→</span>
                  <span className={styles.errorRight}>{e.correct}</span>
                  <span className={styles.errorReason}>{e.reason}</span>
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
              {taskIdx + 1 >= TOTAL ? 'Ergebnis ansehen' : 'Weiter →'}
            </Button>
          )}
        </div>
      </Card>

      {/* Fortschritt */}
      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < taskIdx ? styles.dotDone : i === taskIdx ? styles.dotActive : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
