import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FAHRZEUG_WELTEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

const TOTAL_ROUNDS = 8

const SPEEDS = [
  { id: 'langsam', label: 'Langsam', emoji: '🐢', fallMs: 3800, color: '#22c55e' },
  { id: 'normal',  label: 'Normal',  emoji: '🚶', fallMs: 2300, color: '#f59e0b' },
  { id: 'schnell', label: 'Schnell', emoji: '🐇', fallMs: 1400, color: '#ef4444' },
]

function genRound(welt) {
  const shuffled = [...welt.items].sort(() => Math.random() - 0.5)
  const target = shuffled[0]
  const d1     = shuffled[1]
  const d2     = shuffled[2]
  const three  = [target, d1, d2].sort(() => Math.random() - 0.5)
  return { target, items: three, correctLane: three.indexOf(target) }
}

export default function FahrzeugLenker() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [welt,       setWelt]       = useState(null)
  const [speed,      setSpeed]      = useState(SPEEDS[0]) // default: Langsam
  const [gameState,  setGameState]  = useState('select') // select|ready|falling|feedback|result
  const [roundIdx,   setRoundIdx]   = useState(0)
  const [round,      setRound]      = useState(null)
  const [lane,       setLane]       = useState(1)
  const laneRef                     = useRef(1)
  const [lastResult, setLastResult] = useState(null) // 'correct'|'wrong'
  const [score,      setScore]      = useState(0)

  function setLaneVal(l) {
    const v = Math.max(0, Math.min(2, l))
    setLane(v)
    laneRef.current = v
  }

  // ── State machine ─────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'ready') return
    const r = genRound(welt)
    setRound(r)
    setLastResult(null)
    const t = setTimeout(() => setGameState('falling'), 600)
    return () => clearTimeout(t)
  }, [gameState, welt])

  useEffect(() => {
    if (gameState !== 'falling' || !round) return
    const t = setTimeout(() => {
      const correct = laneRef.current === round.correctLane
      if (correct) { setScore(s => s + 1); playCorrect() } else { playWrong() }
      setLastResult(correct ? 'correct' : 'wrong')
      setGameState('feedback')
    }, speed.fallMs)
    return () => clearTimeout(t)
  }, [gameState, round, speed])

  useEffect(() => {
    if (gameState !== 'feedback') return
    const t = setTimeout(() => {
      const next = roundIdx + 1
      if (next >= TOTAL_ROUNDS) {
        setGameState('result')
      } else {
        setRoundIdx(next)
        setGameState('ready')
      }
    }, 750)
    return () => clearTimeout(t)
  }, [gameState, roundIdx])

  // ── Actions ───────────────────────────────────────────────────
  function handleVehicleSelect(w) {
    setWelt(w)
    setLaneVal(1)
    setRoundIdx(0)
    setScore(0)
    setGameState('ready')
  }

  function goLeft()  { setLaneVal(laneRef.current - 1) }
  function goRight() { setLaneVal(laneRef.current + 1) }

  async function handleFinish() {
    const stars = score >= TOTAL_ROUNDS ? 3 : score >= Math.ceil(TOTAL_ROUNDS * 0.6) ? 2 : 1
    playComplete()
    await completeSession({
      missionId: 'fahrzeug-lenker-1',
      xpEarned: score * 2,
      stars,
      correct: score,
      total: TOTAL_ROUNDS,
    })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────
  if (gameState === 'result') {
    const stars = score >= TOTAL_ROUNDS ? 3 : score >= Math.ceil(TOTAL_ROUNDS * 0.6) ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL_ROUNDS ? '🏆' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score >= TOTAL_ROUNDS ? 'Perfekt gelenkt!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL_ROUNDS} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(stars)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Zurück</Button>
        </div>
      </div>
    )
  }

  // ── SELECT ────────────────────────────────────────────────────
  if (gameState === 'select') {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}>🚗</span>
            <h1 className={styles.gameTitle}>Fahrzeug-Lenker</h1>
          </div>
          <div />
        </div>
        <p className={styles.vehicleSelectTitle}>Wähle dein Fahrzeug! 🎮</p>

        {/* Speed picker */}
        <div className={styles.speedPicker}>
          {SPEEDS.map(s => (
            <button
              key={s.id}
              className={`${styles.speedBtn} ${speed.id === s.id ? styles.speedBtnActive : ''}`}
              style={speed.id === s.id ? { borderColor: s.color, background: s.color + '22' } : {}}
              onClick={() => setSpeed(s)}
            >
              <span className={styles.speedEmoji}>{s.emoji}</span>
              <span className={styles.speedLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.vehicleSelectGrid}>
          {FAHRZEUG_WELTEN.map(w => (
            <button
              key={w.id}
              className={styles.vehicleCard}
              onClick={() => handleVehicleSelect(w)}
              style={{ background: w.sceneBg }}
            >
              <span className={styles.vehicleCardEmoji}>{w.vehicle}</span>
              <span className={styles.vehicleCardLabel}>{w.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── PLAYING ───────────────────────────────────────────────────
  const isFalling  = gameState === 'falling'
  const isFeedback = gameState === 'feedback'
  const canSteer   = gameState === 'ready' || gameState === 'falling'

  return (
    <div className={`${styles.gamePage} fade-in`}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>{welt.vehicle}</span>
          <h1 className={styles.gameTitle}>{welt.label}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span title={speed.label}>{speed.emoji}</span>
          <Badge color="gray">{roundIdx + 1}/{TOTAL_ROUNDS}</Badge>
        </div>
      </div>

      {/* Scene */}
      <div className={styles.vehicleScene} style={{ background: welt.sceneBg }}>

        {/* Target word bar */}
        <div className={styles.vehicleTargetBar}>
          {round
            ? <><span>Finde:</span><span>{round.target.emoji}</span><strong>{round.target.word}</strong></>
            : <span>Bereit…</span>
          }
        </div>

        {/* Lane dividers */}
        <div className={styles.laneDivLine} style={{ left: '33.33%' }} />
        <div className={styles.laneDivLine} style={{ left: '66.66%' }} />

        {/* Falling items */}
        {round && isFalling && [0, 1, 2].map(l => (
          <div
            key={`${roundIdx}-${l}`}
            className={`${styles.fallingItemEl} ${styles[`lane${l}`]} ${styles.doFall}`}
            style={{ '--fall-ms': `${speed.fallMs}ms` }}
          >
            {round.items[l].emoji}
          </div>
        ))}

        {/* Feedback overlay */}
        {isFeedback && (
          <div className={`${styles.feedbackOverlay} ${lastResult === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}`}>
            {lastResult === 'correct' ? '✓' : '✗'}
          </div>
        )}

        {/* Vehicle */}
        <div
          className={styles.vehicleEmojiChar}
          style={{ left: `calc(${lane} * 33.33%)` }}
        >
          {welt.vehicle}
        </div>
      </div>

      {/* Steering controls */}
      <div className={styles.steerRow}>
        <button
          className={styles.steerBtn}
          onClick={goLeft}
          disabled={!canSteer || lane === 0}
          aria-label="Links"
        >◀</button>

        <div className={styles.steerScore}>⭐ {score} / {TOTAL_ROUNDS}</div>

        <button
          className={styles.steerBtn}
          onClick={goRight}
          disabled={!canSteer || lane === 2}
          aria-label="Rechts"
        >▶</button>
      </div>

      {/* Progress dots */}
      <div className={styles.progressDots}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < roundIdx ? styles.dotDone : i === roundIdx ? styles.dotActive : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
