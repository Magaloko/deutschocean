import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { DIKTAT_TEXTS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function compareTexts(original, typed) {
  const origWords  = original.trim().split(/\s+/)
  const typedWords = typed.trim().split(/\s+/)
  const results    = origWords.map((w, i) => ({
    word:    w,
    typed:   typedWords[i] ?? '',
    correct: w === typedWords[i],
  }))
  const correct = results.filter((r) => r.correct).length
  return { results, correct, total: origWords.length }
}

const TOTAL = 3

export default function DiktatModus() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [tasks]   = useState(() => shuffle(DIKTAT_TEXTS).slice(0, TOTAL))
  const [idx, setIdx]       = useState(0)
  const [typed, setTyped]   = useState('')
  const [checked, setChecked] = useState(null) // null | result object
  const [speaking, setSpeaking] = useState(false)
  const [score, setScore]   = useState(0)
  const [phase, setPhase]   = useState('playing')
  const [playCount, setPlayCount] = useState(0)

  const task = tasks[idx]

  const speak = useCallback(() => {
    if (!window.speechSynthesis || speaking) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(task.text)
    utt.lang = 'de-AT'
    utt.rate = 0.85
    utt.onstart = () => setSpeaking(true)
    utt.onend   = () => { setSpeaking(false); setPlayCount((c) => c + 1) }
    window.speechSynthesis.speak(utt)
  }, [task, speaking])

  function handleCheck() {
    const result = compareTexts(task.text, typed)
    setScore((s) => s + result.correct)
    setChecked(result)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx((i) => i + 1)
      setTyped('')
      setChecked(null)
      setPlayCount(0)
    }
  }

  async function handleFinish() {
    const totalWords = tasks.reduce((acc, t) => acc + t.text.split(' ').length, 0)
    const pct   = score / totalWords
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1
    await completeSession({
      missionId: 'diktat-1',
      xpEarned: Math.round(pct * 25),
      stars,
      correct: score,
      total: totalWords,
    })
    navigate('/app')
  }

  const hasSpeechAPI = typeof window !== 'undefined' && 'speechSynthesis' in window

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>🎧</div>
        <h1 className={styles.resultTitle}>Diktat abgeschlossen!</h1>
        <p className={styles.resultSub}>{score} Wörter richtig geschrieben</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{Math.round(score * 0.5)} XP</Badge>
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
          <span className={styles.gameEmoji}>🎧</span>
          <h1 className={styles.gameTitle}>Diktat: {task.title}</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {!hasSpeechAPI && (
          <div className={styles.warningBox}>
            Dein Browser unterstützt leider keine Sprachausgabe. Bitte verwende Chrome oder Edge.
          </div>
        )}

        <p className={styles.instruction}>
          Höre den Text gut zu und schreibe ihn ab. Du kannst ihn <strong>2× abspielen</strong>.
        </p>

        <div className={styles.speakSection}>
          <button
            className={`${styles.speakBtn} ${speaking ? styles.speaking : ''}`}
            onClick={speak}
            disabled={speaking || playCount >= 2 || !hasSpeechAPI}
          >
            {speaking ? (
              <>
                <span className={styles.speakWave}/>
                <span className={styles.speakWave}/>
                <span className={styles.speakWave}/>
              </>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            )}
          </button>
          <div className={styles.playInfo}>
            <span className={styles.playCount}>{playCount}/2 abgespielt</span>
            {playCount === 0 && <span className={styles.playHint}>Drücke um zu starten</span>}
          </div>
        </div>

        {playCount > 0 && !checked && (
          <div className={`${styles.writeSection} fade-in`}>
            <textarea
              className={styles.textarea}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Schreibe den gehörten Text hier..."
              rows={3}
              autoFocus
            />
            <Button onClick={handleCheck} disabled={typed.trim().length < 3} size="lg">
              Überprüfen
            </Button>
          </div>
        )}

        {checked && (
          <div className={`${styles.dictResult} fade-in`}>
            <p className={styles.feedbackTitle}>
              {checked.correct}/{checked.total} Wörter richtig
            </p>
            <div className={styles.wordComparison}>
              {checked.results.map((r, i) => (
                <span
                  key={i}
                  className={`${styles.wordToken} ${r.correct ? styles.wordOk : styles.wordWrong}`}
                  title={r.correct ? 'Richtig!' : `Richtig: ${r.word}`}
                >
                  {r.typed || '_'}
                </span>
              ))}
            </div>
            <p className={styles.originalText}>Original: <em>{task.text}</em></p>
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          </div>
        )}
      </Card>

      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
