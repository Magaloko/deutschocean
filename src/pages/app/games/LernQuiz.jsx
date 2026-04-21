import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import Icon from '../../../components/ui/Icon.jsx'
import { RefreshCw } from 'lucide-react'
import styles from './LernQuiz.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const ANSWER_LABELS = ['A', 'B', 'C', 'D']

/**
 * Generic quiz engine for all Fächer.
 *
 * Props:
 *  fachId        string    e.g. 'roboter'
 *  fachLabel     string    e.g. 'Roboter-Schule'
 *  fachEmoji     string    e.g. '🤖'
 *  fachColor     string    e.g. '#6366f1'
 *  levels        object    { 0: {label, emoji, desc}, 1: ..., 2: ... }
 *  fragen        object    { 0: [...], 1: [...], 2: [...] }
 *  missionPrefix string    e.g. 'roboter-quiz'
 */
export default function LernQuiz({ fachId, fachLabel, fachEmoji, fachColor, levels, fragen, missionPrefix }) {
  const navigate = useNavigate()
  const { completeSession } = useProgress()

  const [phase, setPhase]       = useState('levelSelect') // levelSelect | playing | result
  const [activeLevel, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState(null) // chosen option index
  const [score, setScore]       = useState(0)

  const currentQ = questions[idx]
  const answered = selected !== null
  const total    = questions.length

  function startLevel(lvl) {
    const pool = fragen[lvl] ?? []
    const picked = shuffle(pool).slice(0, 8).map(q => ({
      ...q,
      shuffledOptions: shuffle(q.options.map((text, i) => ({ text, correct: i === q.a }))),
    }))
    setQuestions(picked)
    setLevel(lvl)
    setIdx(0)
    setSelected(null)
    setScore(0)
    setPhase('playing')
  }

  const handleSelect = useCallback((optIdx) => {
    if (answered) return
    setSelected(optIdx)
    const correct = questions[idx].shuffledOptions[optIdx].correct
    if (correct) { setScore(s => s + 1); playCorrect() } else { playWrong() }
  }, [answered, idx, questions])

  function handleNext() {
    if (idx + 1 >= total) {
      setPhase('result')
      playComplete()
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1
    await completeSession({
      missionId: `${missionPrefix}-${activeLevel}`,
      xpEarned: score * 3,
      stars,
      correct: score,
      total,
    })
    navigate('/app')
  }

  // ── Level-Select Screen ───────────────────────────────────────────────
  if (phase === 'levelSelect') {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>
          <Icon emoji="←" size={16} /> Zurück
        </button>
        <div className={styles.header} style={{ '--color': fachColor }}>
          <span className={styles.headerEmoji}>
            <Icon emoji={fachEmoji} size={40} color={fachColor} />
          </span>
          <h1 className={styles.headerTitle}>{fachLabel}</h1>
        </div>
        <p className={styles.intro}>Wähle dein Level und beweise dein Wissen!</p>
        <div className={styles.levelGrid}>
          {Object.entries(levels).map(([lvl, meta]) => (
            <button
              key={lvl}
              className={styles.levelCard}
              style={{ '--color': fachColor }}
              onClick={() => startLevel(Number(lvl))}
            >
              <span className={styles.levelEmoji}>
                <Icon emoji={meta.emoji} size={36} color={fachColor} />
              </span>
              <span className={styles.levelLabel}>{meta.label}</span>
              <span className={styles.levelDesc}>{meta.desc}</span>
              <span className={styles.levelStart}>
                <Icon emoji="▶" size={14} color={fachColor} /> Starten
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Result Screen ─────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((score / total) * 100)
    const stars = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1
    const msg = stars === 3
      ? 'Perfekt! Du bist ein echter Profi!'
      : stars === 2
        ? 'Super gemacht! Noch ein bisschen üben!'
        : 'Weiter so! Übung macht den Meister!'

    return (
      <div className={styles.page}>
        <div className={styles.resultCard} style={{ '--color': fachColor }}>
          <div className={styles.resultEmoji}>
            <Icon emoji={fachEmoji} size={56} color={fachColor} />
          </div>
          <h2 className={styles.resultTitle}>{msg}</h2>
          <div className={styles.resultScore}>{score}/{total} richtig ({pct}%)</div>
          <div className={styles.resultStars}>
            {[1,2,3].map(n => (
              <span key={n} className={n <= stars ? styles.starOn : styles.starOff}>
                <Icon emoji="⭐" size={28} color={n <= stars ? '#fbbf24' : '#d1d5db'} />
              </span>
            ))}
          </div>
          <div className={styles.resultXp}>+{score * 3} XP verdient!</div>
          <div className={styles.resultBtns}>
            <button className={styles.btnPrimary} style={{ background: fachColor, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleFinish}>
              <Icon emoji="✓" size={16} color="#fff" /> Fertig & XP kassieren
            </button>
            <button className={styles.btnSecondary} onClick={() => startLevel(activeLevel)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} /> Nochmal spielen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing Screen ────────────────────────────────────────────────────
  const levelMeta = levels[activeLevel]

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => setPhase('levelSelect')}>
          <Icon emoji="←" size={16} /> Level
        </button>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(idx / total) * 100}%`, background: fachColor }}
            />
          </div>
          <span className={styles.progressLabel}>{idx + 1}/{total}</span>
        </div>
        <span className={styles.scoreChip} style={{ background: `${fachColor}20`, color: fachColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Icon emoji="✓" size={14} color={fachColor} /> {score}
        </span>
      </div>

      <div className={styles.levelPill} style={{ background: `${fachColor}18`, color: fachColor, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <Icon emoji={levelMeta.emoji} size={16} color={fachColor} /> {levelMeta.label}
      </div>

      <div className={styles.questionCard}>
        <p className={styles.question}>{currentQ.q}</p>
      </div>

      <div className={styles.options}>
        {currentQ.shuffledOptions.map((opt, i) => {
          let cls = styles.option
          if (answered) {
            if (opt.correct)           cls = `${styles.option} ${styles.optionCorrect}`
            else if (i === selected)   cls = `${styles.option} ${styles.optionWrong}`
          } else if (i === selected) {
            cls = `${styles.option} ${styles.optionSelected}`
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={answered}>
              <span className={styles.optionLabel} style={{ background: fachColor }}>{ANSWER_LABELS[i]}</span>
              <span className={styles.optionText}>{opt.text}</span>
              {answered && opt.correct && <span className={styles.tick}><Icon emoji="✓" size={18} color="#10b981" /></span>}
              {answered && !opt.correct && i === selected && <span className={styles.cross}><Icon emoji="❌" size={18} color="#ef4444" /></span>}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={styles.feedback}>
          {currentQ.shuffledOptions[selected]?.correct
            ? <span className={styles.feedbackCorrect} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Icon emoji="🎉" size={18} /> Richtig! Weiter so!</span>
            : <span className={styles.feedbackWrong} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Icon emoji="❌" size={18} /> Nicht ganz — die grüne Antwort war richtig!</span>}
          <button className={styles.nextBtn} style={{ background: fachColor, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleNext}>
            {idx + 1 >= total ? <><Icon emoji="📊" size={16} color="#fff" /> Ergebnis sehen</> : 'Weiter →'}
          </button>
        </div>
      )}
    </div>
  )
}
