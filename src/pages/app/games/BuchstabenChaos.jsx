import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Input from '../../../components/ui/Input.jsx'
import { CHAOS_WOERTER } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

export default function BuchstabenChaos() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [words]   = useState(() => shuffle(CHAOS_WOERTER).slice(0, TOTAL))
  const [idx, setIdx]     = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore]   = useState(0)
  const [phase, setPhase]   = useState('playing')
  const [shake, setShake]   = useState(false)

  const item = words[idx]

  function handleCheck() {
    const correct = answer.toUpperCase().trim() === item.word
    if (correct) {
      setScore((s) => s + 1)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx((i) => i + 1)
      setAnswer('')
      setChecked(false)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    await completeSession({
      missionId: 'buchstaben-chaos-1',
      xpEarned: score * 2,
      stars,
      correct: score,
      total: TOTAL,
    })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🔤' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Chaos gemeistert!' : 'Fast!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Wörter gelöst</p>
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

  const isCorrect = checked && answer.toUpperCase().trim() === item.word

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔤</span>
          <h1 className={styles.gameTitle}>Buchstaben-Chaos</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${shake ? 'shake' : ''}`}>
        <p className={styles.instruction}>
          Bring die Buchstaben in die <strong>richtige Reihenfolge</strong>!
        </p>

        {/* Chaos-Buchstaben */}
        <div className={styles.chaosLetters}>
          {item.scrambled.split('').map((l, i) => (
            <span key={i} className={styles.chaosLetter}>{l}</span>
          ))}
        </div>

        <Input
          label="Deine Antwort"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Schreibe das Wort..."
          disabled={checked}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && !checked && answer.trim()) handleCheck() }}
        />

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect
              ? `✓ Richtig! Das Wort ist "${item.word}".`
              : `✗ Falsch. Das richtige Wort ist: "${item.word}"`}
          </div>
        )}

        <div className={styles.actions}>
          {!checked ? (
            <Button onClick={handleCheck} disabled={!answer.trim()} size="lg">
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
