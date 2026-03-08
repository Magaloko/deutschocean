import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FALSCHER_GEGENSTAND_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

export default function FalscherGegenstand() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [runden] = useState(() =>
    shuffle(FALSCHER_GEGENSTAND_RUNDEN).slice(0, TOTAL).map((r) => ({
      category: r.category,
      shuffledItems: shuffle(
        r.items.map((item, i) => ({ ...item, isWrong: i === r.wrongIdx }))
      ),
    }))
  )

  const [idx, setIdx]             = useState(0)
  const [selected, setSelected]   = useState(null)
  const [score, setScore]         = useState(0)
  const [gamePhase, setGamePhase] = useState('playing') // 'playing' | 'result'

  const runde = runden[idx]

  function handleSelect(item) {
    if (selected) return
    setSelected(item)
    if (item.isWrong) setScore((s) => s + 1)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setGamePhase('result')
    } else {
      setIdx((i) => i + 1)
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    await completeSession({ missionId: 'falscher-gegenstand-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (gamePhase === 'result') {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🎯' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Perfekt!' : 'Gut gemacht!'}</h1>
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

  const wrongItem = runde.shuffledItems.find((i) => i.isWrong)

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🎯</span>
          <h1 className={styles.gameTitle}>Falscher Gegenstand</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <div className={styles.targetDisplay}>
          <span>Was passt <strong>nicht</strong> dazu? 🤔</span>
        </div>

        <div className={styles.kidsGrid}>
          {runde.shuffledItems.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              disabled={!!selected}
              className={[
                styles.kidsEmojiBtn,
                selected
                  ? item.isWrong
                    ? styles.btnCorrect
                    : selected === item
                      ? styles.btnWrong
                      : ''
                  : '',
              ].join(' ')}
            >
              <span className={styles.kidsEmojiBtnEmoji}>{item.emoji}</span>
              <span className={styles.kidsEmojiBtnLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <>
            <div className={`${styles.resultBanner} ${selected.isWrong ? styles.resultGreen : styles.resultRed}`}>
              {selected.isWrong
                ? `✓ Richtig! ${wrongItem.emoji} passt nicht zu ${runde.category}!`
                : `✗ ${wrongItem.emoji} (${wrongItem.label}) passt nicht zu ${runde.category}!`}
            </div>
            <div className={styles.actions}>
              <Button onClick={handleNext} size="lg">
                {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
              </Button>
            </div>
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
