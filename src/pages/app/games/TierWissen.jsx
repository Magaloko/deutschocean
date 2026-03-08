import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { TIER_WISSEN_FRAGEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 8

function categoryClass(kat, s) {
  if (kat.startsWith('Essen'))       return s.kategorieEssen
  if (kat.startsWith('Produzieren')) return s.kategorieProduzieren
  if (kat.startsWith('Verwandt'))    return s.kategorieVerwandt
  if (kat.startsWith('Zuhause'))     return s.kategorieZuhause
  return ''
}

export default function TierWissen() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [fragen] = useState(() =>
    shuffle(TIER_WISSEN_FRAGEN).slice(0, TOTAL).map(f => ({
      ...f,
      options: shuffle([f.richtig, ...f.falsch]),
    }))
  )
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null) // index into options
  const [score,    setScore]    = useState(0)
  const [phase,    setPhase]    = useState('playing')

  const frage = fragen[idx]
  const answered = selected !== null

  function handleSelect(optIdx) {
    if (answered) return
    setSelected(optIdx)
    const correct = frage.options[optIdx].text === frage.richtig.text
    if (correct) { setScore(s => s + 1); playCorrect() } else { playWrong() }
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setPhase('result')
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({
      missionId: 'tier-wissen-1',
      xpEarned: score * 2,
      stars,
      correct: score,
      total: TOTAL,
    })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL ? '🦁' : '⭐'}</div>
        <h1 className={styles.resultTitle}>
          {score >= TOTAL ? 'Tier-Experte!' : 'Gut gemacht!'}
        </h1>
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

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.gamePage} fade-in`}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🦁</span>
          <h1 className={styles.gameTitle}>Tier-Wissen</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {/* Kategorie-Pill */}
        <div className={`${styles.tierWissenKategorie} ${categoryClass(frage.kategorie, styles)}`}>
          {frage.kategorie}
        </div>

        {/* Tier-Anzeige */}
        <div className={styles.tierWissenAnimal}>
          <div className={styles.tierWissenAnimalEmoji}>{frage.tier}</div>
          <div className={styles.tierWissenAnimalName}>{frage.tierName}</div>
        </div>

        {/* Frage */}
        <p className={styles.tierWissenFrage}>{frage.frage}</p>

        {/* Antwort-Buttons */}
        <div className={styles.tierWissenChoices}>
          {frage.options.map((opt, i) => {
            const isSelected = selected === i
            const isCorrect  = opt.text === frage.richtig.text
            let btnClass = styles.tierWissenChoiceBtn
            if (answered && isCorrect)           btnClass += ` ${styles.choiceBtnCorrect}`
            else if (answered && isSelected)     btnClass += ` ${styles.choiceBtnWrong}`

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleSelect(i)}
                disabled={answered}
              >
                <span className={styles.tierWissenChoiceEmoji}>{opt.emoji}</span>
                <span className={styles.tierWissenChoiceText}>{opt.text}</span>
              </button>
            )
          })}
        </div>

        {/* Fun-Fakt nach Antwort */}
        {answered && (
          <div className={`${styles.tierWissenFakt} ${styles.tierWissenFaktIn}`}>
            {frage.fakt}
          </div>
        )}

        {/* Weiter-Button */}
        {answered && (
          <div className={styles.actions}>
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          </div>
        )}
      </Card>

      {/* Fortschritts-Punkte */}
      <div className={styles.progressDots}>
        {fragen.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
