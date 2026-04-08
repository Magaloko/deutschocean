// src/pages/app/games/SatzBuilder.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { SATZ_AUFGABEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 6

const HINTS = {
  long:   {
    text: 'Ein Satz hat Subjekt (Wer?), Verb (Was tut er?) und Objekt (Was/Wen?). Das Verb steht oft an zweiter Stelle im Satz!',
    tts:  true,
  },
  medium: { text: 'Das Verb (Tunwort) steht im Deutschen meist an zweiter Stelle.', tts: false },
  short:  { text: '💡 Verb an zweite Stelle!', tts: false },
}

function getTaskPool(difficulty) {
  const pool = SATZ_AUFGABEN.filter((t) => t.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : SATZ_AUFGABEN
}

export default function SatzBuilder() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['satz-builder-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]               = useState(() => shuffle(getTaskPool(initialDifficulty)).slice(0, TOTAL))
  const [idx, setIdx]         = useState(0)
  const [bank, setBank]       = useState([])
  const [placed, setPlaced]   = useState([])
  const [checked, setChecked] = useState(false)
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('playing')

  const task = tasks[idx]

  useEffect(() => {
    if (tasks[idx]) {
      setBank(shuffle([...tasks[idx].words]))
      setPlaced([])
      setChecked(false)
      dismissHint()
    }
  }, [idx])

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  function addWord(word, bankIdx) {
    if (checked) return
    setPlaced((p) => [...p, word])
    setBank((b) => b.filter((_, i) => i !== bankIdx))
  }

  function removeWord(word, placedIdx) {
    if (checked) return
    setPlaced((p) => p.filter((_, i) => i !== placedIdx))
    setBank((b) => [...b, word])
  }

  function handleCheck() {
    const attempt = placed.join(' ')
    const correct = attempt === task.correct
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else         { playWrong(); ozzReact('wrong') }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) { setPhase('result') }
    else { setIdx((i) => i + 1) }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'satz-builder-1', xpEarned: score * 4, stars, correct: score, total: TOTAL, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🏗️' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Perfekt gebaut!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Sätze korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 4} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  const attempt   = placed.join(' ')
  const isCorrect = checked && attempt === task.correct
  const isWrong   = checked && attempt !== task.correct

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🏗️</span>
          <h1 className={styles.gameTitle}>Satz-Baumeister</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${isCorrect ? styles.cardSuccess : isWrong ? styles.cardError : ''}`}>
        <p className={styles.instruction}>
          Tippe auf die <strong>Wörter</strong> und bringe sie in die richtige Reihenfolge!
        </p>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.dropZone}>
          {placed.length === 0 ? (
            <span className={styles.dropPlaceholder}>Tippe auf Wörter unten ↓</span>
          ) : (
            placed.map((w, i) => (
              <button
                key={i}
                className={`${styles.silbeToken} ${styles.silbePlaced} ${isCorrect ? styles.silbeCorrect : isWrong ? styles.silbeWrong : ''}`}
                onClick={() => removeWord(w, i)}
                disabled={checked}
              >
                {w}
              </button>
            ))
          )}
        </div>

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect ? `✓ Richtig! "${task.correct}"` : `✗ Falsch. Richtig: "${task.correct}"`}
          </div>
        )}

        <div className={styles.silbenBank}>
          {bank.map((w, i) => (
            <button key={i} className={styles.silbeToken} onClick={() => addWord(w, i)} disabled={checked}>
              {w}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={bank.length > 0} size="lg">Überprüfen</Button>
            : <Button onClick={handleNext} size="lg">{idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}</Button>
          }
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
