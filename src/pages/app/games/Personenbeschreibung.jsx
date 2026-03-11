import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Input from '../../../components/ui/Input.jsx'
import { PERSONEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const SHOW_SECONDS = 5
const TOTAL = PERSONEN.length

export default function Personenbeschreibung() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [persons] = useState(() => shuffle(PERSONEN))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase]   = useState('watch')  // watch | write | feedback | result
  const [timer, setTimer]   = useState(SHOW_SECONDS)
  const [text, setText]     = useState('')
  const [score, setScore]   = useState(0)
  const [answers, setAnswers] = useState([])

  const person = persons[idx]

  // Countdown während "watch"-Phase
  useEffect(() => {
    if (phase !== 'watch') return
    if (timer <= 0) { setPhase('write'); return }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, timer])

  function handleSubmit() {
    const props  = Object.values(person.properties)
    const answer = text.toLowerCase()
    const found  = props.filter((p) => answer.includes(p.toLowerCase()))
    const pts    = Math.round((found.length / props.length) * 3)
    setScore((s) => s + pts)
    setAnswers((a) => [...a, { text, person, found, pts }])
    setPhase('feedback')
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx((i) => i + 1)
      setTimer(SHOW_SECONDS)
      setText('')
      setPhase('watch')
    }
  }

  async function handleFinish() {
    const stars = score >= TOTAL * 3 ? 3 : score >= TOTAL * 1.5 ? 2 : 1
    await completeSession({
      missionId: 'personenbeschreibung-1',
      xpEarned: score * 5 + 10,
      stars,
      correct: score,
      total: TOTAL * 3,
    })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL * 3 ? '🏆' : '⭐'}</div>
        <h1 className={styles.resultTitle}>Mission abgeschlossen!</h1>
        <p className={styles.resultSub}>{score}/{TOTAL * 3} Punkte</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5 + 10} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score >= TOTAL * 3 ? 3 : score >= TOTAL * 1.5 ? 2 : 1)}</Badge>
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>👁️</span>
          <h1 className={styles.gameTitle}>Zeugenbericht</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {phase === 'watch' && (
          <div className={styles.watchPhase}>
            <p className={styles.instruction}>
              Merke dir diese Person! Du hast noch <strong>{timer}</strong> Sekunden.
            </p>
            <div className={styles.suspect}>
              <div className={styles.suspectEmoji}>{person.emoji}</div>
              <div className={styles.suspectProps}>
                {Object.entries(person.properties).map(([key, val]) => (
                  <div key={key} className={styles.propBadge}>
                    <strong>{key}:</strong> {val}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.timerBar}>
              <div
                className={styles.timerFill}
                style={{ width: `${(timer / SHOW_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'write' && (
          <div className={styles.writePhase}>
            <p className={styles.instruction}>
              Beschreibe die Person in ganzen Sätzen. Was hast du gesehen?
            </p>
            <div className={styles.blurredSuspect}>{person.emoji}</div>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Schreibe deinen Zeugenbericht hier..."
              rows={5}
              autoFocus
            />
            <Button onClick={handleSubmit} disabled={text.trim().length < 10} size="lg">
              Bericht abgeben
            </Button>
          </div>
        )}

        {phase === 'feedback' && (
          <div className={`${styles.feedbackPhase} fade-in`}>
            <p className={styles.instruction}>Hier ist die Musterlösung:</p>
            <div className={styles.sampleAnswer}>{person.sampleAnswer}</div>
            <div className={styles.foundList}>
              {Object.values(person.properties).map((p) => {
                const found = text.toLowerCase().includes(p.toLowerCase())
                return (
                  <div key={p} className={`${styles.foundItem} ${found ? styles.foundOk : styles.foundMiss}`}>
                    {found ? '✓' : '✗'} {p}
                  </div>
                )
              })}
            </div>
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis ansehen' : 'Nächste Person →'}
            </Button>
          </div>
        )}
      </Card>

      <div className={styles.progressDots}>
        {persons.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
