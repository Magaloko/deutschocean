import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete, speak } from '../../../lib/sounds.js'
import styles from './FruechtZaehlen.module.css'

// ─── Früchte-Liste ─────────────────────────────────────────────────────────
const FRUITS = [
  { emoji: '🍎', name: 'Äpfel' },
  { emoji: '🍌', name: 'Bananen' },
  { emoji: '🍊', name: 'Orangen' },
  { emoji: '🍓', name: 'Erdbeeren' },
  { emoji: '🍇', name: 'Trauben' },
  { emoji: '🍉', name: 'Wassermelonen' },
  { emoji: '🍑', name: 'Pfirsiche' },
  { emoji: '🍒', name: 'Kirschen' },
  { emoji: '🥝', name: 'Kiwis' },
  { emoji: '🍋', name: 'Zitronen' },
  { emoji: '🫐', name: 'Blaubeeren' },
  { emoji: '🍍', name: 'Ananas' },
  { emoji: '🥭', name: 'Mangos' },
  { emoji: '🍐', name: 'Birnen' },
  { emoji: '🍈', name: 'Melonen' },
]

const LEVEL_CONFIG = {
  1: { min: 1,  max: 5,  rounds: 8,  missionId: 'fruechtZaehlen-1', label: 'Leicht' },
  2: { min: 3,  max: 12, rounds: 8,  missionId: 'fruechtZaehlen-2', label: 'Mittel' },
  3: { min: 8,  max: 20, rounds: 8,  missionId: 'fruechtZaehlen-3', label: 'Schwer' },
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateOptions(correct, min, max) {
  const opts = new Set([correct])
  let attempts = 0
  while (opts.size < 4 && attempts < 50) {
    attempts++
    const delta = randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1)
    const candidate = correct + delta
    if (candidate >= 1 && candidate <= max + 4 && candidate !== correct) {
      opts.add(candidate)
    }
  }
  // fill with sequential if needed
  let fill = correct + 1
  while (opts.size < 4) {
    if (fill !== correct) opts.add(fill)
    fill++
  }
  return shuffle([...opts])
}

function buildRounds(level) {
  const cfg = LEVEL_CONFIG[level]
  const rounds = []
  const usedFruits = new Set()
  for (let i = 0; i < cfg.rounds; i++) {
    // pick a fruit (avoid repeats when possible)
    let availFruits = FRUITS.filter(f => !usedFruits.has(f.emoji))
    if (availFruits.length === 0) { usedFruits.clear(); availFruits = FRUITS }
    const fruit = availFruits[randInt(0, availFruits.length - 1)]
    usedFruits.add(fruit.emoji)

    const count = randInt(cfg.min, cfg.max)
    const options = generateOptions(count, cfg.min, cfg.max)
    rounds.push({ fruit, count, options })
  }
  return rounds
}

function calcStars(score, total) {
  if (score === total) return 3
  if (score >= Math.ceil(total * 0.7)) return 2
  return 1
}

