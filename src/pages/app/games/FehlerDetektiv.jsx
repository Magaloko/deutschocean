// src/pages/app/games/FehlerDetektiv.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
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
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]          = useState(() => shuffle(getTaskPool(initialDifficulty)).slice(0, TOTAL))
  const [taskIdx, setTaskIdx]     = useState(0)
  const [selected, setSelected]   = useState(new Set())
  const [checked, setChecked]     = useState(false)
  const [score, setScore]         = useState(0)
  const [phase, setPhase]         = useState('playing') // 'playing' | 'retry' | 'result'

  // Wrong-Answer-Retry: Aufgaben, bei denen der Spieler nicht alle Fehler
  // erwischt oder falsche markiert hat, werden am Ende der Session noch
  // einmal gestellt — zum Einprägen, ohne Score-Effekt.
  const [failedIds, setFailedIds] = useState([])
  const [retryQueue, setRetryQueue] = useState([])
  const [retryIdx, setRetryIdx] = useState(0)

  const currentTask = phase === 'retry' ? retryQueue[retryIdx] : tasks[taskIdx]

  // Ozzy reaction on difficulty change
  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  if (!currentTask) return null
  const task = currentTask

  const words      = task.text.split(' ')
  const errorWords = new Set(task.errors.map((e) => e.word))

  // Analyse der Auswahl nach "Überprüfen": was hat der Spieler getroffen,
  // was falsch markiert, was übersehen? Wird für die didaktische
  // Rückmeldung genutzt.
  const hits       = checked ? new Set([...selected].filter((w) => errorWords.has(w)))       : new Set()
  const falsePos   = checked ? new Set([...selected].filter((w) => !errorWords.has(w)))      : new Set()
  const missed     = checked ? new Set([...errorWords].filter((w) => !selected.has(w)))      : new Set()
  const perfectRun = checked && hits.size === errorWords.size && falsePos.size === 0

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
    if (correct) {
      // Nur in der Hauptrunde zählt ein Treffer für den Score.
      if (phase === 'playing') setScore((s) => s + 1)
      playCorrect(); ozzReact('correct')
    } else {
      playWrong(); ozzReact('wrong')
      // In der Hauptrunde merken wir uns die Aufgabe für die Retry-Phase.
      if (phase === 'playing' && !failedIds.includes(task.id)) {
        setFailedIds((ids) => [...ids, task.id])
      }
    }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    dismissHint()
    setSelected(new Set())
    setChecked(false)

    if (phase === 'playing') {
      if (taskIdx + 1 >= TOTAL) {
        // Hauptrunde fertig → Retry-Phase starten, falls es Fehler gab.
        const toRetry = tasks.filter((t) => failedIds.includes(t.id))
        if (toRetry.length > 0) {
          setRetryQueue(toRetry)
          setRetryIdx(0)
          setPhase('retry')
        } else {
          setPhase('result')
        }
      } else {
        setTaskIdx((i) => i + 1)
      }
      return
    }

    // phase === 'retry'
    if (retryIdx + 1 >= retryQueue.length) {
      setPhase('result')
    } else {
      setRetryIdx((i) => i + 1)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'fehler-detektiv-1', xpEarned: score * 5, stars, correct: score, total: TOTAL, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>
          <Icon emoji={score === TOTAL ? '🏆' : score >= 2 ? '⭐' : '🌟'} size={64} color={score === TOTAL ? '#f59e0b' : '#fbbf24'} />
        </div>
        <h1 className={styles.resultTitle}>
          {score === TOTAL ? 'Perfekt!' : score >= 2 ? 'Sehr gut!' : 'Weiter üben!'}
        </h1>
        <p className={styles.resultSub}>{score} von {TOTAL} Aufgaben richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow"><StarsRow count={score === TOTAL ? 3 : score >= 2 ? 2 : 1} /></Badge>
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}><Icon emoji="🔍" size={24} color="#ef4444" /></span>
          <h1 className={styles.gameTitle}>Fehler-Detektiv</h1>
        </div>
        <Badge color="gray">
          {phase === 'retry'
            ? `Üben ${retryIdx + 1}/${retryQueue.length}`
            : `${taskIdx + 1}/${TOTAL}`}
        </Badge>
      </div>

      {phase === 'retry' && (
        <div className={styles.retryBanner}>
          <Icon emoji="🎯" size={18} color="#f59e0b" />
          <span>Lass uns die Fehler nochmal üben!</span>
        </div>
      )}

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
            if (checked) {
              if (hits.has(clean))           cls += ` ${styles.tokenHit}`
              else if (falsePos.has(clean))  cls += ` ${styles.tokenFalsePos}`
              else if (missed.has(clean))    cls += ` ${styles.tokenMissed}`
              else                           cls += ` ${styles.tokenOk}`
            } else if (isSelected) cls += ` ${styles.tokenSelected}`
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
            <p className={styles.feedbackSummary}>
              {perfectRun ? (
                <>
                  <Icon emoji="✅" size={18} color="#10b981" />
                  <strong>Perfekt!</strong> Du hast alle {errorWords.size} Fehler gefunden.
                </>
              ) : (
                <>
                  <Icon emoji="💡" size={18} color="#f59e0b" />
                  Du hast <strong>{hits.size} von {errorWords.size}</strong> Fehlern gefunden
                  {falsePos.size > 0 && <> · {falsePos.size} zu viel markiert</>}
                </>
              )}
            </p>
            <p className={styles.feedbackTitle}>Richtig geschrieben:</p>
            <p className={styles.corrected}>{task.corrected}</p>
            <div className={styles.errorList}>
              {task.errors.map((e) => {
                const wasCaught = hits.has(e.word)
                return (
                  <div key={e.word} className={`${styles.errorItem} ${wasCaught ? styles.errorItemHit : styles.errorItemMissed}`}>
                    <span className={styles.errorStatus}>
                      {wasCaught
                        ? <Icon emoji="✓" size={14} color="#10b981" />
                        : <Icon emoji="⚠️" size={14} color="#f59e0b" />}
                    </span>
                    <span className={styles.errorWrong}>{e.word}</span>
                    <span className={styles.errorArrow}>→</span>
                    <span className={styles.errorRight}>{e.correct}</span>
                    <span className={styles.errorReason}>{e.reason}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={selected.size === 0} size="lg">Überprüfen</Button>
            : (
              <Button onClick={handleNext} size="lg">
                {phase === 'retry'
                  ? (retryIdx + 1 >= retryQueue.length ? 'Ergebnis ansehen' : 'Weiter üben →')
                  : (taskIdx + 1 >= TOTAL
                      ? (failedIds.length > 0 ? 'Jetzt nochmal üben →' : 'Ergebnis ansehen')
                      : 'Weiter →')}
              </Button>
            )
          }
        </div>
      </Card>

      {phase === 'playing' && (
        <div className={styles.progressDots}>
          {tasks.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i < taskIdx ? styles.dotDone : i === taskIdx ? styles.dotActive : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
