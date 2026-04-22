// src/pages/app/games/NomenFinder.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
import { NOMEN_SAETZE } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const HINTS = {
  long:   {
    text: 'Nomen sind Dinge, Lebewesen oder Orte — sie werden IMMER groß geschrieben! Merkhilfe: Kannst du "ein/eine" davor stellen? Ein Hund, eine Schule.',
    tts:  true,
  },
  medium: { text: 'Nomen erkennt man oft am "ein" oder "die/der/das" davor.', tts: false },
  short:  { text: '💡 Großschreibung = Nomen?', tts: false },
}

function getTaskPool(difficulty) {
  const pool = NOMEN_SAETZE.filter((t) => t.difficulty === difficulty)
  return pool.length >= 3 ? pool : NOMEN_SAETZE
}


export default function NomenFinder() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['nomen-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]   = useState(() => shuffle(getTaskPool(initialDifficulty)))
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing') // playing | retry | result

  // Wrong-Answer-Retry: nicht-perfekte Aufgaben werden am Ende nochmal gestellt.
  const [failedIds, setFailedIds] = useState([])
  const [retryQueue, setRetryQueue] = useState([])
  const [retryIdx, setRetryIdx] = useState(0)

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const task = phase === 'retry' ? retryQueue[retryIdx] : tasks[idx]
  if (!task) return null
  const nouns = new Set(task.nouns)

  // Feedback-Analyse: Treffer, False-Positives, Übersehen
  const hits     = checked ? new Set([...selected].filter((w) => nouns.has(w))) : new Set()
  const falsePos = checked ? new Set([...selected].filter((w) => !nouns.has(w))) : new Set()
  const missed   = checked ? new Set([...nouns].filter((w) => !selected.has(w))) : new Set()
  const perfectRun = checked && hits.size === nouns.size && falsePos.size === 0

  function toggleWord(word) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  function handleCheck() {
    const allFound  = task.nouns.every((n) => selected.has(n))
    const noFalse   = [...selected].every((w) => nouns.has(w))
    const correct   = allFound && noFalse
    if (correct) {
      if (phase === 'playing') setScore((s) => s + 1)
      playCorrect(); ozzReact('correct')
    } else {
      playWrong(); ozzReact('wrong')
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
      if (idx + 1 >= tasks.length) {
        const toRetry = tasks.filter((t) => failedIds.includes(t.id))
        if (toRetry.length > 0) {
          setRetryQueue(toRetry)
          setRetryIdx(0)
          setPhase('retry')
        } else {
          setPhase('result')
        }
      } else {
        setIdx((i) => i + 1)
      }
      return
    }
    // retry
    if (retryIdx + 1 >= retryQueue.length) {
      setPhase('result')
    } else {
      setRetryIdx((i) => i + 1)
    }
  }

  async function handleFinish() {
    const stars = score === tasks.length ? 3 : score >= tasks.length * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'nomen-1', xpEarned: score * 5, stars, correct: score, total: tasks.length, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>
          <Icon emoji={score === tasks.length ? '🏹' : '⭐'} size={64} color={score === tasks.length ? '#4f46e5' : '#fbbf24'} />
        </div>
        <h1 className={styles.resultTitle}>{score === tasks.length ? 'Alle Nomen gefunden!' : 'Weiter üben!'}</h1>
        <p className={styles.resultSub}>{score}/{tasks.length} Sätze korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow"><StarsRow count={score === tasks.length ? 3 : score >= tasks.length * 0.6 ? 2 : 1} /></Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
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
          <span className={styles.gameEmoji}><Icon emoji="🏹" size={24} color="#4f46e5" /></span>
          <h1 className={styles.gameTitle}>Nomen-Jäger</h1>
        </div>
        <Badge color="gray">
          {phase === 'retry'
            ? `Üben ${retryIdx + 1}/${retryQueue.length}`
            : `${idx + 1}/${tasks.length}`}
        </Badge>
      </div>

      {phase === 'retry' && (
        <div className={styles.retryBanner}>
          <Icon emoji="🎯" size={18} color="#f59e0b" />
          <span>Lass uns die Nomen nochmal üben!</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe alle <strong>Nomen</strong> (Hauptwörter) im Satz an! Nomen sind immer großgeschrieben.
        </p>

        <div className={styles.nomenHint}>
          <Badge color="blue">Tipp: Nomen = Person, Tier, Sache, Ort</Badge>
        </div>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.tokenRow}>
          {task.words.map((word, i) => {
            const isSelected = selected.has(word)
            let cls = styles.token
            if (checked) {
              if (hits.has(word))           cls += ` ${styles.tokenHit}`
              else if (falsePos.has(word))  cls += ` ${styles.tokenFalsePos}`
              else if (missed.has(word))    cls += ` ${styles.tokenMissed}`
            } else if (isSelected) {
              cls += ` ${styles.tokenSelected}`
            }
            return (
              <button key={i} className={cls} onClick={() => toggleWord(word)} disabled={checked}>
                {word}
              </button>
            )
          })}
        </div>

        {checked && (
          <div className={`${styles.feedback} fade-in`}>
            <p className={styles.feedbackSummary}>
              {perfectRun ? (
                <>
                  <Icon emoji="✅" size={18} color="#10b981" />
                  <strong>Perfekt!</strong> Alle {nouns.size} Nomen gefunden.
                </>
              ) : (
                <>
                  <Icon emoji="💡" size={18} color="#f59e0b" />
                  Du hast <strong>{hits.size} von {nouns.size}</strong> Nomen gefunden
                  {falsePos.size > 0 && <> · {falsePos.size} zu viel markiert</>}
                </>
              )}
            </p>
            <p className={styles.feedbackTitle}>Die Nomen im Satz:</p>
            <div className={styles.errorList}>
              {task.nouns.map((n) => {
                const wasCaught = hits.has(n)
                return (
                  <div key={n} className={`${styles.errorItem} ${wasCaught ? styles.errorItemHit : styles.errorItemMissed}`}>
                    <span className={styles.errorStatus}>
                      {wasCaught
                        ? <Icon emoji="✓" size={14} color="#10b981" />
                        : <Icon emoji="⚠️" size={14} color="#f59e0b" />}
                    </span>
                    <span className={styles.errorRight}>{n}</span>
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
                  ? (retryIdx + 1 >= retryQueue.length ? 'Ergebnis' : 'Weiter üben →')
                  : (idx + 1 >= tasks.length
                      ? (failedIds.length > 0 ? 'Jetzt nochmal üben →' : 'Ergebnis')
                      : 'Weiter →')}
              </Button>
            )
          }
        </div>
      </Card>

      {phase === 'playing' && (
        <div className={styles.progressDots}>
          {tasks.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