export default function FruechtZaehlen() {
  const navigate  = useNavigate()
  const { completeSession, saving } = useProgress()

  const [level,    setLevel]    = useState(null)
  const [rounds,   setRounds]   = useState([])
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [phase,    setPhase]    = useState('playing')

  const cfg   = level ? LEVEL_CONFIG[level] : null
  const round = rounds[idx]
  const TOTAL = rounds.length

  // Auto-speak bei jeder neuen Runde
  useEffect(() => {
    if (phase === 'playing' && round) {
      speak(`Wie viele ${round.fruit.name} siehst du?`)
    }
  }, [round, phase])

  function startLevel(lvl) {
    setLevel(lvl)
    setRounds(buildRounds(lvl))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setPhase('playing')
  }

  function handleSelect(opt) {
    if (selected !== null) return
    setSelected(opt)
    const correct = opt === round.count
    if (correct) { playCorrect(); setScore(s => s + 1) }
    else           playWrong()
  }

  function handleWeiter() {
    if (idx + 1 >= TOTAL) {
      playComplete()
      setPhase('result')
      const lastCorrect = selected === round.count ? 1 : 0
      const finalScore = score + lastCorrect
      const stars = calcStars(finalScore, TOTAL)
      completeSession({ missionId: cfg.missionId, xpEarned: finalScore * 2 + 5, stars })
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  // ── Level-Auswahl ───────────────────────────────────────────────────────
  if (!level) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
          <h1 className={styles.title}>Früchte Zählen 🍎</h1>
          <div />
        </div>
        <p className={styles.subtitle}>Zähle die Früchte und tippe die richtige Zahl!</p>
        <div className={styles.levelGrid}>
          <button className={`${styles.levelCard} ${styles.lv1}`} onClick={() => startLevel(1)}>
            <span className={styles.lvStars}>⭐</span>
            <div className={styles.lvInfo}>
              <span className={styles.lvTitle}>Level 1</span>
              <span className={styles.lvLabel}>Zahlen 1–5</span>
            </div>
            <span className={styles.lvArrow}>›</span>
          </button>
          <button className={`${styles.levelCard} ${styles.lv2}`} onClick={() => startLevel(2)}>
            <span className={styles.lvStars}>⭐⭐</span>
            <div className={styles.lvInfo}>
              <span className={styles.lvTitle}>Level 2</span>
              <span className={styles.lvLabel}>Zahlen 3–12</span>
            </div>
            <span className={styles.lvArrow}>›</span>
          </button>
          <button className={`${styles.levelCard} ${styles.lv3}`} onClick={() => startLevel(3)}>
            <span className={styles.lvStars}>⭐⭐⭐</span>
            <div className={styles.lvInfo}>
              <span className={styles.lvTitle}>Level 3</span>
              <span className={styles.lvLabel}>Zahlen 8–20</span>
            </div>
            <span className={styles.lvArrow}>›</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = calcStars(score, TOTAL)
    return (
      <div className={styles.page}>
        <div className={styles.result}>
          <div className={styles.resultEmoji}>{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}</div>
          <h2 className={styles.resultTitle}>{stars === 3 ? 'Perfekt gezählt!' : stars === 2 ? 'Super gemacht!' : 'Weiter üben!'}</h2>
          <p className={styles.resultScore}>{score} von {TOTAL} richtig</p>
          <div className={styles.resultStars}>{'⭐'.repeat(stars)}</div>
          <div className={styles.resultActions}>
            <button className={`${styles.primaryBtn} ${styles.lv1Bg}`} onClick={() => startLevel(level)}>
              Nochmal spielen
            </button>
            <button className={`${styles.primaryBtn} ${styles.grayBg}`} onClick={() => navigate('/app')}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Spielfeld ────────────────────────────────────────────────────────────
  const isLarge = round.count > 12
  const isMedium = round.count > 7

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => setLevel(null)}>←</button>
        <span className={styles.badge}>🍎 Level {level}</span>
        <button className={styles.speakBtn} onClick={() => speak(`Wie viele ${round.fruit.name} siehst du?`)}>🔊</button>
      </div>

      {/* Fortschritt */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(idx / TOTAL) * 100}%` }} />
        </div>
        <div className={styles.progressLabel}>{idx + 1} / {TOTAL}</div>
      </div>

      {/* Früchte-Display */}
      <div className={`${styles.fruitBox} ${selected !== null ? (selected === round.count ? 'bounce' : 'shake') : ''}`}>
        <div className={`${styles.fruitGrid} ${isLarge ? styles.fruitGridLarge : isMedium ? styles.fruitGridMedium : ''}`}>
          {Array.from({ length: round.count }, (_, i) => (
            <span key={i} className={styles.fruitItem}>{round.fruit.emoji}</span>
          ))}
        </div>
      </div>

      {/* Frage */}
      <p className={styles.question}>
        Wie viele <strong>{round.fruit.name}</strong> siehst du?
      </p>

      {/* Antwort-Buttons */}
      <div className={styles.optionGrid}>
        {round.options.map((opt) => {
          let cls = styles.optionBtn
          if (selected !== null) {
            if (opt === round.count)      cls += ' ' + styles.optCorrect
            else if (opt === selected)    cls += ' ' + styles.optWrong
          }
          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <>
          <div className={`${styles.feedback} ${selected === round.count ? styles.feedbackGreen : styles.feedbackRed}`}>
            <span>{selected === round.count ? '✅' : '❌'}</span>
            <span>
              {selected === round.count
                ? `Richtig! Es sind ${round.count} ${round.fruit.name}.`
                : `Es sind ${round.count} ${round.fruit.name}!`}
            </span>
          </div>
          <button className={`${styles.primaryBtn} ${styles.lv1Bg}`} onClick={handleWeiter}>
            {idx + 1 >= TOTAL ? 'Ergebnis ansehen 🏆' : 'Weiter →'}
          </button>
        </>
      )}
    </div>
  )
}
