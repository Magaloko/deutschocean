import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { TIER_SOUNDS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 6

function speak(text) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-AT'
  u.rate = 0.75
  u.pitch = 1.1
  window.speechSynthesis.speak(u)
}

export default function TierGeraeusche() {
  const navigate  = useNavigate()
  const { completeSession, saving } = useProgress()

  const [animals] = useState(() => shuffle(TIER_SOUNDS).slice(0, TOTAL))
  const [idx, setIdx]         = useState(0)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('playing')

  const current = animals[idx]

  const buildOptions = useCallback((animalId) => {
    const correct = TIER_SOUNDS.find(t => t.id === animalId)
    const others  = shuffle(TIER_SOUNDS.filter(t => t.id !== animalId)).slice(0, 3)
    setOptions(shuffle([correct, ...others]))
    setSelected(null)
  }, [])

  useEffect(() => {
    if (current) {
      buildOptions(current.id)
      // Auto-play sound after short delay
      const t = setTimeout(() => speak(current.tts), 400)
      return () => clearTimeout(t)
    }
  }, [idx, current, buildOptions])

  function handleSelect(animal) {
    if (selected) return
    setSelected(animal.id)
    if (animal.id === current.id) { setScore(s => s + 1); playCorrect() } else { playWrong() }
    setTimeout(() => {
      if (idx + 1 >= TOTAL) {
        setPhase('result')
      } else {
        setIdx(i => i + 1)
      }
    }, 1400)
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({ missionId: 'tier-geraeusche-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🐾' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Tier-Experte!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 4 ? 2 : 1)}</Badge>
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
          <span className={styles.gameEmoji}>🐾</span>
          <h1 className={styles.gameTitle}>Tiergeräusche</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>Welches Tier macht dieses <strong>Geräusch</strong>?</p>

        <div className={styles.soundBubble}>
          <div className={styles.soundText}>{current?.sound}</div>
          <button className={styles.soundPlayBtn} onClick={() => speak(current.tts)}>
            🔊 Nochmal hören
          </button>
        </div>

        <div className={styles.animalGrid}>
          {options.map(animal => {
            const isChosen  = selected === animal.id
            const isCorrect = selected && animal.id === current.id
            const isWrong   = isChosen && animal.id !== current.id
            return (
              <button
                key={animal.id}
                className={[
                  styles.animalBtn,
                  isCorrect ? styles.animalBtnCorrect : '',
                  isWrong   ? styles.animalBtnWrong   : '',
                ].join(' ')}
                onClick={() => handleSelect(animal)}
                disabled={!!selected}
              >
                <span>{animal.emoji}</span>
                <span className={styles.animalName}>{animal.animal}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <div className={styles.progressDots}>
        {animals.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
