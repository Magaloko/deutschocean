import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { WAS_FEHLT_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5
const SHOW_MS = 3000

export default function WasFehlt() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [runden] = useState(() =>
    shuffle(WAS_FEHLT_RUNDEN).slice(0, TOTAL).map((r) => {
      const missingIdx = Math.floor(Math.random() * r.emoji.length)
      const allItems   = r.emoji.map((e, i) => ({ emoji: e, label: r.labels[i] }))
      const missing    = allItems[missingIdx]
      const visible    = allItems.filter((_, i) => i !== missingIdx)
      const distractors = shuffle(allItems.filter((_, i) => i !== missingIdx)).slice(0, 2)
      const choices    = shuffle([
        { ...missing, correct: true },
        ...distractors.map((d) => ({ ...d, correct: false })),
      ])
      return { allItems, visible, missing, choices }
    })
  )

  const [idx, setIdx]         = useState(0)
  const [phase, setPhase]     = useState('memorize') // 'memorize' | 'guess'
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [gamePhase, setGamePhase] = useState('playing') // 'playing' | 'result'

  const runde = runden[idx]

  useEffect(() => {
    if (phase !== 'memorize') return
    const t = setTimeout(() => setPhase('guess'), SHOW_MS)
    return () => clearTimeout(t)
  }, [phase, idx])

  function handleChoice(choice) {
    if (selected) return
    setSelected(choice)
    if (choice.correct) setScore((s) => s + 1)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setGamePhase('result')
    } else {
      setIdx((i) => i + 1)
      setPhase('memorize')
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    await completeSession({ missionId: 'was-fehlt-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (gamePhase === 'result') {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🕵️' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Super Detektiv!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
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

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔍</span>
          <h1 className={styles.gameTitle}>Was fehlt?</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {phase === 'memorize' ? (
          <>
            <div className={styles.targetDisplay}>
              <span>Merke dir alle Bilder! 👀</span>
            </div>
            <div className={styles.timerBar}>
              <div key={idx} className={`${styles.timerFill} ${styles.timerShrink}`} />
            </div>
            <div className={styles.kidsGrid}>
              {runde.allItems.map((item, i) => (
                <div key={i} className={styles.kidsEmojiBig}>{item.emoji}</div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.targetDisplay}>
              <span>Was fehlt? 🤔</span>
            </div>
            <div className={styles.kidsGrid}>
              {runde.visible.map((item, i) => (
                <div key={i} className={styles.kidsEmojiBig}>{item.emoji}</div>
              ))}
              <div className={`${styles.kidsEmojiBig} ${styles.emojiMissing}`}>❓</div>
            </div>

            <div className={styles.choiceRow}>
              {runde.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(c)}
                  disabled={!!selected}
                  className={[
                    styles.emojiChoiceBtn,
                    selected
                      ? c.correct
                        ? styles.choiceCorrect
                        : selected === c
                          ? styles.choiceWrong
                          : ''
                      : '',
                  ].join(' ')}
                >
                  <span className={styles.choiceEmoji}>{c.emoji}</span>
                  <span className={styles.choiceLabel}>{c.label}</span>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className={`${styles.resultBanner} ${selected.correct ? styles.resultGreen : styles.resultRed}`}>
                  {selected.correct
                    ? `✓ Richtig! ${runde.missing.emoji} ${runde.missing.label} hat gefehlt!`
                    : `✗ ${runde.missing.emoji} ${runde.missing.label} hat gefehlt!`}
                </div>
                <div className={styles.actions}>
                  <Button onClick={handleNext} size="lg">
                    {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      <div className={styles.progressDots}>
        {runden.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
