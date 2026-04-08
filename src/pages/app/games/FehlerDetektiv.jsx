// src/pages/app/games/FehlerDetektiv.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FEHLER_DETEKTIV_TASKS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

const TOTAL = 3

const HINTS = {
  long:   {
    text: 'Suche nach Nomen (Dinge, Tiere, Personen, Orte) — die werden groß geschrieben! Auch der erste Buchstabe im Satz ist immer groß.',
    tts:  true,
  },
  medium: {
    text: 'Nomen und der Satzanfang werden immer groß geschrieben.',
    tts:  false,
  },
  short:  { text: '💡 Groß- oder Kleinschreibung prüfen!', tts: false },
}

function getTaskPool(difficulty) {
  const pool = FEHLER_DETEKTIV_TASKS.filter((t) => t.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : FEHLER_DETEKTIV_TASKS
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function FehlerDetektiv() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['fehler-detektiv-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]          = useState(() => shuffle(getTaskPool(initialDifficulty)).slice(0, TOTAL))
  const [taskIdx, setTaskIdx]     = useState(0)
  const [selected, setSelected]   = useState(new Set())
  const [checked, setChecked]     = useState(false)
  const [score, setScore]         = useState(0)
  const [phase, setPhase]         = useState('playing') // 'playing' | 'result'

  // Ozzy reaction on difficulty change
  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const task = tasks[taskIdx]
  if (!task) return null

  const words      = task.text.split(' ')
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
    const correct =
      task.errors.every((e) => selected.has(e.word)) &&
      [...selected].every((w) => errorWords.has(w))
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else         { playWrong(); ozzReact('wrong') }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (taskIdx + 1 >= TOTAL) { setPhase('result') }
    else {
      setTaskIdx((i) => i + 1)
      setSelected(new Set())
      setChecked(false)
      dismissHint()
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'fehler-detektiv-1', xpEarned: score * 5, stars, correct: score, total: TOTAL })
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
          <Button onClick={handleFinish} loading={saving} size="lg">Ergebnis speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔍</span>
          <h1 className={styles.gameTitle}>Fehler-Detektiv</h1>
        </div>
        <Badge color="gray">{taskIdx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe auf die <strong>falsch geschriebenen Wörter</strong> im Satz.
        </p>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.tokenRow}>
          {words.map((word, i) => {
            const clean      = word.replace(/[.,!?]$/, '')
            const punct      = word.slice(clean.length)
            const isSelected = selected.has(clean)
            const isError    = errorWords.has(clean)
            let cls = styles.token
            if (checked) cls += isError ? ` ${styles.tokenError}` : ` ${styles.tokenOk}`
            else if (isSelected) cls += ` ${styles.tokenSelected}`
            return (
              <span key={i}>
                <button className={cls} onClick={() => toggleWord(clean)} disabled={checked}>{clean}</button>
                {punct}
              </span>
            )
          })}
        </div>

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
          {!checked
            ? <Button onClick={handleCheck} disabled={selected.size === 0} size="lg">Überprüfen</Button>
            : <Button onClick={handleNext} size="lg">{taskIdx + 1 >= TOTAL ? 'Ergebnis ansehen' : 'Weiter →'}</Button>
          }
        </div>
      </Card>

      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < taskIdx ? styles.dotDone : i === taskIdx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
