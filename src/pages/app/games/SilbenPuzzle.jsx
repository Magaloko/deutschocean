// src/pages/app/games/SilbenPuzzle.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { SILBEN_WOERTER } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

const HINTS = {
  long:   {
    text: 'Silben sind Klangteile eines Wortes. Sprich das Wort laut und klatsche dazu — jeder Klatsch ist eine Silbe! Schu-le = 2 Silben.',
    tts:  true,
  },
  medium: { text: 'Sprich das Wort laut und klatsche die Silben.', tts: false },
  short:  { text: '💡 Laut sprechen und klatschen!', tts: false },
}

function getWordPool(difficulty) {
  const pool = SILBEN_WOERTER.filter((w) => w.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : SILBEN_WOERTER
}

export default function SilbenPuzzle() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['silben-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [words]     = useState(() => shuffle(getWordPool(initialDifficulty)).slice(0, TOTAL))
  const [idx, setIdx]           = useState(0)
  const [placed, setPlaced]     = useState([])
  const [bank, setBank]         = useState([])
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing')

  const word = words[idx]

  const initBank = useCallback((w) => shuffle([...w.silben]), [])

  function startWord(w) {
    setBank(initBank(w))
    setPlaced([])
    setChecked(false)
    dismissHint()
  }

  useEffect(() => {
    if (words[idx]) startWord(words[idx])
  }, [idx, startWord, words])

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  function addSilbe(s, bankIdx) {
    if (checked) return
    setPlaced((p) => [...p, s])
    setBank((b) => b.filter((_, i) => i !== bankIdx))
  }

  function removeSilbe(s, placedIdx) {
    if (checked) return
    setPlaced((p) => p.filter((_, i) => i !== placedIdx))
    setBank((b) => [...b, s])
  }

  function handleCheck() {
    const attempt = placed.join('')
    const correct = attempt === word.word
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
    await completeSession({ missionId: 'silben-1', xpEarned: score * 3, stars, correct: score, total: TOTAL, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🧩' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Puzzle gelöst!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Wörter korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 3} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 3 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  const attempt   = placed.join('')
  const isCorrect = checked && attempt === word.word
  const isWrong   = checked && attempt !== word.word

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🧩</span>
          <h1 className={styles.gameTitle}>Silben-Puzzle</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${isCorrect ? styles.cardSuccess : isWrong ? styles.cardError : ''}`}>
        <p className={styles.instruction}>
          Setze die <strong>Silben</strong> in der richtigen Reihenfolge zusammen!
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
            <span className={styles.dropPlaceholder}>Tippe auf Silben unten ↓</span>
          ) : (
            placed.map((s, i) => (
              <button
                key={i}
                className={`${styles.silbeToken} ${styles.silbePlaced} ${isCorrect ? styles.silbeCorrect : isWrong ? styles.silbeWrong : ''}`}
                onClick={() => removeSilbe(s, i)}
                disabled={checked}
              >
                {s}
              </button>
            ))
          )}
        </div>

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect ? `✓ Richtig! Das Wort ist "${word.word}".` : `✗ Falsch. Richtig wäre: "${word.word}"`}
          </div>
        )}

        <div className={styles.silbenBank}>
          {bank.map((s, i) => (
            <button key={i} className={styles.silbeToken} onClick={() => addSilbe(s, i)} disabled={checked}>
              {s}
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
        {words.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
