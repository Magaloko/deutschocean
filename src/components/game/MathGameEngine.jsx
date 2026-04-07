// src/components/game/MathGameEngine.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete, speak } from '../../lib/sounds.js'
import styles from './MathGameEngine.module.css'

function calcStars(score, total) {
  if (score === total) return 3
  if (score >= Math.ceil(total * 0.7)) return 2
  return 1
}

/**
 * Shared game engine for all math games.
 *
 * Props:
 *   gameTitle      string           Display title, e.g. "Zahlenstrahl 🔢"
 *   config         object           { 1: {min,max,rounds,missionId,label}, 2:{…}, 3:{…} }
 *   buildRounds    function         (level, cfg) => Round[]  — each Round must have .options and .answer
 *   renderQuestion function         (round) => JSX           — renders the question display
 *   speakQuestion  function         (round) => string        — returns TTS string
 *   formatOption   function         (opt) => string          — optional, default String(opt)
 */
export default function MathGameEngine({
  gameTitle,
  config,
  buildRounds,
  renderQuestion,
  speakQuestion,
  formatOption = String,
}) {
  const navigate = useNavigate()
  const { completeSession } = useProgress()

  const [phase,    setPhase]    = useState('levelSelect')
  const [level,    setLevel]    = useState(null)
  const [rounds,   setRounds]   = useState([])
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)

  const cfg   = level ? config[level] : null
  const round = rounds[idx]
  const TOTAL = rounds.length

  useEffect(() => {
    if (phase === 'playing' && round && speakQuestion) {
      speak(speakQuestion(round))
    }
  }, [round, phase])

  function startLevel(lvl) {
    setLevel(lvl)
    setRounds(buildRounds(lvl, config[lvl]))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setPhase('playing')
  }

  function handleSelect(opt) {
    if (selected !== null) return
    setSelected(opt)
    if (opt === round.answer) { playCorrect(); setScore(s => s + 1) }
    else playWrong()
  }

  function handleWeiter() {
    // NOTE: `score` here already reflects the last correct answer.
    // React commits setScore (called in handleSelect) before the user can click Weiter,
    // so handleWeiter's closure has the up-to-date value. Do NOT add lastCorrect.
    if (idx + 1 >= TOTAL) {
      playComplete()
      const stars = calcStars(score, TOTAL)
      completeSession({ missionId: cfg.missionId, xpEarned: score * 2 + 5, stars })
      setPhase('result')
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  // ── Level Select ─────────────────────────────────────────────────────────
  if (phase === 'levelSelect') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
          <h1 className={styles.title}>{gameTitle}</h1>
          <div />
        </div>
        <p className={styles.subtitle}>Wähle dein Level!</p>
        <div className={styles.levelGrid}>
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              className={`${styles.levelCard} ${styles[`lv${lvl}`]}`}
              onClick={() => startLevel(lvl)}
            >
              <span className={styles.lvStars}>{'⭐'.repeat(lvl)}</span>
              <div className={styles.lvInfo}>
                <span className={styles.lvTitle}>Level {lvl}</span>
                <span className={styles.lvLabel}>{config[lvl].label}</span>
              </div>
              <span className={styles.lvArrow}>›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = calcStars(score, TOTAL)
    return (
      <div className={styles.page}>
        <div className={styles.result}>
          <div className={styles.resultEmoji}>
            {stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}
          </div>
          <h2 className={styles.resultTitle}>
            {stars === 3 ? 'Perfekt!' : stars === 2 ? 'Super gemacht!' : 'Weiter üben!'}
          </h2>
          <p className={styles.resultScore}>{score} von {TOTAL} richtig</p>
          <div className={styles.resultStars}>{'⭐'.repeat(stars)}</div>
          <div className={styles.resultActions}>
            <button
              className={`${styles.primaryBtn} ${styles.greenBtn}`}
              onClick={() => startLevel(level)}
            >
              Nochmal spielen
            </button>
            <button
              className={`${styles.primaryBtn} ${styles.grayBtn}`}
              onClick={() => navigate('/app')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => setPhase('levelSelect')}>←</button>
        <span className={styles.badge}>{gameTitle} · L{level}</span>
        <button
          className={styles.speakBtn}
          onClick={() => speak(speakQuestion(round))}
        >🔊</button>
      </div>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(idx / TOTAL) * 100}%` }} />
        </div>
        <div className={styles.progressLabel}>{idx + 1} / {TOTAL}</div>
      </div>

      {/* Question display (game-specific) */}
      <div className={styles.questionBox}>
        {renderQuestion(round)}
      </div>

      {/* Option buttons */}
      <div className={styles.optionGrid}>
        {round.options.map((opt) => {
          let cls = styles.optionBtn
          if (selected !== null) {
            if (opt === round.answer)   cls += ' ' + styles.optCorrect
            else if (opt === selected)  cls += ' ' + styles.optWrong
          }
          return (
            <button
              key={String(opt)}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
            >
              {formatOption(opt)}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <>
          <div className={`${styles.feedback} ${selected === round.answer ? styles.feedbackGreen : styles.feedbackRed}`}>
            <span>{selected === round.answer ? '✅' : '❌'}</span>
            <span>
              {selected === round.answer
                ? 'Richtig! 🎉'
                : `Richtig wäre: ${formatOption(round.answer)}`}
            </span>
          </div>
          <button
            className={`${styles.primaryBtn} ${styles.greenBtn}`}
            onClick={handleWeiter}
          >
            {idx + 1 >= TOTAL ? 'Ergebnis ansehen 🏆' : 'Weiter →'}
          </button>
        </>
      )}
    </div>
  )
}
