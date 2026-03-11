import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { SILBEN_WOERTER } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

export default function SilbenPuzzle() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [words]    = useState(() => shuffle(SILBEN_WOERTER).slice(0, TOTAL))
  const [idx, setIdx]       = useState(0)
  const [placed, setPlaced] = useState([])
  const [bank, setBank]     = useState([])
  const [checked, setChecked] = useState(false)
  const [score, setScore]   = useState(0)
  const [phase, setPhase]   = useState('playing')

  const word = words[idx]

  // Initialisiere Bank wenn idx sich ändert
  const initBank = useCallback((w) => shuffle([...w.silben]), [])

  function startWord(w) {
    setBank(initBank(w))
    setPlaced([])
    setChecked(false)
  }

  React.useEffect(() => {
    if (words[idx]) startWord(words[idx])
  }, [idx])

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
    if (attempt === word.word) { setScore((s) => s + 1); playCorrect() } else { playWrong() }
    setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx((i) => i + 1)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    await completeSession({
      missionId: 'silben-1',
      xpEarned: score * 3,
      stars,
      correct: score,
      total: TOTAL,
    })
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

  const attempt  = placed.join('')
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

      <Card padding="lg" className={`${styles.gameCard} ${isCorrect ? styles.cardSuccess : isWrong ? styles.cardError : ''}`}>
        <p className={styles.instruction}>
          Setze die <strong>Silben</strong> in der richtigen Reihenfolge zusammen!
        </p>

        {/* Drop-Bereich */}
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

        {/* Ergebnis-Anzeige */}
        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect ? `✓ Richtig! Das Wort ist "${word.word}".` : `✗ Falsch. Richtig wäre: "${word.word}"`}
          </div>
        )}

        {/* Silben-Bank */}
        <div className={styles.silbenBank}>
          {bank.map((s, i) => (
            <button
              key={i}
              className={styles.silbeToken}
              onClick={() => addSilbe(s, i)}
              disabled={checked}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {!checked ? (
            <Button onClick={handleCheck} disabled={bank.length > 0} size="lg">
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
        {words.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
