import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { EMOTIONEN_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

export default function EmotionenSpiel() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [runden] = useState(() =>
    shuffle(EMOTIONEN_RUNDEN).slice(0, TOTAL).map((r) => ({
      question: r.question,
      targetEmotion: r.targetEmotion,
      shuffledFaces: shuffle(r.faces),
    }))
  )

  const [idx, setIdx]             = useState(0)
  const [selected, setSelected]   = useState(null)
  const [score, setScore]         = useState(0)
  const [gamePhase, setGamePhase] = useState('playing') // 'playing' | 'result'

  const runde = runden[idx]

  function handleSelect(face) {
    if (selected) return
    setSelected(face)
    if (face.isTarget) { setScore((s) => s + 1); playCorrect() } else { playWrong() }
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
    playComplete()
    await completeSession({ missionId: 'emotionen-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (gamePhase === 'result') {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '😊' : '🌟'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Gefühls-Profi!' : 'Gut gemacht!'}</h1>
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

  const targetFace = runde.shuffledFaces.find((f) => f.isTarget)

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>😊</span>
          <h1 className={styles.gameTitle}>Gefühle</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <div className={styles.emotionQuestion}>
          {runde.question}
        </div>

        <div className={styles.emotionGrid}>
          {runde.shuffledFaces.map((face, i) => (
            <button
              key={i}
              onClick={() => handleSelect(face)}
              disabled={!!selected}
              className={[
                styles.emotionBtn,
                selected
                  ? face.isTarget
                    ? styles.btnCorrect
                    : selected === face
                      ? styles.btnWrong
                      : ''
                  : '',
              ].join(' ')}
            >
              <span className={styles.emotionEmoji}>{face.emoji}</span>
              <span className={styles.emotionLabel}>{face.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <>
            <div className={`${styles.resultBanner} ${selected.isTarget ? styles.resultGreen : styles.resultRed}`}>
              {selected.isTarget
                ? `✓ Richtig! ${targetFace.emoji} ist ${runde.targetEmotion}!`
                : `✗ ${targetFace.emoji} (${targetFace.label}) ist ${runde.targetEmotion}!`}
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
